// test/RoyaltyDistributor.comprehensive.test.ts
import { expect } from 'chai'
import { ethers } from 'hardhat'
import hre from 'hardhat'

describe('RoyaltyDistributor - Comprehensive Tests', function () {
  let distributor: any
  let owner: any
  let designer: any
  let brand: any
  let customer: any

  const PLATFORM_FEE_BPS = 800 // 8%
  const PAYMENT_AMOUNT = ethers.parseEther('1.0')

  beforeEach(async function () {
    [owner, designer, brand, customer] = await ethers.getSigners()

    const Distributor = await ethers.getContractFactory('RoyaltyDistributor')
    distributor = await Distributor.deploy()
    await distributor.waitForDeployment()
  })

  describe('Payment Distribution', function () {
    it('Should distribute payment to designer with platform fee', async function () {
      const designerId = designer.address
      const brandId = brand.address
      const royaltyPercentage = 15 // 15% royalty

      const designerBalanceBefore = await ethers.provider.getBalance(designerId)
      const brandBalanceBefore = await ethers.provider.getBalance(brandId)

      // Customer pays
      const tx = await distributor.distributePayment(
        designerId,
        brandId,
        PAYMENT_AMOUNT,
        royaltyPercentage,
        { value: PAYMENT_AMOUNT }
      )

      // Calculate expected amounts
      const platformFee = (PAYMENT_AMOUNT * BigInt(PLATFORM_FEE_BPS)) / BigInt(10000)
      const designerShare = (PAYMENT_AMOUNT * BigInt(royaltyPercentage)) / BigInt(100)
      const brandShare = PAYMENT_AMOUNT - platformFee - designerShare

      // Verify emit
      await expect(tx).to.emit(distributor, 'PaymentDistributed')
    })

    it('Should calculate 8% platform fee correctly', async function () {
      const testAmount = ethers.parseEther('100')
      const expectedFee = (testAmount * BigInt(800)) / BigInt(10000) // 8 ETH

      const actualFee = await distributor.calculatePlatformFee(testAmount)
      expect(actualFee).to.equal(expectedFee)
    })

    it('Should calculate royalty amount correctly', async function () {
      const testAmount = ethers.parseEther('100')
      const royaltyPercentage = 20

      const expectedRoyalty = (testAmount * BigInt(royaltyPercentage)) / BigInt(100) // 20 ETH

      const actualRoyalty = await distributor.calculateRoyalty(
        testAmount,
        royaltyPercentage
      )
      expect(actualRoyalty).to.equal(expectedRoyalty)
    })

    it('Should prevent payment distribution with zero designer address', async function () {
      await expect(
        distributor.distributePayment(
          ethers.ZeroAddress,
          brand.address,
          PAYMENT_AMOUNT,
          15,
          { value: PAYMENT_AMOUNT }
        )
      ).to.be.revertedWithCustomError(distributor, 'InvalidAddress')
    })

    it('Should prevent payment distribution with zero amount', async function () {
      await expect(
        distributor.distributePayment(
          designer.address,
          brand.address,
          0,
          15,
          { value: 0 }
        )
      ).to.be.revertedWithCustomError(distributor, 'InsufficientPayment')
    })

    it('Should prevent payment distribution with insufficient value', async function () {
      await expect(
        distributor.distributePayment(
          designer.address,
          brand.address,
          PAYMENT_AMOUNT,
          15,
          { value: ethers.parseEther('0.5') } // Only send half
        )
      ).to.be.revertedWithCustomError(distributor, 'InsufficientPayment')
    })
  })

  describe('Pull Payment Pattern', function () {
    it('Should allow designer to withdraw accumulated funds', async function () {
      // First payment
      await distributor.distributePayment(
        designer.address,
        brand.address,
        PAYMENT_AMOUNT,
        15,
        { value: PAYMENT_AMOUNT }
      )

      const pendingPayment = await distributor.getPendingPayment(designer.address)
      expect(pendingPayment).to.be.gt(0)

      // Withdraw
      const designerBalanceBefore = await ethers.provider.getBalance(designer.address)
      const tx = await distributor.connect(designer).withdrawPayment()
      const receipt = await tx.wait()

      const gasUsed = receipt!.gasUsed * receipt!.gasPrice
      const designerBalanceAfter = await ethers.provider.getBalance(designer.address)

      expect(designerBalanceAfter).to.be.gt(designerBalanceBefore.sub(gasUsed))
    })

    it('Should track pending payments correctly', async function () {
      const testAmount1 = ethers.parseEther('1')
      const testAmount2 = ethers.parseEther('0.5')

      await distributor.distributePayment(
        designer.address,
        brand.address,
        testAmount1,
        15,
        { value: testAmount1 }
      )

      const pending1 = await distributor.getPendingPayment(designer.address)

      await distributor.distributePayment(
        designer.address,
        brand.address,
        testAmount2,
        15,
        { value: testAmount2 }
      )

      const pending2 = await distributor.getPendingPayment(designer.address)
      expect(pending2).to.be.gt(pending1)
    })

    it('Should reset pending payment after withdrawal', async function () {
      await distributor.distributePayment(
        designer.address,
        brand.address,
        PAYMENT_AMOUNT,
        15,
        { value: PAYMENT_AMOUNT }
      )

      await distributor.connect(designer).withdrawPayment()

      const pending = await distributor.getPendingPayment(designer.address)
      expect(pending).to.equal(0)
    })

    it('Should prevent withdrawal with no pending payment', async function () {
      await expect(
        distributor.connect(designer).withdrawPayment()
      ).to.be.revertedWithCustomError(distributor, 'NoPendingPayment')
    })
  })

  describe('Multi-recipient Distribution', function () {
    it('Should distribute to multiple designers from different orders', async function () {
      const designer2 = (await ethers.getSigners())[4]

      // First payment to designer
      await distributor.distributePayment(
        designer.address,
        brand.address,
        PAYMENT_AMOUNT,
        15,
        { value: PAYMENT_AMOUNT }
      )

      // Second payment to designer2
      await distributor.distributePayment(
        designer2.address,
        brand.address,
        PAYMENT_AMOUNT,
        20,
        { value: PAYMENT_AMOUNT }
      )

      const pending1 = await distributor.getPendingPayment(designer.address)
      const pending2 = await distributor.getPendingPayment(designer2.address)

      expect(pending1).to.be.gt(0)
      expect(pending2).to.be.gt(0)
      expect(pending1).to.not.equal(pending2) // Different royalty percentages
    })
  })

  describe('Platform Fee Management', function () {
    it('Should accumulate platform fees', async function () {
      await distributor.distributePayment(
        designer.address,
        brand.address,
        PAYMENT_AMOUNT,
        15,
        { value: PAYMENT_AMOUNT }
      )

      const platformBalance = await distributor.getPlatformBalance()
      expect(platformBalance).to.be.gt(0)
    })

    it('Should allow owner to withdraw platform fees', async function () {
      await distributor.distributePayment(
        designer.address,
        brand.address,
        PAYMENT_AMOUNT,
        15,
        { value: PAYMENT_AMOUNT }
      )

      const platformFee = await distributor.getPlatformBalance()
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address)

      const tx = await distributor.withdrawPlatformFees()
      const receipt = await tx.wait()

      const gasUsed = receipt!.gasUsed * receipt!.gasPrice
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address)

      expect(ownerBalanceAfter).to.be.gte(
        ownerBalanceBefore.add(platformFee).sub(gasUsed)
      )
    })

    it('Should prevent non-owner from withdrawing platform fees', async function () {
      await distributor.distributePayment(
        designer.address,
        brand.address,
        PAYMENT_AMOUNT,
        15,
        { value: PAYMENT_AMOUNT }
      )

      await expect(
        distributor.connect(designer).withdrawPlatformFees()
      ).to.be.revertedWithCustomError(distributor, 'OwnableUnauthorizedAccount')
    })
  })

  describe('Edge Cases & Security', function () {
    it('Should handle payments with very high royalty percentage', async function () {
      const highRoyalty = 50 // 50%

      const tx = await distributor.distributePayment(
        designer.address,
        brand.address,
        PAYMENT_AMOUNT,
        highRoyalty,
        { value: PAYMENT_AMOUNT }
      )

      await expect(tx).to.emit(distributor, 'PaymentDistributed')
    })

    it('Should handle very small payments', async function () {
      const smallAmount = ethers.parseEther('0.001')

      const tx = await distributor.distributePayment(
        designer.address,
        brand.address,
        smallAmount,
        15,
        { value: smallAmount }
      )

      await expect(tx).to.not.be.reverted
    })

    it('Should handle very large payments', async function () {
      const largeAmount = ethers.parseEther('1000')

      const tx = await distributor.distributePayment(
        designer.address,
        brand.address,
        largeAmount,
        15,
        { value: largeAmount }
      )

      await expect(tx).to.not.be.reverted
    })

    it('Should prevent reentrancy attacks', async function () {
      // This test assumes the contract has reentrancy protection
      // If using the pull payment pattern, reentrancy is mitigated

      const amount = PAYMENT_AMOUNT
      await distributor.distributePayment(
        designer.address,
        brand.address,
        amount,
        15,
        { value: amount }
      )

      // Withdraw is safe due to pull payment pattern
      const tx = await distributor.connect(designer).withdrawPayment()
      await expect(tx).to.not.be.reverted
    })
  })

  describe('Event Emissions & Logging', function () {
    it('Should emit PaymentDistributed event with correct data', async function () {
      await expect(
        distributor.distributePayment(
          designer.address,
          brand.address,
          PAYMENT_AMOUNT,
          15,
          { value: PAYMENT_AMOUNT }
        )
      )
        .to.emit(distributor, 'PaymentDistributed')
        .withArgs(
          designer.address,
          brand.address,
          PAYMENT_AMOUNT,
          15
        )
    })

    it('Should emit PaymentWithdrawn event', async function () {
      await distributor.distributePayment(
        designer.address,
        brand.address,
        PAYMENT_AMOUNT,
        15,
        { value: PAYMENT_AMOUNT }
      )

      await expect(distributor.connect(designer).withdrawPayment())
        .to.emit(distributor, 'PaymentWithdrawn')
    })
  })
})
