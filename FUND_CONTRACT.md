# How to Fund the Reward Vault Contract

## Contract Address
**`0x564Eb897eAc86Cd3cf9E135d3d0eA6FD41cA846f`**

## Network
**Celo Sepolia Testnet** (Chain ID: 11142220)

## How to Fund the Contract

### Option 1: Using MetaMask

1. **Open MetaMask** and make sure you're on **Celo Sepolia** network
2. **Click "Send"** button
3. **Paste the contract address**: `0x564Eb897eAc86Cd3cf9E135d3d0eA6FD41cA846f`
4. **Enter the amount** of CELO you want to deposit (e.g., 100 CELO for testing)
5. **Click "Next"** and confirm the transaction
6. Wait for confirmation

### Option 2: Using MiniPay

1. **Open MiniPay** wallet
2. **Navigate to Send** or **Transfer**
3. **Paste the contract address**: `0x564Eb897eAc86Cd3cf9E135d3d0eA6FD41cA846f`
4. **Enter the amount** of CELO
5. **Confirm** the transaction

### Option 3: Using Celo Explorer

1. Go to [Celo Sepolia Explorer](https://celo-sepolia.blockscout.com/)
2. Search for the contract: `0x564Eb897eAc86Cd3cf9E135d3d0eA6FD41cA846f`
3. Use the "Interact" or "Send CELO" feature

## Recommended Funding Amount

For testing purposes, start with:
- **50-100 CELO** for initial testing
- **500+ CELO** for production use

The contract will automatically accept the CELO via its `receive()` function.

## Verify Funding

After sending CELO, you can verify the contract balance:
1. Go to [Celo Sepolia Explorer](https://celo-sepolia.blockscout.com/)
2. Search for: `0x564Eb897eAc86Cd3cf9E135d3d0eA6FD41cA846f`
3. Check the "Balance" section

## Important Notes

- ⚠️ **Only send CELO** - Do not send other tokens
- ✅ The contract has a `receive()` function, so direct transfers work
- 💡 Keep some CELO in the contract at all times for users to claim rewards
- 🔄 Monitor the contract balance and refill as needed

## Contract Functions

- `submitLesson()` - Users record lesson completion (adds up to 1 CELO to their claimable)
- `submitModule()` - Users record module completion (adds 10 CELO to their claimable)
- `claim()` - Users withdraw their accumulated rewards
- `receive()` - Accepts incoming CELO deposits

