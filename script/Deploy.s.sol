// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CardNFT.sol";
import "../src/PackManager.sol";
import "../src/Trading.sol";

/**
 * @title Deploy
 * @notice Deployment script for all trading card platform contracts
 * @dev Run with: forge script script/Deploy.s.sol --rpc-url <network> --broadcast
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Deploying Trading Card Platform contracts...");
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        
        // 1. Deploy CardNFT
        CardNFT cardNFT = new CardNFT("NFL Trading Cards", "NFL");
        console.log("CardNFT deployed at:", address(cardNFT));
        
        // 2. Deploy PackManager
        address vrfCoordinator = vm.envAddress("VRF_COORDINATOR");
        uint256 subscriptionId = vm.envUint("VRF_SUBSCRIPTION_ID");
        bytes32 keyHash = vm.envBytes32("VRF_KEY_HASH");

        PackManager packManager = new PackManager(
            address(cardNFT),
            vrfCoordinator,
            subscriptionId,
            keyHash
        );
        console.log("PackManager deployed at:", address(packManager));

        // Grant MINTER_ROLE to PackManager
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), address(packManager));
        console.log("Granted MINTER_ROLE to PackManager");

        // 3. Deploy Trading
        Trading trading = new Trading(address(cardNFT));
        console.log("Trading deployed at:", address(trading));
        
        // TODO: SET CAPS HERE - Configure rarity-based card caps after deployment
        // Note: maxCardsPerRarity defaults to 0 (unlimited) for all rarities
        // To set limits, call: cardNFT.setMaxCardsPerRarity(rarity, maxCards)
        // Example configuration:
        //   cardNFT.setMaxCardsPerRarity(0, 1000); // Common: 1000 cards max per player
        //   cardNFT.setMaxCardsPerRarity(1, 500);  // Uncommon: 500 cards max per player
        //   cardNFT.setMaxCardsPerRarity(2, 200);  // Rare: 200 cards max per player
        //   cardNFT.setMaxCardsPerRarity(3, 50);   // Epic: 50 cards max per player
        //   cardNFT.setMaxCardsPerRarity(4, 10);   // Legendary: 10 cards max per player
        
        vm.stopBroadcast();
        
        console.log("Deployment complete!");
        console.log("CardNFT:", address(cardNFT));
        console.log("PackManager:", address(packManager));
        console.log("Trading:", address(trading));
        console.log("\nNext steps:");
        console.log("1. Set rarity-based card caps (optional): cardNFT.setMaxCardsPerRarity(rarity, maxCards)");
        console.log("2. Run Configure.s.sol to set up pack types and player pools");
        console.log("3. Update environment variables with Trading contract address");
    }
}
