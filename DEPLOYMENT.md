# Smart Contract Deployment Guide

## Prerequisites

1. **Environment Setup**
   - Copy `.env.example` to `.env` in the root directory
   - Fill in the required values:
     - `PRIVATE_KEY`: Your deployer wallet's private key
     - `SEPOLIA_RPC_URL`: Alchemy or Infura RPC endpoint for Sepolia testnet
     - `VRF_SUBSCRIPTION_ID`: Your Chainlink VRF subscription ID (get from https://vrf.chain.link)
     - `ETHERSCAN_API_KEY`: For contract verification (optional)

2. **Chainlink VRF Setup**
   - Create a VRF subscription at https://vrf.chain.link
   - Fund the subscription with LINK tokens
   - Note the subscription ID for the `.env` file
   - The VRF_COORDINATOR and VRF_KEY_HASH are pre-configured for Sepolia

## Deployment Steps

### 1. Deploy Contracts

Run the deployment script:

```bash
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast
```

This will:
- Deploy CardNFT contract
- Deploy PackManager contract
- Grant MINTER_ROLE to PackManager so it can mint cards

### 2. Verify Contracts (Optional)

After deployment, verify contracts on Etherscan:

```bash
forge verify-contract <CONTRACT_ADDRESS> src/CardNFT.sol:CardNFT --chain sepolia
forge verify-contract <CONTRACT_ADDRESS> src/PackManager.sol:PackManager --chain sepolia
```

### 3. Update Configuration

After deployment, update the contract addresses:

1. Update `.env` with deployed addresses:
   ```
   CARD_NFT_ADDRESS=<deployed_address>
   PACK_MANAGER_ADDRESS=<deployed_address>
   ```

2. Update `frontend/.env` with deployed addresses:
   ```
   VITE_CARD_NFT_ADDRESS=<deployed_address>
   VITE_PACK_MANAGER_ADDRESS=<deployed_address>
   ```

### 4. Configure Pack Types and Player Pools

After deployment, configure the PackManager with pack types and player pools:

```bash
forge script script/Configure.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast
```

## Contract Details

### CardNFT
- **Name**: Fantasy Football Cards
- **Symbol**: FFC
- **Standard**: ERC-721
- **Features**:
  - Minting with metadata (player ID, rarity, timestamp)
  - Rarity tracking
  - Base URI support for metadata

### PackManager
- **Features**:
  - Pack purchase with ETH
  - Chainlink VRF integration for randomness
  - Weighted rarity distribution
  - Player pool management
  - Card minting on pack opening

## Network Configuration

**Sepolia Testnet**
- Chain ID: 11155111
- VRF Coordinator: 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
- Key Hash: 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c

## Troubleshooting

### "Invalid subscription ID"
- Ensure your VRF subscription is funded with LINK tokens
- Verify the subscription ID in `.env` matches your VRF subscription

### "Insufficient payment"
- Ensure the account has enough ETH for gas fees
- Sepolia testnet ETH can be obtained from faucets

### "MINTER_ROLE not granted"
- The deployment script automatically grants this role
- If needed manually, call: `cardNFT.grantRole(MINTER_ROLE, packManagerAddress)`
