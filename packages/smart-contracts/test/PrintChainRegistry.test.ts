// test/PrintChainRegistry.test.ts
import { expect } from 'chai'
import hre from 'hardhat'

describe('PrintChainRegistry', function () {
  let registry: any
  let owner: any
  let designer: any

  beforeEach(async function () {
    [owner, designer] = await hre.ethers.getSigners()

    const Registry = await hre.ethers.getContractFactory('PrintChainRegistry')
    registry = await Registry.deploy()
    await registry.waitForDeployment()
  })

  it('Should register a design', async function () {
    const ipfsHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes('design-1'))

    const tx = await registry.registerDesign(ipfsHash, designer.address)
    await expect(tx)
      .to.emit(registry, 'DesignRegistered')
      .withArgs(1, ipfsHash, designer.address)

    const design = await registry.getDesign(1)
    expect(design.ipfsHash).to.equal(ipfsHash)
    expect(design.designer).to.equal(designer.address)
  })

  it('Should prevent duplicate design registration', async function () {
    const ipfsHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes('design-1'))

    await registry.registerDesign(ipfsHash, designer.address)

    await expect(
      registry.registerDesign(ipfsHash, designer.address)
    ).to.be.revertedWithCustomError(registry, 'DesignAlreadyExists')
  })

  it('Should retrieve designer designs', async function () {
    const ipfsHash1 = hre.ethers.keccak256(hre.ethers.toUtf8Bytes('design-1'))
    const ipfsHash2 = hre.ethers.keccak256(hre.ethers.toUtf8Bytes('design-2'))

    await registry.registerDesign(ipfsHash1, designer.address)
    await registry.registerDesign(ipfsHash2, designer.address)

    const designs = await registry.getDesignerDesigns(designer.address)
    expect(designs.length).to.equal(2)
  })

  it('Should deactivate a design', async function () {
    const ipfsHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes('design-1'))

    await registry.registerDesign(ipfsHash, designer.address)
    await registry.deactivateDesign(1)

    await expect(registry.getDesign(1)).to.be.revertedWithCustomError(
      registry,
      'DesignNotFound'
    )
  })
})
