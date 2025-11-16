require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

const PRIVATE_KEY = process.env.PRIVATE_KEY || ''
const CELO_RPC_URL =
  process.env.CELO_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'

module.exports = {
  solidity: '0.8.24',
  networks: {
    hardhat: {},
    celoSepolia: {
      url: CELO_RPC_URL,
      chainId: 11142220,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
}


