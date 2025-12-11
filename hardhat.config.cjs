require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

const PRIVATE_KEY = process.env.PRIVATE_KEY || ''
const CELO_MAINNET_RPC = process.env.CELO_MAINNET_RPC || 'https://forno.celo.org'
const CELO_SEPOLIA_RPC = process.env.CELO_SEPOLIA_RPC || 'https://forno.celo-sepolia.celo-testnet.org'

module.exports = {
  solidity: '0.8.24',
  networks: {
    hardhat: {},
    celoMainnet: {
      url: CELO_MAINNET_RPC,
      chainId: 42220,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    celoSepolia: {
      url: CELO_SEPOLIA_RPC,
      chainId: 11142220,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
}


