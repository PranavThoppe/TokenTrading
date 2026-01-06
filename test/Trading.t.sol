// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/Trading.sol";
import "../src/CardNFT.sol";
import "./TestHelper.sol";

contract TradingTest is TestHelper {
    Trading public trading;
    CardNFT public cardNFT;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");

    uint256[] public aliceCards;
    uint256[] public bobCards;

    function setUp() public override {
        super.setUp(); // Call parent setUp

        // Deploy contracts
        cardNFT = new CardNFT("Test Cards", "TEST");
        trading = new Trading(address(cardNFT));

        // Mint some cards for testing
        vm.startPrank(address(this));
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), address(this));

        // Mint cards for Alice
        aliceCards.push(cardNFT.mintCard(alice, 1, 0)); // Common card
        aliceCards.push(cardNFT.mintCard(alice, 2, 1)); // Uncommon card

        // Mint cards for Bob
        bobCards.push(cardNFT.mintCard(bob, 3, 0)); // Common card
        bobCards.push(cardNFT.mintCard(bob, 4, 1)); // Uncommon card

        vm.stopPrank();
    }

    function testDeployment() public view {
        assertEq(address(trading.cardNFT()), address(cardNFT));
        assertEq(trading.getNextTradeId(), 1);
    }

    function testExecuteTrade() public {
        // Alice and Bob approve the trading contract
        vm.prank(alice);
        cardNFT.setApprovalForAll(address(trading), true);

        vm.prank(bob);
        cardNFT.setApprovalForAll(address(trading), true);

        // Execute trade: Alice trades her cards for Bob's cards
        uint256 tradeId = trading.executeTrade(
            alice,
            bob,
            aliceCards,
            bobCards
        );

        // Verify trade was recorded
        assertTrue(trading.isTradeCompleted(tradeId));
        assertEq(trading.getNextTradeId(), 2);

        // Verify ownership transfers
        assertEq(cardNFT.ownerOf(aliceCards[0]), bob);
        assertEq(cardNFT.ownerOf(aliceCards[1]), bob);
        assertEq(cardNFT.ownerOf(bobCards[0]), alice);
        assertEq(cardNFT.ownerOf(bobCards[1]), alice);
    }

    function testCannotTradeWithSelf() public {
        vm.prank(alice);
        cardNFT.setApprovalForAll(address(trading), true);

        vm.expectRevert("Trading: Cannot trade with self");
        trading.executeTrade(alice, alice, aliceCards, aliceCards);
    }

    function testCannotTradeWithoutCards() public {
        vm.expectRevert("Trading: PartyA must offer cards");
        trading.executeTrade(alice, bob, new uint256[](0), bobCards);

        vm.expectRevert("Trading: PartyB must offer cards");
        trading.executeTrade(alice, bob, aliceCards, new uint256[](0));
    }

    function testCardCountMustMatch() public {
        vm.prank(alice);
        cardNFT.setApprovalForAll(address(trading), true);

        vm.prank(bob);
        cardNFT.setApprovalForAll(address(trading), true);

        uint256[] memory singleCard = new uint256[](1);
        singleCard[0] = aliceCards[0];

        vm.expectRevert("Trading: Card counts must match");
        trading.executeTrade(alice, bob, singleCard, bobCards); // 1 vs 2 cards
    }

    function testCannotTradeUnownedCards() public {
        vm.prank(alice);
        cardNFT.setApprovalForAll(address(trading), true);

        vm.prank(bob);
        cardNFT.setApprovalForAll(address(trading), true);

        // Try to trade Bob's cards as if Alice owns them
        vm.expectRevert("Trading: PartyA does not own card");
        trading.executeTrade(alice, bob, bobCards, aliceCards);
    }

    function testTradeEventEmission() public {
        vm.prank(alice);
        cardNFT.setApprovalForAll(address(trading), true);

        vm.prank(bob);
        cardNFT.setApprovalForAll(address(trading), true);

        // Expect TradeExecuted event
        vm.expectEmit(true, true, false, true);
        emit Trading.TradeExecuted(
            1, // tradeId
            alice,
            bob,
            aliceCards,
            bobCards,
            block.timestamp
        );

        trading.executeTrade(alice, bob, aliceCards, bobCards);
    }

    function testCancelTrade() public {
        // Expect TradeCancelled event
        vm.expectEmit(true, false, false, true);
        emit Trading.TradeCancelled(
            123, // tradeId
            address(this),
            block.timestamp
        );

        trading.cancelTrade(123);
    }

    function testCannotExecuteSameTradeTwice() public {
        vm.prank(alice);
        cardNFT.setApprovalForAll(address(trading), true);

        vm.prank(bob);
        cardNFT.setApprovalForAll(address(trading), true);

        // Execute trade once
        uint256 tradeId = trading.executeTrade(alice, bob, aliceCards, bobCards);
        assertTrue(trading.isTradeCompleted(tradeId));

        // After the trade, Alice now owns Bob's cards and Bob owns Alice's cards
        // Try to execute the same trade again - this should fail because ownership has changed
        vm.expectRevert("Trading: PartyA does not own card");
        trading.executeTrade(alice, bob, aliceCards, bobCards);
    }
}
