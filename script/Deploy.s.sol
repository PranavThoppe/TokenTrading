// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CardNFT.sol";
import "../src/PackManager.sol";

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
        CardNFT cardNFT = new CardNFT("Fantasy Football Cards", "FFC");
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
        
        vm.stopBroadcast();
        
        console.log("Deployment complete!");
        console.log("CardNFT:", address(cardNFT));
        console.log("PackManager:", address(packManager));
    }
}
