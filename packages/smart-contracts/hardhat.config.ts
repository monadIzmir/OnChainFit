// hardhat.config.ts
import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@typechain/hardhat'
import 'hardhat-deploy'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    monad_testnet: {
      url: process.env.MONAD_TESTNET_RPC || 'https://testnet-rpc.monad.xyz',
      chainId: 10143,
      accounts: process.env.BACKEND_SIGNER_PRIVATE_KEY
        ? [process.env.BACKEND_SIGNER_PRIVATE_KEY]
        : [],
    },
    monad_testnet_fork: {
      url: 'http://127.0.0.1:8545',
      forking: {
        url: process.env.MONAD_TESTNET_RPC || 'https://testnet-rpc.monad.xyz',
      },
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  typechain: {
    outDir: 'typechain-types',
    target: 'ethers-v6',
  },
}

export default config
