// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

/**
 * @title RewardVault
 * @notice Holds CELO rewards for Mini-Lingua learners. Lesson completions earn up to 1 CELO,
 *         module completions earn 10 CELO drops. Proofs are simple unique hashes that prevent
 *         double submissions without complex verification.
 */
contract RewardVault is Ownable, ReentrancyGuard {
  struct LearnerInfo {
    uint128 xp;
    uint128 claimable;
  }

  mapping(address => LearnerInfo) public learners;
  mapping(bytes32 => bool) public processedProofs;

  event LessonSubmitted(address indexed learner, uint256 xp, uint256 reward);
  event ModuleSubmitted(address indexed learner, uint256 reward);
  event RewardClaimed(address indexed learner, uint256 amount);
  event VaultFunded(address indexed sender, uint256 amount);

  constructor() Ownable(msg.sender) {}

  receive() external payable {
    emit VaultFunded(msg.sender, msg.value);
  }

  function submitLesson(uint256 xpGained, bytes32 proofId) external {
    require(!processedProofs[proofId], 'proof used');
    processedProofs[proofId] = true;
    uint256 reward = xpGained >= 100 ? 1 ether : (xpGained * 1e16);
    if (reward > 1 ether) reward = 1 ether;
    LearnerInfo storage info = learners[msg.sender];
    info.xp += uint128(xpGained);
    info.claimable += uint128(reward);
    emit LessonSubmitted(msg.sender, xpGained, reward);
  }

  function submitModule(bytes32 proofId) external {
    require(!processedProofs[proofId], 'proof used');
    processedProofs[proofId] = true;
    LearnerInfo storage info = learners[msg.sender];
    info.claimable += uint128(10 ether);
    emit ModuleSubmitted(msg.sender, 10 ether);
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
      uint256 reward = xpGained >= 100 ? 1 ether : (xpGained * 1e16);
      if (reward > 1 ether) reward = 1 ether;
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
    (bool ok, ) = msg.sender.call{value: payout}('');
    require(ok, 'transfer failed');
    emit RewardClaimed(msg.sender, payout);
  }

  function claim(uint256 amount) external nonReentrant {
    LearnerInfo storage info = learners[msg.sender];
    require(info.claimable >= amount, 'insufficient balance');
    info.claimable -= uint128(amount);
    (bool ok, ) = msg.sender.call{value: amount}('');
    require(ok, 'transfer failed');
    emit RewardClaimed(msg.sender, amount);
  }

  function claimAll() external nonReentrant {
    LearnerInfo storage info = learners[msg.sender];
    uint256 amount = uint256(info.claimable);
    require(amount > 0, 'nothing to claim');
    info.claimable = 0;
    (bool ok, ) = msg.sender.call{value: amount}('');
    require(ok, 'transfer failed');
    emit RewardClaimed(msg.sender, amount);
  }
}

