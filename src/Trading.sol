// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CardNFT.sol";

/**
 * @title Trading
 * @notice Minimal contract for executing card-for-card trades
 * @dev Trade proposals and approvals are handled off-chain in Supabase
 */
contract Trading is AccessControl, ReentrancyGuard {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    CardNFT public immutable cardNFT;

    // Trade counter for generating unique trade IDs
    uint256 private _nextTradeId = 1;

    // Mapping from tradeId to completion status
    mapping(uint256 => bool) public completedTrades;

    // Events for Supabase tracking
    event TradeExecuted(
        uint256 indexed tradeId,
        address indexed partyA,
        address indexed partyB,
        uint256[] partyACards,
        uint256[] partyBCards,
        uint256 executedAt
    );

    event TradeCancelled(
        uint256 indexed tradeId,
        address indexed cancelledBy,
        uint256 cancelledAt
    );

    /**
     * @notice Constructor to initialize the Trading contract
     * @param cardNFTAddress Address of the CardNFT contract
     */
    constructor(address cardNFTAddress) {
        require(cardNFTAddress != address(0), "Trading: Invalid CardNFT address");

        cardNFT = CardNFT(cardNFTAddress);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Execute a card-for-card trade between two parties
     * @param partyA Address of first party
     * @param partyB Address of second party
     * @param partyACards Array of token IDs partyA is trading
     * @param partyBCards Array of token IDs partyB is trading
     * @return tradeId Unique identifier for this trade
     *
     * Requirements:
     * - Both parties must have approved this contract to transfer their cards
     * - Trade must not have been executed before
     * - Arrays must be non-empty and equal length (1:1 card ratio)
     */
    function executeTrade(
        address partyA,
        address partyB,
        uint256[] calldata partyACards,
        uint256[] calldata partyBCards
    ) external nonReentrant returns (uint256 tradeId) {
        require(partyA != partyB, "Trading: Cannot trade with self");
        require(partyACards.length > 0, "Trading: PartyA must offer cards");
        require(partyBCards.length > 0, "Trading: PartyB must offer cards");
        require(partyACards.length == partyBCards.length, "Trading: Card counts must match");

        tradeId = _nextTradeId++;

        // Verify ownership and transfer partyA's cards to partyB
        for (uint256 i = 0; i < partyACards.length; i++) {
            require(cardNFT.ownerOf(partyACards[i]) == partyA, "Trading: PartyA does not own card");
            cardNFT.transferFrom(partyA, partyB, partyACards[i]);
        }

        // Verify ownership and transfer partyB's cards to partyA
        for (uint256 i = 0; i < partyBCards.length; i++) {
            require(cardNFT.ownerOf(partyBCards[i]) == partyB, "Trading: PartyB does not own card");
            cardNFT.transferFrom(partyB, partyA, partyBCards[i]);
        }

        completedTrades[tradeId] = true;

        emit TradeExecuted(tradeId, partyA, partyB, partyACards, partyBCards, block.timestamp);

        return tradeId;
    }

    /**
     * @notice Cancel a pending trade (emits event for Supabase)
     * @param tradeId The trade ID to cancel
     *
     * Note: This is informational only - actual trade state managed off-chain
     */
    function cancelTrade(uint256 tradeId) external {
        // Allow anyone to emit cancellation event (for Supabase tracking)
        emit TradeCancelled(tradeId, msg.sender, block.timestamp);
    }

    /**
     * @notice Check if a trade has been completed
     * @param tradeId Trade ID to check
     * @return True if trade was executed on-chain
     */
    function isTradeCompleted(uint256 tradeId) external view returns (bool) {
        return completedTrades[tradeId];
    }

    /**
     * @notice Get the next trade ID that would be assigned
     * @return Next trade ID
     */
    function getNextTradeId() external view returns (uint256) {
        return _nextTradeId;
    }

    /**
     * @dev Override supportsInterface to support AccessControl
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
