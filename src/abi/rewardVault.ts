export const REWARD_VAULT_ABI = [
  'function submitLesson(uint256 xpGained, bytes32 proofId)',
  'function submitModule(bytes32 proofId)',
  'function claim(uint256 amount)',
  'function claimAll()',
  'function learners(address) view returns (uint128 xp,uint128 claimable)',
  'event LessonSubmitted(address indexed learner,uint256 xp,uint256 reward)',
  'event ModuleSubmitted(address indexed learner,uint256 reward)',
  'event RewardClaimed(address indexed learner,uint256 amount)',
]

