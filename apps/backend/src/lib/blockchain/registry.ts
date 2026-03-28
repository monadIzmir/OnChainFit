// src/lib/blockchain/registry.ts
import { ethers } from 'ethers'
import type { Env } from '../../config/env'

export class PrintChainRegistryClient {
  private provider: ethers.Provider
  private signer: ethers.Signer
  private registryAddress: string
  private contractABI: any

  constructor(env: Env) {
    this.registryAddress = env.REGISTRY_CONTRACT_ADDRESS
    this.provider = new ethers.JsonRpcProvider(env.MONAD_TESTNET_RPC)
    this.signer = new ethers.Wallet(env.BACKEND_SIGNER_PRIVATE_KEY, this.provider)

    // Minimal ABI for interactions
    this.contractABI = [
      'function registerDesign(bytes32 ipfsHash, address designer) external returns (uint256)',
      'function getDesign(uint256 designId) external view returns (tuple(bytes32 ipfsHash, address designer, uint256 registeredAt, bool isActive))',
      'event DesignRegistered(uint256 indexed designId, bytes32 indexed ipfsHash, address indexed designer, uint256 timestamp)',
    ]
  }

  async registerDesign(ipfsHash: string, designerAddress: string): Promise<string> {
    const contract = new ethers.Contract(this.registryAddress, this.contractABI, this.signer)

    // Convert IPFS hash string to bytes32
    const hashBytes32 = ethers.getAddress(designerAddress) // Ensure valid address format
    const ipfsBytes32 = ipfsHash.startsWith('0x')
      ? ipfsHash
      : '0x' + Buffer.from(ipfsHash).toString('hex').padStart(64, '0')

    // Call contract
    const tx = await contract.registerDesign(ipfsBytes32, designerAddress)
    const receipt = await tx.wait()

    // Extract design ID from event
    const event = receipt.logs
      .map((log: any) => {
        try {
          return contract.interface.parseLog(log)
        } catch {
          return null
        }
      })
      .find((event: any) => event?.name === 'DesignRegistered')

    return event?.args[0]?.toString() || '0'
  }

  async getDesign(designId: number) {
    const contract = new ethers.Contract(this.registryAddress, this.contractABI, this.provider)
    return await contract.getDesign(designId)
  }
}
