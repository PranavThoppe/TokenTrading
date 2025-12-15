# Pinata IPFS Setup Guide

This guide explains how to connect your Pinata-uploaded metadata and images to your NFT contract.

## Step 1: Upload Card Art Images to Pinata

1. **Prepare your card art images:**
   - Create images for each player-rarity combination
   - Recommended: PNG or JPG, 512x512px or larger
   - Name them clearly: `player-1-common.png`, `player-1-legendary.png`, etc.

2. **Upload images to Pinata:**
   - Go to https://pinata.cloud
   - Click "Upload" → "File"
   - Upload all your card art images
   - **Important:** Note the IPFS hash for each image (e.g., `QmXxxx...`)

## Step 2: Update Your JSON Metadata Files

Your JSON files need to reference the IPFS URLs of your images.

### Option A: Individual Image Hashes (More Control)

If you uploaded images separately, update each JSON file's `image` field:

```json
{
  "name": "Patrick Mahomes - Common",
  "description": "NFL Trading Card - Patrick Mahomes (Common Rarity)",
  "image": "ipfs://QmYourImageHashHere/player-1-common.png",
  ...
}
```

### Option B: Folder Upload (Easier - Recommended)

1. **Create a folder structure:**
   ```
   metadata/
   ├── images/
   │   ├── player-1-common.png
   │   ├── player-1-legendary.png
   │   ├── player-2-common.png
   │   └── ...
   └── json/
       ├── 1-0.json
       ├── 1-4.json
       ├── 2-0.json
       └── ...
   ```

2. **Upload the entire folder to Pinata:**
   - Click "Upload" → "Folder"
   - Select your `metadata` folder
   - Pinata will give you a folder hash (e.g., `QmFolderHash...`)

3. **Update JSON files to reference images:**
   ```json
   {
     "image": "ipfs://QmFolderHash/images/player-1-common.png",
     ...
   }
   ```

## Step 3: Get Your Pinata IPFS Hash

After uploading your metadata JSON files:

1. **If you uploaded a folder:**
   - Use the folder hash Pinata provided
   - Example: `QmXxxx...`

2. **If you uploaded files individually:**
   - You'll need to organize them in a folder structure
   - Or use the hash of the folder containing your JSON files

## Step 4: Get Your Pinata API Keys (Optional but Recommended)

For programmatic access and to ensure your files stay pinned:

1. Go to Pinata → "Developer" → "API Keys"
2. Create a new API key with:
   - **Admin** permissions (to pin/unpin)
   - Or **PinFileToIPFS** permission (minimum needed)
3. Save:
   - **JWT Token** (starts with `eyJ...`)
   - **API Key** (optional, for some operations)
   - **API Secret** (optional, for some operations)

**Note:** You don't strictly need API keys to use the IPFS hashes, but they're useful for:
- Ensuring files stay pinned
- Uploading new files programmatically
- Managing your pins

## Step 5: Set Base URI in Your Contract

Once you have your IPFS folder hash, set it in your contract:

```bash
# Get your IPFS hash from Pinata (the folder hash containing your JSON files)
# Format: ipfs://QmYourHash/

forge script script/SetMetadata.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --sig "run(string)" \
  "ipfs://QmYourFolderHash/"
```

Or using cast:
```bash
cast send 0x39C7a11a1E4370196EA95F6dd0E583a8Dd1e6c0e \
  "setBaseURI(string)" \
  "ipfs://QmYourFolderHash/" \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
```

## Step 6: Verify It Works

1. **Check tokenURI:**
   ```bash
   cast call 0x39C7a11a1E4370196EA95F6dd0E583a8Dd1e6c0e \
     "tokenURI(uint256)" 1 \
     --rpc-url $SEPOLIA_RPC_URL
   ```
   Should return: `ipfs://QmYourHash/1-0.json` (or whatever player/rarity token 1 is)

2. **Test the IPFS URL:**
   - Open `https://ipfs.io/ipfs/QmYourHash/1-0.json` in a browser
   - Or use Pinata's gateway: `https://gateway.pinata.cloud/ipfs/QmYourHash/1-0.json`
   - Should see your JSON metadata

3. **Check the image URL in the JSON:**
   - The `image` field should point to your card art
   - Open that URL to verify the image loads

## Important Notes

### IPFS Gateway Access

IPFS files can be accessed via:
- **Public gateway:** `https://ipfs.io/ipfs/QmHash...`
- **Pinata gateway:** `https://gateway.pinata.cloud/ipfs/QmHash...`
- **Cloudflare gateway:** `https://cloudflare-ipfs.com/ipfs/QmHash...`

MetaMask and most wallets use public gateways, but you can also use Pinata's gateway for faster access.

### Keeping Files Pinned

- Pinata free tier keeps files pinned as long as you have the account
- For production, consider upgrading or using multiple pinning services
- You can use Pinata API to ensure files stay pinned

### Folder Structure Example

```
ipfs://QmYourHash/
├── 1-0.json          (Player 1, Common)
├── 1-1.json          (Player 1, Uncommon)
├── 1-4.json          (Player 1, Legendary)
├── 2-0.json          (Player 2, Common)
└── images/           (if you organized images in a subfolder)
    ├── player-1-common.png
    └── ...
```

## Quick Checklist

- [ ] Upload card art images to Pinata
- [ ] Update JSON files with image IPFS URLs
- [ ] Upload JSON files to Pinata (or re-upload folder)
- [ ] Get folder hash from Pinata
- [ ] Set base URI in contract: `ipfs://QmYourHash/`
- [ ] Test tokenURI returns correct path
- [ ] Test JSON file loads from IPFS
- [ ] Test image loads from IPFS
- [ ] View NFT in MetaMask to see card art

