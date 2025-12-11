# How to Fund the Reward Vault Contract

## Contract Address
**`0x1ccDFEa9bafE07264285db936aC87D26Cc5fDA8a`**

## Network
**Celo Mainnet** (Chain ID: 42220)

## How to Fund the Contract

### Option 1: Using MetaMask (recommended)

1. Switch MetaMask to **Celo Mainnet**
2. Make sure you hold **cUSD** (token address: `0x765DE816845861e75A25fCA122bb6898B8B1282a`)
3. Open **Assets → cUSD → Send**
4. Paste the vault address `0x1ccDFEa9bafE07264285db936aC87D26Cc5fDA8a`
5. Enter the cUSD amount to fund and confirm

### Option 2: Using MiniPay

1. Open **MiniPay** on Celo Mainnet
2. Choose **Send**
3. Paste `0x1ccDFEa9bafE07264285db936aC87D26Cc5fDA8a`
4. Select **cUSD** and enter the amount
5. Confirm the transfer

### Option 3: Call the `fund` function

1. Approve the vault to spend your cUSD:
   - Token: `0x765DE816845861e75A25fCA122bb6898B8B1282a`
   - Spender: `0x1ccDFEa9bafE07264285db936aC87D26Cc5fDA8a`
2. Call `fund(amount)` on the vault contract (e.g., via Blockscout “Write” tab)

## Recommended Funding Amount

For production, keep at least **200–500 cUSD** available so learners can claim. Top up as needed based on usage.

## Verify Funding

After sending cUSD, verify the contract balance:
1. Go to [Celo Explorer](https://explorer.celo.org/mainnet/)
2. Search for `0x1ccDFEa9bafE07264285db936aC87D26Cc5fDA8a`
3. Check the **ERC-20 Token Balances** section for cUSD

## Important Notes

- ⚠️ **Only send cUSD** – rewards are paid in cUSD
- ✅ Direct cUSD transfers to the contract are accepted; `fund()` also works after approval
- 💡 Keep the vault funded so learners can claim rewards
- 🔄 Monitor the contract balance and refill as needed

## Contract Functions

- `submitLesson()` - Users record lesson completion (adds cUSD to their claimable balance)
- `submitLessonsAndClaim()` - Batch record + claim in a single tx
- `claim()` / `claimAll()` - Users withdraw accumulated cUSD
- `fund()` - Transfer approved cUSD from the sender into the vault

