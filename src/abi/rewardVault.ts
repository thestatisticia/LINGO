export const REWARD_VAULT_ABI = [
  'function submitLesson(uint256 xpGained, bytes32 proofId)',
  'function submitLessonsAndClaim(uint256[] xpValues, bytes32[] proofIds)',
  'function claim(uint256 amount)',
  'function claimAll()',
  'function fund(uint256 amount)',
  'function rewardToken() view returns (address)',
  'function learners(address) view returns (uint128 xp,uint128 claimable)',
  'event LessonSubmitted(address indexed learner,uint256 xp,uint256 reward)',
  'event RewardClaimed(address indexed learner,uint256 amount)',
  'event VaultFunded(address indexed sender,uint256 amount)',
]

// cUSD ERC-20 ABI for balance checking
export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]

