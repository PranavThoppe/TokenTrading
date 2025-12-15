# NFT Metadata Setup Guide

This guide explains how to set up metadata so your NFT cards display images in MetaMask and other wallets.

## How NFT Metadata Works

NFTs use the ERC-721 standard which requires a `tokenURI()` function that returns a URL to a JSON file containing:
- `name`: Card name
- `description`: Card description
- `image`: URL to the card art image
- `attributes`: Additional properties (rarity, player info, etc.)

## Step 1: Prepare Your Card Art Images

1. Create card art images for each player/rarity combination
2. Recommended format: PNG or JPG, 512x512px or larger
3. Name them consistently (e.g., `player-1-common.png`, `player-1-legendary.png`)

## Step 2: Host Your Images and Metadata

### Option A: IPFS (Recommended - Decentralized)

1. **Upload images to IPFS:**
   - Use Pinata (https://pinata.cloud) or NFT.Storage (https://nft.storage)
   - Upload all card art images
   - Get IPFS hashes (e.g., `QmXxxx...`)

2. **Create metadata JSON files:**
   ```json
   {
     "name": "Patrick Mahomes - Common",
     "description": "NFL Trading Card - Patrick Mahomes (Common)",
     "image": "ipfs://QmXxxx.../player-1-common.png",
     "attributes": [
       {
         "trait_type": "Player",
         "value": "Patrick Mahomes"
       },
       {
         "trait_type": "Position",
         "value": "QB"
       },
       {
         "trait_type": "Team",
         "value": "Kansas City Chiefs"
       },
       {
         "trait_type": "Rarity",
         "value": "Common"
       },
       {
         "trait_type": "Player ID",
         "value": "1"
       }
     ]
   }
   ```

3. **Upload metadata JSON files to IPFS**
   - Name them by playerId-rarity (e.g., `1-0.json` for player 1, Common)
   - Format: `{playerId}-{rarity}.json`
   - Examples:
     - `1-0.json` = Player 1, Common
     - `1-1.json` = Player 1, Uncommon
     - `1-4.json` = Player 1, Legendary
     - `2-0.json` = Player 2, Common

### Option B: Centralized Server (Easier but less decentralized)

1. Host images on your server or CDN (e.g., AWS S3, Cloudflare)
2. Create metadata JSON files
3. Serve them via HTTPS

## Step 3: Update Contract Base URI

Once you have your metadata hosted, set the base URI in your contract:

```bash
# For IPFS
cast send 0x39C7a11a1E4370196EA95F6dd0E583a8Dd1e6c0e \
  "setBaseURI(string)" \
  "ipfs://QmYourMetadataHash/" \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY

# For HTTPS server
cast send 0x39C7a11a1E4370196EA95F6dd0E583a8Dd1e6c0e \
  "setBaseURI(string)" \
  "https://your-domain.com/metadata/" \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
```

**Important:** The contract constructs URIs as: `baseURI + playerId + "-" + rarity + ".json"`

So if baseURI is `ipfs://QmXxxx/`, playerId is `1`, and rarity is `0` (Common), it will look for `ipfs://QmXxxx/1-0.json`

**Rarity values:**
- 0 = Common
- 1 = Uncommon
- 2 = Rare
- 3 = Epic
- 4 = Legendary

This means each player-rarity combination gets its own metadata file, allowing different card art for each rarity!

## Step 4: Verify It Works

1. Check tokenURI in Etherscan:
   ```
   https://sepolia.etherscan.io/address/0x39C7a11a1E4370196EA95F6dd0E583a8Dd1e6c0e#readContract
   ```
   - Call `tokenURI(1)` with a token ID you own
   - Should return your metadata URL

2. Test the metadata URL:
   - Open the returned URL in a browser
   - Should see your JSON metadata

3. View in MetaMask:
   - Import the NFT in MetaMask
   - Should now show the image and metadata

## Alternative: Set Individual Token URIs

If you want different metadata per token (not just per player), you can add a function to set individual token URIs. This requires a contract update.

## Quick Start Script

See `script/SetMetadata.s.sol` for a helper script to set base URI.

