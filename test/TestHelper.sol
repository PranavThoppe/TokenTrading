// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

/**
 * @title TestHelper
 * @notice Base contract for all tests with common utilities and setup
 */
abstract contract TestHelper is Test {
    // Common test addresses
    address public deployer = makeAddr("deployer");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    address public user3 = makeAddr("user3");
    
    // Fund amount for test users
    uint256 public constant INITIAL_BALANCE = 100 ether;
    
    function setUp() public virtual {
        // Fund test accounts
        vm.deal(deployer, INITIAL_BALANCE);
        vm.deal(user1, INITIAL_BALANCE);
        vm.deal(user2, INITIAL_BALANCE);
        vm.deal(user3, INITIAL_BALANCE);
    }
    
    /**
     * @notice Helper to create and fund a new address
     */
    function createUser(string memory name) internal returns (address) {
        address user = makeAddr(name);
        vm.deal(user, INITIAL_BALANCE);
        return user;
    }
    
    /**
     * @notice Helper to skip time forward
     */
    function skipTime(uint256 timeInSeconds) internal {
        vm.warp(block.timestamp + timeInSeconds);
    }
    
    /**
     * @notice Helper to mine blocks
     */
    function mineBlocks(uint256 numBlocks) internal {
        vm.roll(block.number + numBlocks);
    }
}
