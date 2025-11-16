# Mini-Lingua: Learn Languages, Earn CELO

A gamified language learning app on Celo Sepolia testnet. Complete lessons, earn XP, and claim CELO rewards!

## Features

- 🎓 **20 modules per level** (Beginner, Intermediate, Advanced)
- 💰 **CELO Rewards**: Up to 1 CELO per lesson, 10 CELO per module completion
- 📱 **MiniPay & MetaMask Support**: Seamless wallet integration
- 🏆 **Weekly Leaderboards**: Compete for top 10 spots
- ⚡ **On-chain Rewards**: Smart contract manages all rewards

## Smart Contract

**Deployed Contract Address**: `0x564Eb897eAc86Cd3cf9E135d3d0eA6FD41cA846f`  
**Network**: Celo Sepolia (Chain ID: 11142220)

### Contract Functions
- `submitLesson(uint256 xpGained, bytes32 proofId)` - Record lesson completion (max 1 CELO)
- `submitModule(bytes32 proofId)` - Record module completion (10 CELO drop)
- `claim(uint256 amount)` - Claim CELO rewards
- `claimAll()` - Claim all available rewards

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_REWARD_VAULT_ADDRESS=0x564Eb897eAc86Cd3cf9E135d3d0eA6FD41cA846f
```

### 3. Run Development Server
```bash
npm run dev
```

## Smart Contract Development

### Compile Contracts
```bash
npm run contracts:compile
```

### Deploy Contracts
```bash
npm run contracts:deploy
```

**Note**: Requires `PRIVATE_KEY` and `CELO_RPC_URL` in `contracts/.env` for deployment.

## Wallet Integration

### MiniPay
- Auto-detects MiniPay when available
- Auto-connects on page load (if not previously disconnected)
- Seamless Celo Sepolia network switching

### MetaMask
- Full support for MetaMask wallets
- Automatic network addition if Celo Sepolia not configured
- Manual connection via "Connect wallet" button

## Reward System

1. **Lesson Completion**: Earn XP → Converted to CELO (capped at 1 CELO per lesson)
2. **Module Completion**: Automatic 10 CELO drop
3. **Claiming**: All rewards accumulate and can be claimed in one transaction
4. **Weekly Reset**: Leaderboards reset every Sunday at 23:59 UTC

## Tech Stack

- **Frontend**: React + Vite
- **Smart Contracts**: Solidity (Hardhat)
- **Blockchain**: Celo Sepolia Testnet
- **Web3**: Ethers.js v6
- **Wallet**: MiniPay, MetaMask

## License

MIT
