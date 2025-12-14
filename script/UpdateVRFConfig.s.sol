// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/PackManager.sol";

/**
 * @title UpdateVRFConfig
 * @notice Script to update Chainlink VRF configuration, specifically the callbackGasLimit
 * @dev Run with: forge script script/UpdateVRFConfig.s.sol --rpc-url <network> --broadcast
 * 
 * This script fixes the "gas limit set too low" error by increasing the callbackGasLimit.
 * Premium packs with 10 cards require more gas than the default 500,000.
 * Recommended: 1,500,000 - 2,000,000 for premium packs
 */
contract UpdateVRFConfig is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address packManagerAddress = vm.envAddress("VITE_PACK_MANAGER_ADDRESS");
        
        PackManager packManager = PackManager(packManagerAddress);
        
        // Get current values (we'll keep them the same except for callbackGasLimit)
        uint256 currentSubscriptionId = packManager.subscriptionId();
        bytes32 currentKeyHash = packManager.keyHash();
        uint16 currentRequestConfirmations = packManager.requestConfirmations();
        
        // Set new callbackGasLimit - increased for premium packs (10 cards)
        // 1,500,000 should be sufficient, but 2,000,000 provides a good safety margin
        uint32 newCallbackGasLimit = 2000000;
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Updating Chainlink VRF Configuration...");
        console.log("PackManager:", packManagerAddress);
        console.log("Current callbackGasLimit:", packManager.callbackGasLimit());
        console.log("New callbackGasLimit:", newCallbackGasLimit);
        console.log("Subscription ID:", currentSubscriptionId);
        console.log("Key Hash:", vm.toString(currentKeyHash));
        console.log("Request Confirmations:", currentRequestConfirmations);
        
        packManager.updateVRFConfig(
            currentSubscriptionId,
            currentKeyHash,
            newCallbackGasLimit,
            currentRequestConfirmations
        );
        
        vm.stopBroadcast();
        
        console.log("\n=== VRF Configuration Updated! ===");
        console.log("New callbackGasLimit:", newCallbackGasLimit);
        console.log("Premium packs should now work without gas limit errors.");
    }
}
