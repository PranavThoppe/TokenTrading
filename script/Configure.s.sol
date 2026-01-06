// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/PackManager.sol";

/**
 * @title Configure
 * @notice Configuration script for setting up pack types and player pools
 * @dev Run after deployment to configure the platform
 */
contract Configure is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address packManagerAddress = vm.envAddress("PACK_MANAGER_ADDRESS");
        
        PackManager packManager = PackManager(packManagerAddress);
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Configuring Trading Card Platform...");
        console.log("PackManager:", packManagerAddress);
        
        // Configure Pack Types
        console.log("\n=== Configuring Pack Types ===");
        
        // Rarity weights: [Common, Uncommon, Rare, Epic, Legendary]
        uint8[] memory starterWeights = new uint8[](5);
        starterWeights[0] = 70; // Common
        starterWeights[1] = 20; // Uncommon
        starterWeights[2] = 8;  // Rare
        starterWeights[3] = 2;  // Epic
        starterWeights[4] = 0;  // Legendary
        
        uint8[] memory standardWeights = new uint8[](5);
        standardWeights[0] = 50; // Common
        standardWeights[1] = 30; // Uncommon
        standardWeights[2] = 15; // Rare
        standardWeights[3] = 4;  // Epic
        standardWeights[4] = 1;  // Legendary
        
        uint8[] memory premiumWeights = new uint8[](5);
        premiumWeights[0] = 40; // Common
        premiumWeights[1] = 30; // Uncommon
        premiumWeights[2] = 20; // Rare
        premiumWeights[3] = 8;  // Epic
        premiumWeights[4] = 2;  // Legendary
        
        // Starter Pack - 3 cards, 0.001 ETH
        packManager.configurePackType(0, 0.001 ether, 3, starterWeights);
        console.log("Pack 0: Starter Pack - 3 cards, 0.001 ETH");
        
        // Standard Pack - 5 cards, 0.005 ETH
        packManager.configurePackType(1, 0.005 ether, 5, standardWeights);
        console.log("Pack 1: Standard Pack - 5 cards, 0.005 ETH");
        
        // Premium Pack - 5 cards, 0.01 ETH (better rarity odds than Standard)
        packManager.configurePackType(2, 0.01 ether, 5, premiumWeights);
        console.log("Pack 2: Premium Pack - 5 cards, 0.01 ETH");
        
        // Add Mock Player Data
        console.log("\n=== Adding Mock Player Data ===");
        
        // Common players (IDs 1-20)
        uint256[] memory commonPlayers = new uint256[](20);
        for (uint256 i = 0; i < 20; i++) {
            commonPlayers[i] = i + 1;
        }
        packManager.addPlayersToPool(0, commonPlayers); // Rarity 0 = Common
        console.log("Added 20 Common players (IDs 1-20)");
        
        // Uncommon players (IDs 21-35)
        uint256[] memory uncommonPlayers = new uint256[](15);
        for (uint256 i = 0; i < 15; i++) {
            uncommonPlayers[i] = i + 21;
        }
        packManager.addPlayersToPool(1, uncommonPlayers); // Rarity 1 = Uncommon
        console.log("Added 15 Uncommon players (IDs 21-35)");
        
        // Rare players (IDs 36-45)
        uint256[] memory rarePlayers = new uint256[](10);
        for (uint256 i = 0; i < 10; i++) {
            rarePlayers[i] = i + 36;
        }
        packManager.addPlayersToPool(2, rarePlayers); // Rarity 2 = Rare
        console.log("Added 10 Rare players (IDs 36-45)");
        
        // Epic players (IDs 46-50)
        uint256[] memory epicPlayers = new uint256[](5);
        for (uint256 i = 0; i < 5; i++) {
            epicPlayers[i] = i + 46;
        }
        packManager.addPlayersToPool(3, epicPlayers); // Rarity 3 = Epic
        console.log("Added 5 Epic players (IDs 46-50)");
        
        // Legendary players (IDs 51-52)
        uint256[] memory legendaryPlayers = new uint256[](2);
        legendaryPlayers[0] = 51;
        legendaryPlayers[1] = 52;
        packManager.addPlayersToPool(4, legendaryPlayers); // Rarity 4 = Legendary
        console.log("Added 2 Legendary players (IDs 51-52)");
        
        vm.stopBroadcast();
        
        console.log("\n=== Configuration Complete! ===");
        console.log("Total players added: 52");
        console.log("Pack types configured: 3");
        console.log("\nYou can now purchase packs from the frontend!");
    }
}
