# Implementation Plan

- [x] 1. Set up project structure and dependencies





  - Create Foundry project structure with contracts, scripts, and test directories
  - Install OpenZeppelin contracts library for ERC-721 and security utilities
  - Configure Solidity compiler version (0.8.x) and optimization settings
  - Set up testing framework (Hardhat/Foundry) with coverage tools
  - _Requirements: 7.1, 7.5_

- [x] 2. Implement Card NFT Contract





  - _Requirements: 1.2, 1.4, 2.1, 2.4, 2.5, 6.1, 6.2, 7.1, 7.4_

- [x] 2.1 Create base ERC-721 contract with metadata




  - Implement ERC-721 standard using OpenZeppelin base contracts
  - Add CardMetadata struct with playerId, rarity, mintTimestamp, and metadataURI fields
  - Create mapping to store card metadata by token ID
  - Implement token ID counter for auto-incrementing IDs
  - _Requirements: 2.1, 2.4, 2.5_

- [x] 2.2 Implement minting functionality with access control


  - Create mintCard function that accepts recipient address, playerId, and rarity
  - Add onlyMinter modifier using OpenZeppelin AccessControl
  - Emit CardMinted event with all relevant card details
  - Implement rarity supply tracking in mapping
  - _Requirements: 1.2, 1.4, 7.4_

- [x] 2.3 Add metadata retrieval and token URI functions


  - Implement getCardMetadata view function returning CardMetadata struct
  - Override tokenURI function to return IPFS metadata URI
  - Create helper function to construct metadata URI from base URI and token ID
  - _Requirements: 2.1, 2.5, 6.2_

- [ ] 2.4 Write unit tests for Card NFT Contract








  - Test minting cards with different rarity levels
  - Verify metadata storage and retrieval accuracy
  - Test ownership transfers and ERC-721 compliance
  - Validate access control for minting permissions
  - _Requirements: 2.1, 2.4, 7.1, 7.4_

- [x] 3. Implement Pack Manager Contract




  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.3_

- [x] 3.1 Create pack configuration system


  - Define PackConfig struct with price, cardCount, and rarityWeights array
  - Create mapping for pack types to PackConfig
  - Implement admin function to add/update pack configurations
  - Add player pool mappings organized by rarity tier
  - _Requirements: 1.1, 2.3_

- [x] 3.2 Implement pack purchase with payment handling


  - Create purchasePack function accepting pack type and payment
  - Validate payment amount matches pack price
  - Store pending pack data with buyer address and pack type
  - Request randomness from oracle (Chainlink VRF integration)
  - Emit PackPurchased event with request ID
  - _Requirements: 1.1, 1.4, 1.5_

- [x] 3.3 Implement randomness fulfillment and card generation


  - Create fulfillRandomness callback function for oracle
  - Implement weighted random selection algorithm using rarity weights
  - Generate array of player IDs based on pack configuration
  - Store generated cards in pending pack data
  - _Requirements: 1.3, 2.3_

- [x] 3.4 Implement pack opening and card minting


  - Create openPack function to mint cards after randomness fulfilled
  - Loop through generated player IDs and call Card NFT mintCard
  - Transfer all minted cards to buyer's wallet
  - Clean up pending pack data after minting
  - Emit events for pack opening completion
  - _Requirements: 1.2, 1.3, 1.5_

- [x] 3.5 Write unit tests for Pack Manager Contract





  - Test pack purchase with correct and incorrect payment amounts
  - Mock randomness oracle and test fulfillment flow
  - Verify card distribution matches configured rarity weights
  - Test multiple pack purchases and openings
  - Validate reentrancy protection on payable functions
  - _Requirements: 1.1, 1.2, 1.3, 2.3_

- [x] 3.6 Build frontend web application





  - Create React-based web interface for interacting with smart contracts
  - Implement wallet connection, pack purchasing, and collection viewing
  - Add trading and auction interfaces
  - See detailed implementation plan in `.kiro/specs/frontend-web-app/`
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 4. Implement Marketplace Contract for peer-to-peer trading
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2, 7.3, 7.4_

- [ ] 4.1 Create trade proposal system
  - Define Trade struct with initiator, counterparty, card arrays, approval flags, and status
  - Implement createTrade function accepting offered and requested card arrays
  - Validate initiator owns all offered cards
  - Store trade in mapping with auto-incrementing trade ID
  - Emit TradeCreated event
  - _Requirements: 3.1, 3.2, 7.4_

- [ ] 4.2 Implement trade approval mechanism
  - Create approveTrade function with trade ID parameter
  - Validate caller is either initiator or counterparty
  - Update appropriate approval flag in Trade struct
  - Check if both parties have approved and trigger execution
  - _Requirements: 3.2, 3.3_

- [ ] 4.3 Implement atomic trade execution
  - Create internal executeTrade function
  - Validate both parties still own their offered cards
  - Use safeTransferFrom to swap cards atomically
  - Update trade status to executed
  - Emit TradeExecuted event with all details
  - Add reentrancy guard protection
  - _Requirements: 3.3, 7.1, 7.3_

- [ ] 4.4 Add trade cancellation functionality
  - Create cancelTrade function allowing either party to cancel
  - Validate trade hasn't been executed
  - Update trade status to cancelled
  - Emit TradeCancelled event
  - _Requirements: 3.4_

- [ ]* 4.5 Write unit tests for Marketplace Contract
  - Test trade creation with valid card ownership
  - Verify approval flow from both parties
  - Test atomic swap execution
  - Validate trade cancellation by both parties
  - Test authorization checks and error conditions
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 7.1, 7.4_

- [ ] 5. Implement Auction Contract
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 7.4_

- [ ] 5.1 Create auction listing system
  - Define Auction struct with seller, tokenId, pricing, bidder info, timing, and status
  - Implement createAuction function with card ID, starting price, duration, and bid increment
  - Validate caller owns the card being auctioned
  - Transfer card to auction contract as escrow
  - Store auction with auto-incrementing ID
  - Emit AuctionCreated event
  - _Requirements: 4.1, 4.2, 7.4_

- [ ] 5.2 Implement bidding mechanism with validation
  - Create placeBid function accepting auction ID and payment
  - Validate auction is active and hasn't expired
  - Check bid exceeds current bid by minimum increment
  - Refund previous highest bidder if exists
  - Update auction with new highest bid and bidder
  - Emit BidPlaced event
  - _Requirements: 4.3, 5.1, 5.2, 5.3, 5.4_

- [ ] 5.3 Implement auction settlement
  - Create settleAuction function to finalize completed auctions
  - Validate auction end time has passed
  - If valid bids exist, transfer card to winner and payment to seller
  - If no bids, return card to seller
  - Update auction status to settled
  - Emit AuctionSettled event
  - Add reentrancy protection
  - _Requirements: 4.4, 4.5, 5.5, 7.1, 7.3_

- [ ] 5.4 Add auction cancellation for sellers
  - Create cancelAuction function for sellers to cancel before bids
  - Validate caller is the seller and no bids have been placed
  - Return card from escrow to seller
  - Update auction status to cancelled
  - Emit AuctionCancelled event
  - _Requirements: 4.1_

- [ ]* 5.5 Write unit tests for Auction Contract
  - Test auction creation and card escrow
  - Verify bid validation and refund logic
  - Test auction settlement with and without bids
  - Validate time-based constraints
  - Test cancellation conditions
  - Verify reentrancy protection
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 7.1_

- [ ] 6. Create deployment scripts and configuration
  - _Requirements: 7.1, 7.2, 7.5_

- [ ] 6.1 Write deployment script for all contracts
  - Create script to deploy Card NFT Contract first
  - Deploy Pack Manager with Card NFT address reference
  - Deploy Marketplace with Card NFT address reference
  - Deploy Auction with Card NFT address reference
  - Grant minting role to Pack Manager in Card NFT Contract
  - Save deployed contract addresses to configuration file
  - _Requirements: 7.1, 7.4_

- [ ] 6.2 Configure Pack Manager with initial data
  - Create script to populate player pool organized by rarity
  - Configure pack types with prices, card counts, and rarity distributions
  - Set up Chainlink VRF subscription and configure oracle address
  - Verify all configurations are correctly stored on-chain
  - _Requirements: 1.1, 1.3, 2.3_

- [ ]* 6.3 Write integration tests for full workflows
  - Test end-to-end pack purchase, randomness, and opening flow
  - Test complete trade execution between two users
  - Test full auction lifecycle from creation to settlement
  - Verify cross-contract interactions work correctly
  - Test event emission across all contracts
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 4.1, 4.4, 5.5, 7.2_

- [ ] 7. Implement frontend Web3 integration layer
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7.1 Create Web3 provider and wallet connection
  - Set up ethers.js or web3.js provider
  - Implement wallet connection flow (MetaMask, WalletConnect)
  - Create contract instance factories for all deployed contracts
  - Handle network switching and account changes
  - _Requirements: 6.1_

- [ ] 7.2 Implement pack purchase and opening interface
  - Create functions to call purchasePack with payment
  - Listen for PackPurchased events to track request IDs
  - Poll or listen for randomness fulfillment
  - Call openPack and display minted cards to user
  - Handle transaction confirmations and errors
  - _Requirements: 6.1, 6.5_

- [ ] 7.3 Build collection viewing functionality
  - Query Card NFT Contract for user's token IDs
  - Fetch metadata for each card from IPFS
  - Display cards with player profiles and rarity
  - Implement filtering and sorting by attributes
  - Show real-time updates when cards are added/removed
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ] 7.4 Create trading interface
  - Build UI for creating trade proposals with card selection
  - Implement trade approval flow for counterparty
  - Display pending trades for user
  - Add trade cancellation functionality
  - Show trade history and completed trades
  - _Requirements: 6.1, 6.5_

- [ ] 7.5 Implement auction interface
  - Create auction listing form with price and duration inputs
  - Build auction browsing page with active listings
  - Implement bid placement with validation
  - Show auction countdown timers
  - Add auction settlement trigger for ended auctions
  - Display auction history and results
  - _Requirements: 6.1, 6.4, 6.5_

- [ ] 8. Set up metadata service and IPFS integration
  - _Requirements: 2.1, 2.5, 6.2_

- [ ] 8.1 Create player profile metadata generator
  - Define JSON schema for player profiles with all attributes
  - Create script to generate metadata files for player pool
  - Include player stats, images, and rarity information
  - Validate metadata against schema
  - _Requirements: 2.1_

- [ ] 8.2 Upload metadata to IPFS
  - Set up IPFS node or use service like Pinata/Infura
  - Upload all player profile JSON files to IPFS
  - Store IPFS CIDs mapped to player IDs
  - Configure Card NFT Contract with base metadata URI
  - Verify metadata is accessible via IPFS gateways
  - _Requirements: 2.5, 6.2_

- [ ]* 8.3 Create metadata indexing service
  - Build service to index CardMinted events
  - Store mapping of token IDs to metadata URIs in database
  - Provide API endpoint for fast metadata queries
  - Implement caching layer for frequently accessed cards
  - _Requirements: 6.2, 6.5_
