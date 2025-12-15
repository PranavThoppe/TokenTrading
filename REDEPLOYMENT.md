# Redeployment Guide

This guide walks you through redeploying the contracts with the new features:
- Card cap per player (`maxCardsPerPlayer`)
- NFL theme updates

## Prerequisites

1. **Environment Variables**
   Ensure your `.env` file has:
   ```
   PRIVATE_KEY=your_deployer_private_key
   SEPOLIA_RPC_URL=your_sepolia_rpc_url
   VRF_COORDINATOR=0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
   VRF_SUBSCRIPTION_ID=your_vrf_subscription_id
   VRF_KEY_HASH=0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c
   ETHERSCAN_API_KEY=your_etherscan_api_key (optional, for verification)
   ```

2. **Chainlink VRF Setup**
   - Ensure your VRF subscription is funded with LINK tokens
   - Verify subscription ID matches your `.env` file

## Step-by-Step Redeployment

### Step 1: Build Contracts

First, ensure contracts compile successfully:

```bash
forge build
```

### Step 2: Deploy Contracts

Deploy both CardNFT and PackManager contracts:

```bash
# Using forge script directly
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify

# Or using Makefile
make deploy-sepolia
```

**What happens:**
- Deploys new CardNFT contract with card cap functionality
- Deploys new PackManager contract
- Automatically grants MINTER_ROLE to PackManager

**Save the deployed addresses** from the console output!

### Step 3: Set Card Caps (NEW FEATURE - Rarity-Based)

After deployment, set the maximum cards per player **for each rarity**. You can do this via:

**Option A: Using the SetCardCap Script (Recommended)**

Edit `script/SetCardCap.s.sol` to set your desired caps for each rarity:

```solidity
uint256[5] memory caps = [
    1000,  // Common (0): 1000 cards max per player
    500,   // Uncommon (1): 500 cards max per player
    200,   // Rare (2): 200 cards max per player
    50,    // Epic (3): 50 cards max per player
    10     // Legendary (4): 10 cards max per player
];
```

Then run:
```bash
forge script script/SetCardCap.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast
```

**Option B: Using Foundry Cast (Command Line)**

```bash
# Set caps for each rarity (0=Common, 1=Uncommon, 2=Rare, 3=Epic, 4=Legendary)
# Set 0 for unlimited for that rarity

# Common: 1000 cards max
cast send <CARD_NFT_ADDRESS> \
  "setMaxCardsPerRarity(uint8,uint256)" \
  0 1000 \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY

# Uncommon: 500 cards max
cast send <CARD_NFT_ADDRESS> \
  "setMaxCardsPerRarity(uint8,uint256)" \
  1 500 \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY

# Rare: 200 cards max
cast send <CARD_NFT_ADDRESS> \
  "setMaxCardsPerRarity(uint8,uint256)" \
  2 200 \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY

# Epic: 50 cards max
cast send <CARD_NFT_ADDRESS> \
  "setMaxCardsPerRarity(uint8,uint256)" \
  3 50 \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY

# Legendary: 10 cards max
cast send <CARD_NFT_ADDRESS> \
  "setMaxCardsPerRarity(uint8,uint256)" \
  4 10 \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY

# Verify caps were set
cast call <CARD_NFT_ADDRESS> "getMaxCardsPerRarity(uint8)" 0 --rpc-url $SEPOLIA_RPC_URL
cast call <CARD_NFT_ADDRESS> "getMaxCardsPerRarity(uint8)" 4 --rpc-url $SEPOLIA_RPC_URL
```

**Option C: Using Etherscan/Block Explorer**

1. Go to your deployed CardNFT contract on Etherscan
2. Connect your wallet (must be admin)
3. Call `setMaxCardsPerRarity(uint8 rarity, uint256 maxCards)` for each rarity:
   - `setMaxCardsPerRarity(0, 1000)` for Common
   - `setMaxCardsPerRarity(1, 500)` for Uncommon
   - `setMaxCardsPerRarity(2, 200)` for Rare
   - `setMaxCardsPerRarity(3, 50)` for Epic
   - `setMaxCardsPerRarity(4, 10)` for Legendary

### Step 4: Update Environment Files

Update contract addresses in your environment files:

**Root `.env`:**
```env
CARD_NFT_ADDRESS=<new_deployed_address>
PACK_MANAGER_ADDRESS=<new_deployed_address>
```

**`frontend/.env`:**
```env
VITE_CARD_NFT_ADDRESS=<new_deployed_address>
VITE_PACK_MANAGER_ADDRESS=<new_deployed_address>
```

### Step 5: Configure Pack Types and Players

Run the configuration script to set up pack types and add NFL players:

```bash
forge script script/Configure.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast
```

This will:
- Configure 3 pack types (Starter, Standard, Premium)
- Add player pools for each rarity tier

### Step 6: Add More Players (Optional)

You can add more NFL players anytime without redeployment:

```bash
# Example: Add more players to Common pool
cast send <PACK_MANAGER_ADDRESS> \
  "addPlayersToPool(uint8,uint256[])" \
  0 \
  "[53,54,55,56,57]" \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

Or create a script for batch additions.

### Step 7: Verify Contracts (Optional but Recommended)

Verify contracts on Etherscan for transparency:

```bash
forge verify-contract <CARD_NFT_ADDRESS> \
  src/CardNFT.sol:CardNFT \
  --chain sepolia \
  --etherscan-api-key $ETHERSCAN_API_KEY

forge verify-contract <PACK_MANAGER_ADDRESS> \
  src/PackManager.sol:PackManager \
  --chain sepolia \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

## Important Notes

### Card Cap Behavior (Rarity-Based)

- **`maxCardsPerRarity[rarity] = 0`**: Unlimited cards for that rarity (default)
- **`maxCardsPerRarity[rarity] > 0`**: Maximum number of cards that can be minted for each player **at that specific rarity**
- The cap is enforced **per player ID AND per rarity**
- Example: If Common cap is 1000 and Legendary cap is 10:
  - A player can have up to 1000 Common cards
  - The same player can have up to 10 Legendary cards
  - These caps are independent of each other
- Once a player reaches the cap for a specific rarity, no more cards of that player at that rarity can be minted

### Migration from Old Contracts

⚠️ **Important**: If you have existing contracts with minted cards:

1. **Old contracts remain unchanged** - existing cards are not affected
2. **New contracts start fresh** - no cards minted yet
3. **Users will need to migrate** - if you want to preserve existing cards, you'd need a migration contract

### Testing Before Mainnet

Always test on a testnet first:

```bash
# Test on Sepolia
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast

# Or use local Anvil node
anvil
# In another terminal:
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

## Troubleshooting

### "Insufficient funds"
- Ensure your deployer wallet has enough ETH for gas fees
- For Sepolia, get test ETH from faucets

### "Invalid subscription ID"
- Verify VRF subscription is active and funded
- Check subscription ID matches `.env` file

### "AccessControlUnauthorizedAccount"
- Ensure you're using the deployer account (has admin role)
- Check that roles were granted correctly during deployment

### "Player card limit reached"
- A player has reached `maxCardsPerPlayer` limit
- Either increase the limit or add different players to pools

## Quick Reference Commands

```bash
# Build
forge build

# Test
forge test

# Deploy
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast

# Configure
forge script script/Configure.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast

# Set card caps per rarity (example: Common=1000, Legendary=10)
cast send <CARD_NFT_ADDRESS> "setMaxCardsPerRarity(uint8,uint256)" 0 1000 \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
cast send <CARD_NFT_ADDRESS> "setMaxCardsPerRarity(uint8,uint256)" 4 10 \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY

# Check card cap for a rarity
cast call <CARD_NFT_ADDRESS> "getMaxCardsPerRarity(uint8)" 0 --rpc-url $SEPOLIA_RPC_URL

# Check player card count for a specific rarity
cast call <CARD_NFT_ADDRESS> "getPlayerCardCountByRarity(uint256,uint8)" <playerId> 0 \
  --rpc-url $SEPOLIA_RPC_URL

# Add players to pool
cast send <PACK_MANAGER_ADDRESS> \
  "addPlayersToPool(uint8,uint256[])" <rarity> "[<playerId1>,<playerId2>]" \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
```

