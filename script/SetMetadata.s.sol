// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CardNFT.sol";

/**
 * @title SetMetadata
 * @notice Script to set the base URI for NFT metadata
 * @dev Run this after uploading metadata to IPFS or your server
 * 
 * Usage:
 * 1. Upload card images and metadata JSON files to IPFS or your server
 * 2. Get the base URI (e.g., "ipfs://QmXxxx/" or "https://your-domain.com/metadata/")
 * 3. Add to .env: CARD_NFT_ADDRESS=<deployed_address>
 * 4. Run: forge script script/SetMetadata.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --sig "run(string)" "ipfs://QmYourHash/"
 * 
 * Or set BASE_URI in .env and run normally:
 * forge script script/SetMetadata.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast
 */
contract SetMetadata is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address cardNFTAddress = vm.envAddress("CARD_NFT_ADDRESS");
        
        // Get base URI from environment or use default
        string memory baseURI = "";
        try vm.envString("BASE_URI") returns (string memory uri) {
            baseURI = uri;
        } catch {
            // If not in env, you can pass it as argument or set it here
            // For IPFS example: baseURI = "ipfs://QmYourHash/";
            // For HTTPS example: baseURI = "https://your-domain.com/metadata/";
            revert("BASE_URI not set in .env. Add BASE_URI=your_uri to .env or use --sig to pass as argument");
        }
        
        CardNFT cardNFT = CardNFT(cardNFTAddress);
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Setting base URI for NFT metadata...");
        console.log("CardNFT address:", cardNFTAddress);
        console.log("Base URI:", baseURI);
        
        cardNFT.setBaseURI(baseURI);
        
        // Verify it was set
        string memory currentBaseURI = cardNFT.getBaseURI();
        console.log("Current base URI:", currentBaseURI);
        
        vm.stopBroadcast();
        
        console.log("\n=== Metadata base URI set successfully! ===");
        console.log("Your NFTs will now use metadata from:", currentBaseURI);
        console.log("Format: ", currentBaseURI, "<playerId>-<rarity>.json");
        console.log("\nExamples:");
        console.log("  ", currentBaseURI, "1-0.json (Player 1, Common)");
        console.log("  ", currentBaseURI, "1-4.json (Player 1, Legendary)");
    }
    
    /**
     * @notice Alternative function to set base URI with argument
     * @param baseURI_ The base URI to set
     */
    function run(string memory baseURI_) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address cardNFTAddress = vm.envAddress("VITE_CARD_NFT_ADDRESS");
        
        CardNFT cardNFT = CardNFT(cardNFTAddress);
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Setting base URI for NFT metadata...");
        console.log("CardNFT address:", cardNFTAddress);
        console.log("Base URI:", baseURI_);
        
        cardNFT.setBaseURI(baseURI_);
        
        // Verify it was set
        string memory currentBaseURI = cardNFT.getBaseURI();
        console.log("Current base URI:", currentBaseURI);
        
        vm.stopBroadcast();
        
        console.log("\n=== Metadata base URI set successfully! ===");
        console.log("Your NFTs will now use metadata from:", currentBaseURI);
        console.log("Format: ", currentBaseURI, "<playerId>-<rarity>.json");
        console.log("\nExamples:");
        console.log("  ", currentBaseURI, "1-0.json (Player 1, Common)");
        console.log("  ", currentBaseURI, "1-4.json (Player 1, Legendary)");
    }
}

