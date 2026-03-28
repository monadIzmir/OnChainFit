// scripts/deploy.ts
import hre from 'hardhat'
import * as fs from 'fs'
import * as path from 'path'

async function main() {
  console.log('🚀 Deploying PrintChain contracts...')

  const [deployer] = await hre.ethers.getSigners()
  console.log(`📍 Deploying from: ${deployer.address}`)

  // Deploy PrintChainRegistry
  console.log('\n📦 Deploying PrintChainRegistry...')
  const Registry = await hre.ethers.getContractFactory('PrintChainRegistry')
  const registry = await Registry.deploy()
  await registry.waitForDeployment()
  const registryAddress = await registry.getAddress()
  console.log(`✅ PrintChainRegistry deployed at: ${registryAddress}`)

  // Deploy RoyaltyDistributor
  console.log('\n📦 Deploying RoyaltyDistributor...')
  const platformWallet = deployer.address // For now, deployer is platform
  const Distributor = await hre.ethers.getContractFactory('RoyaltyDistributor')
  const distributor = await Distributor.deploy(platformWallet)
  await distributor.waitForDeployment()
  const distributorAddress = await distributor.getAddress()
  console.log(`✅ RoyaltyDistributor deployed at: ${distributorAddress}`)

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      PrintChainRegistry: registryAddress,
      RoyaltyDistributor: distributorAddress,
    },
  }

  const outputPath = path.join(__dirname, '../deployment.json')
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2))
  console.log(`\n💾 Deployment info saved to: ${outputPath}`)

  console.log('\n🎉 Deployment complete!')
  console.log('\nUpdate your .env file:')
  console.log(`REGISTRY_CONTRACT_ADDRESS=${registryAddress}`)
  console.log(`DISTRIBUTOR_CONTRACT_ADDRESS=${distributorAddress}`)
  console.log(`PLATFORM_WALLET_ADDRESS=${platformWallet}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
