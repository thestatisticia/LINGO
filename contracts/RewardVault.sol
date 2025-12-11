// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

/**
 * @title RewardVault
 * @notice Holds cUSD rewards for LINGO learners. Lesson completions earn up to 0.1 cUSD.
 *         Proofs are simple unique hashes that prevent double submissions without complex verification.
 */
contract RewardVault is Ownable, ReentrancyGuard {
  IERC20 public immutable rewardToken;
  
  struct LearnerInfo {
    uint128 xp;
    uint128 claimable;
  }

  mapping(address => LearnerInfo) public learners;
  mapping(bytes32 => bool) public processedProofs;

  event LessonSubmitted(address indexed learner, uint256 xp, uint256 reward);
  event RewardClaimed(address indexed learner, uint256 amount);
  event VaultFunded(address indexed sender, uint256 amount);

  constructor(address _rewardToken) Ownable(msg.sender) {
    require(_rewardToken != address(0), 'invalid token');
    rewardToken = IERC20(_rewardToken);
  }

  function submitLesson(uint256 xpGained, bytes32 proofId) external {
    require(!processedProofs[proofId], 'proof used');
    processedProofs[proofId] = true;
    // Reward cap: 0.1 cUSD (1e17 wei)
    // Formula: xp >= 100 ? 0.1 cUSD : (xp * 1e15) = xp * 0.001 cUSD per XP
    uint256 reward = xpGained >= 100 ? 1e17 : (xpGained * 1e15);
    if (reward > 1e17) reward = 1e17;
    LearnerInfo storage info = learners[msg.sender];
    info.xp += uint128(xpGained);
    info.claimable += uint128(reward);
    emit LessonSubmitted(msg.sender, xpGained, reward);
  }

  function submitLessonsAndClaim(uint256[] calldata xpValues, bytes32[] calldata proofIds) external nonReentrant {
    require(xpValues.length == proofIds.length, 'length mismatch');
    LearnerInfo storage info = learners[msg.sender];
    uint256 totalReward;
    uint256 totalXp;

    for (uint256 i = 0; i < xpValues.length; i++) {
      bytes32 proofId = proofIds[i];
      require(!processedProofs[proofId], 'proof used');
      processedProofs[proofId] = true;
      uint256 xpGained = xpValues[i];
      // Reward cap: 0.1 cUSD (1e17 wei)
      uint256 reward = xpGained >= 100 ? 1e17 : (xpGained * 1e15);
      if (reward > 1e17) reward = 1e17;
      totalReward += reward;
      totalXp += xpGained;
      emit LessonSubmitted(msg.sender, xpGained, reward);
    }

    if (totalXp > 0) {
      info.xp += uint128(totalXp);
      info.claimable += uint128(totalReward);
    }

    uint256 payout = uint256(info.claimable);
    require(payout > 0, 'nothing to claim');
    info.claimable = 0;
    bool ok = rewardToken.transfer(msg.sender, payout);
    require(ok, 'transfer failed');
    emit RewardClaimed(msg.sender, payout);
  }

  function claim(uint256 amount) external nonReentrant {
    LearnerInfo storage info = learners[msg.sender];
    require(info.claimable >= amount, 'insufficient balance');
    info.claimable -= uint128(amount);
    bool ok = rewardToken.transfer(msg.sender, amount);
    require(ok, 'transfer failed');
    emit RewardClaimed(msg.sender, amount);
  }

  function claimAll() external nonReentrant {
    LearnerInfo storage info = learners[msg.sender];
    uint256 amount = uint256(info.claimable);
    require(amount > 0, 'nothing to claim');
    info.claimable = 0;
    bool ok = rewardToken.transfer(msg.sender, amount);
    require(ok, 'transfer failed');
    emit RewardClaimed(msg.sender, amount);
  }

  /**
   * @notice Fund the vault with cUSD. Caller must approve this contract to spend cUSD first.
   * @param amount Amount of cUSD to transfer to the vault
   */
  function fund(uint256 amount) external {
    require(amount > 0, 'amount must be > 0');
    bool ok = rewardToken.transferFrom(msg.sender, address(this), amount);
    require(ok, 'transfer failed');
    emit VaultFunded(msg.sender, amount);
  }

  /**
   * @notice Emergency withdrawal function for owner to recover cUSD
   * @param amount Amount of cUSD to withdraw
   */
  function withdraw(uint256 amount) external onlyOwner {
    require(amount > 0, 'amount must be > 0');
    bool ok = rewardToken.transfer(owner(), amount);
    require(ok, 'transfer failed');
  }
}

