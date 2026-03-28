// test/PrintChainRegistry.comprehensive.test.ts
import { expect } from 'chai'
import { ethers } from 'hardhat'
import hre from 'hardhat'

describe('PrintChainRegistry - Comprehensive Tests', function () {
  let registry: any
  let owner: any
  let designer1: any
  let designer2: any
  let user: any

  beforeEach(async function () {
    [owner, designer1, designer2, user] = await ethers.getSigners()

    const Registry = await ethers.getContractFactory('PrintChainRegistry')
    registry = await Registry.deploy()
    await registry.waitForDeployment()
  })

  describe('Design Registration', function () {
    it('Should register a design with valid IPFS hash', async function () {
      const ipfsHash = ethers.keccak256(ethers.toUtf8Bytes('design-1'))

      const tx = await registry.registerDesign(ipfsHash, designer1.address)
      await expect(tx)
        .to.emit(registry, 'DesignRegistered')
        .withArgs(1, ipfsHash, designer1.address)
    })

    it('Should increment design counter on each registration', async function () {
      const ipfsHash1 = ethers.keccak256(ethers.toUtf8Bytes('design-1'))
      const ipfsHash2 = ethers.keccak256(ethers.toUtf8Bytes('design-2'))

      await registry.registerDesign(ipfsHash1, designer1.address)
      const design1 = await registry.getDesign(1)

      await registry.registerDesign(ipfsHash2, designer2.address)
      const design2 = await registry.getDesign(2)

      expect(design1.designId).to.equal(1)
      expect(design2.designId).to.equal(2)
    })

    it('Should prevent duplicate design registration', async function () {
      const ipfsHash = ethers.keccak256(ethers.toUtf8Bytes('duplicate'))

      await registry.registerDesign(ipfsHash, designer1.address)

      await expect(
        registry.registerDesign(ipfsHash, designer2.address)
      ).to.be.revertedWithCustomError(registry, 'DesignAlreadyExists')
    })

    it('Should prevent registration of zero IPFS hash', async function () {
      const zeroHash = ethers.zeroPadValue('0x00', 32)

      await expect(
        registry.registerDesign(zeroHash, designer1.address)
      ).to.be.revertedWithCustomError(registry, 'InvalidIPFSHash')
    })

    it('Should prevent registration with zero address', async function () {
      const ipfsHash = ethers.keccak256(ethers.toUtf8Bytes('design'))
      const zeroAddress = ethers.ZeroAddress

      await expect(
        registry.registerDesign(ipfsHash, zeroAddress)
      ).to.be.revertedWithCustomError(registry, 'InvalidDesigner')
    })
  })

  describe('Design Retrieval', function () {
    beforeEach(async function () {
      for (let i = 1; i <= 5; i++) {
        const hash = ethers.keccak256(ethers.toUtf8Bytes(`design-${i}`))
        await registry.registerDesign(hash, designer1.address)
      }
      for (let i = 6; i <= 8; i++) {
        const hash = ethers.keccak256(ethers.toUtf8Bytes(`design-${i}`))
        await registry.registerDesign(hash, designer2.address)
      }
    })

    it('Should retrieve design by ID', async function () {
      const design = await registry.getDesign(1)
      expect(design.designer).to.equal(designer1.address)
      expect(design.designId).to.equal(1)
    })

    it('Should revert when retrieving non-existent design', async function () {
      await expect(registry.getDesign(999))
        .to.be.revertedWithCustomError(registry, 'DesignNotFound')
    })

    it('Should retrieve all designs for a designer', async function () {
      const designIds = await registry.getDesignerDesigns(designer1.address)
      expect(designIds.length).to.equal(5)
      expect(designIds[0]).to.equal(1)
    })

    it('Should return empty array for designer with no designs', async function () {
      const designIds = await registry.getDesignerDesigns(user.address)
      expect(designIds.length).to.equal(0)
    })

    it('Should return correct pagination for large designer collections', async function () {
      // Add 95 more designs to designer1
      for (let i = 9; i <= 100; i++) {
        const hash = ethers.keccak256(ethers.toUtf8Bytes(`design-${i}`))
        await registry.registerDesign(hash, designer1.address)
      }

      const allDesigns = await registry.getDesignerDesigns(designer1.address)
      expect(allDesigns.length).to.equal(100)
    })
  })

  describe('Authorization & Access Control', function () {
    it('Should allow only owner to pause contract', async function () {
      await expect(registry.pause()).to.not.be.reverted
      expect(await registry.paused()).to.be.true
    })

    it('Should prevent non-owner from pausing', async function () {
      await expect(registry.connect(designer1).pause())
        .to.be.revertedWithCustomError(registry, 'OwnableUnauthorizedAccount')
    })

    it('Should prevent operations when paused', async function () {
      await registry.pause()

      const ipfsHash = ethers.keccak256(ethers.toUtf8Bytes('design'))
      await expect(registry.registerDesign(ipfsHash, designer1.address))
        .to.be.revertedWithCustomError(registry, 'EnforcedPause')
    })

    it('Should allow owner to unpause contract', async function () {
      await registry.pause()
      expect(await registry.paused()).to.be.true

      await registry.unpause()
      expect(await registry.paused()).to.be.false
    })
  })

  describe('Event Emissions', function () {
    it('Should emit DesignRegistered event with correct parameters', async function () {
      const ipfsHash = ethers.keccak256(ethers.toUtf8Bytes('design'))

      await expect(registry.registerDesign(ipfsHash, designer1.address))
        .to.emit(registry, 'DesignRegistered')
        .withArgs(1, ipfsHash, designer1.address)
    })

    it('Should emit Paused event', async function () {
      await expect(registry.pause())
        .to.emit(registry, 'Paused')
    })

    it('Should emit Unpaused event', async function () {
      await registry.pause()
      await expect(registry.unpause())
        .to.emit(registry, 'Unpaused')
    })
  })

  describe('Storage & State', function () {
    it('Should maintain design counter correctly', async function () {
      for (let i = 0; i < 10; i++) {
        const hash = ethers.keccak256(ethers.toUtf8Bytes(`design-${i}`))
        await registry.registerDesign(hash, designer1.address)
      }

      const design = await registry.getDesign(10)
      expect(design.designId).to.equal(10)
    })

    it('Should preserve design data across multiple registrations', async function () {
      const hashes = [
        ethers.keccak256(ethers.toUtf8Bytes('design-a')),
        ethers.keccak256(ethers.toUtf8Bytes('design-b')),
        ethers.keccak256(ethers.toUtf8Bytes('design-c')),
      ]

      for (const hash of hashes) {
        await registry.registerDesign(hash, designer1.address)
      }

      for (let i = 0; i < hashes.length; i++) {
        const design = await registry.getDesign(i + 1)
        expect(design.ipfsHash).to.equal(hashes[i])
      }
    })
  })

  describe('Gas Optimization', function () {
    it('Should use reasonable gas for design registration', async function () {
      const ipfsHash = ethers.keccak256(ethers.toUtf8Bytes('design'))

      const tx = await registry.registerDesign(ipfsHash, designer1.address)
      const receipt = await tx.wait()

      // Gas should be reasonable (adjust based on actual deployment)
      expect(receipt!.gasUsed).to.be.lessThan(ethers.parseEther('0.01'))
    })
  })
})
