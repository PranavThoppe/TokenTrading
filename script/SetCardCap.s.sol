// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CardNFT.sol";

/**
 * @title SetCardCap
 * @notice Script to set the maximum cards per player per rarity
 * @dev Run after deployment to configure rarity-based card caps
 * 
 * TODO: SET CAPS HERE - Configure the caps for each rarity level
 * 
 * Usage:
 * 1. Add to .env: CARD_NFT_ADDRESS=<deployed_address>
 * 2. Modify the caps below for each rarity (0=Common, 1=Uncommon, 2=Rare, 3=Epic, 4=Legendary)
 * 3. Run: forge script script/SetCardCap.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast
 */
contract SetCardCap is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address cardNFTAddress = vm.envAddress("CARD_NFT_ADDRESS");
        
        CardNFT cardNFT = CardNFT(cardNFTAddress);
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Setting rarity-based card caps...");
        console.log("CardNFT address:", cardNFTAddress);
        console.log("");
        
        // TODO: SET CAPS HERE - Configure max cards per rarity
        // Set to 0 for unlimited, or a specific number for that rarity
        // Rarity levels: 0=Common, 1=Uncommon, 2=Rare, 3=Epic, 4=Legendary
        
        uint256[5] memory caps = [
            uint256(1000),  // Common (0): 1000 cards max per player
            uint256(500),   // Uncommon (1): 500 cards max per player
            uint256(200),   // Rare (2): 200 cards max per player
            uint256(50),    // Epic (3): 50 cards max per player
            uint256(10)     // Legendary (4): 10 cards max per player
        ];
        
        string[5] memory rarityNames = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
        
        for (uint8 i = 0; i < 5; i++) {
            cardNFT.setMaxCardsPerRarity(i, caps[i]);
            console.log("Set %s (rarity %d) cap to: %d", rarityNames[i], uint256(i), caps[i]);
            
            // Verify it was set
            uint256 currentMax = cardNFT.getMaxCardsPerRarity(i);
            if (currentMax == 0) {
                console.log("  -> UNLIMITED");
            } else {
                console.log("  -> Verified: %d cards max per player", currentMax);
            }
        }
        
        vm.stopBroadcast();
        
        console.log("\n=== Card cap configuration complete! ===");
        console.log("All rarity-based caps have been set.");
    }
}

