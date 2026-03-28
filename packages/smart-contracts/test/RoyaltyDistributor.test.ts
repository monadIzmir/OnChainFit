// test/RoyaltyDistributor.test.ts
import { expect } from 'chai'
import hre from 'hardhat'

describe('RoyaltyDistributor', function () {
  let distributor: any
  let owner: any
  let designer: any
  let brand: any
  let platformWallet: any

  beforeEach(async function () {
    [owner, designer, brand, platformWallet] = await hre.ethers.getSigners()

    const Distributor = await hre.ethers.getContractFactory('RoyaltyDistributor')
    distributor = await Distributor.deploy(platformWallet.address)
    await distributor.waitForDeployment()
  })

  it('Should distribute payment correctly', async function () {
    const orderId = 1
    const grossAmount = hre.ethers.parseEther('100')
    const brandShare = hre.ethers.parseEther('10')
    const shippingAndTax = hre.ethers.parseEther('5')

    // Create signed message
    const messageHash = hre.ethers.keccak256(
      hre.ethers.solidityPacked(
        ['uint256', 'address', 'uint256', 'uint256'],
        [orderId, designer.address, grossAmount, shippingAndTax]
      )
    )

    const ethSignedMessageHash = hre.ethers.keccak256(
      hre.ethers.solidityPacked(
        ['string', 'bytes32'],
        ['\x19Ethereum Signed Message:\n32', messageHash]
      )
    )

    const signature = await owner.signMessage(hre.ethers.getBytes(messageHash))

    const params = {
      orderId,
      designer: designer.address,
      brand: brand.address,
      grossAmount,
      brandShareAmount: brandShare,
      shippingAndTax,
      backendSignature: signature,
    }

    // Fund the distributor
    await owner.sendTransaction({
      to: distributor.target,
      value: grossAmount,
    })

    await expect(distributor.distributePayment(params)).to.emit(
      distributor,
      'PayoutDistributed'
    )

    // Check pending balances
    const designerBalance = await distributor.getPendingBalance(designer.address)
    expect(designerBalance).to.be.gt(0)
  })

  it('Should prevent duplicate payout', async function () {
    const orderId = 1
    const grossAmount = hre.ethers.parseEther('100')

    const messageHash = hre.ethers.keccak256(
      hre.ethers.solidityPacked(
        ['uint256', 'address', 'uint256', 'uint256'],
        [orderId, designer.address, grossAmount, 0]
      )
    )

    const signature = await owner.signMessage(hre.ethers.getBytes(messageHash))

    const params = {
      orderId,
      designer: designer.address,
      brand: brand.address,
      grossAmount,
      brandShareAmount: 0,
      shippingAndTax: 0,
      backendSignature: signature,
    }

    await owner.sendTransaction({
      to: distributor.target,
      value: grossAmount,
    })

    await distributor.distributePayment(params)

    await expect(distributor.distributePayment(params)).to.be.revertedWithCustomError(
      distributor,
      'OrderAlreadyProcessed'
    )
  })

  it('Should update platform fee', async function () {
    const newFee = 1000 // 10%

    await distributor.updatePlatformFee(newFee)
    expect(await distributor.platformFeeBps()).to.equal(newFee)
  })

  it('Should prevent excessive fees', async function () {
    const excessiveFee = 2000 // 20% > 15% max

    await expect(distributor.updatePlatformFee(excessiveFee)).to.be.revertedWithCustomError(
      distributor,
      'MaxFeeExceeded'
    )
  })
})
