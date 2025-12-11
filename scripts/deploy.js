import 'dotenv/config'
import hre from 'hardhat'

// cUSD Mainnet address: 0x765DE816845861e75A25fCA122bb6898B8B1282a
const CUSD_MAINNET = '0x765DE816845861e75A25fCA122bb6898B8B1282a'

async function main() {
  const RewardVault = await hre.ethers.getContractFactory('RewardVault')
  
  // Get cUSD address from network or use mainnet default
  const network = await hre.ethers.provider.getNetwork()
  const cusdAddress = network.chainId === 42220n ? CUSD_MAINNET : process.env.CUSD_ADDRESS || CUSD_MAINNET
  
  console.log('Deploying RewardVault with cUSD address:', cusdAddress)
  const vault = await RewardVault.deploy(cusdAddress)
  await vault.waitForDeployment()

  const address = await vault.getAddress()
  console.log('RewardVault deployed to:', address)
  console.log('Network:', network.name, 'Chain ID:', network.chainId.toString())
  console.log('cUSD Token:', cusdAddress)
  console.log('\nNext steps:')
  console.log('1. Verify contract on explorer')
  console.log('2. Fund vault with cUSD using: vault.fund(amount)')
  console.log('3. Update VITE_REWARD_VAULT_ADDRESS in frontend .env')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

