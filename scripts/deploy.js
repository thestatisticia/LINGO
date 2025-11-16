import 'dotenv/config'
import hre from 'hardhat'

async function main() {
  const RewardVault = await hre.ethers.getContractFactory('RewardVault')
  const vault = await RewardVault.deploy()
  await vault.waitForDeployment()

  const address = await vault.getAddress()
  console.log('RewardVault deployed to:', address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

