// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "./CardNFT.sol";

/**
 * @title PackManager
 * @notice Manages pack purchases, randomness, and card minting
 * @dev Integrates with Chainlink VRF for randomness and CardNFT for minting
 */
contract PackManager is AccessControl, ReentrancyGuard, VRFConsumerBaseV2Plus {

    // Role for admin functions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Reference to the Card NFT contract
    CardNFT public immutable cardNFT;

    // Chainlink VRF configuration
    uint256 public subscriptionId;
    bytes32 public keyHash;
    uint32 public callbackGasLimit;
    uint16 public requestConfirmations;

    /**
     * @notice Pack configuration structure
     * @param price Cost to purchase the pack in wei
     * @param cardCount Number of cards in the pack
     * @param rarityWeights Array of weights for each rarity tier (index = rarity level)
     */
    struct PackConfig {
        uint256 price;
        uint8 cardCount;
        uint8[] rarityWeights;
    }

    /**
     * @notice Pending pack data awaiting randomness fulfillment
     * @param buyer Address of the pack purchaser
     * @param packType Type of pack purchased
     * @param playerIds Array of generated player IDs (populated after randomness)
     * @param rarities Array of generated rarities (populated after randomness)
     * @param fulfilled Whether randomness has been fulfilled
     */
    struct PendingPack {
        address buyer;
        uint8 packType;
        uint256[] playerIds;
        uint8[] rarities;
        bool fulfilled;
    }

    // Mapping from pack type to pack configuration
    mapping(uint8 => PackConfig) public packTypes;

    // Mapping from rarity tier to array of available player IDs
    mapping(uint8 => uint256[]) private _playerPoolByRarity;

    // Mapping from VRF request ID to pending pack data
    mapping(uint256 => PendingPack) private _pendingPacks;

    // Mapping from user address to their pending pack request IDs
    mapping(address => uint256[]) private _userPendingPacks;

    // Custom errors
    error InvalidPackType();
    error InsufficientPayment();
    error PackNotFulfilled();
    error PackAlreadyOpened();
    error EmptyPlayerPool(uint8 rarity);
    error InvalidRarityWeights();

    // Events
    event PackPurchased(
        address indexed buyer,
        uint8 indexed packType,
        uint256 indexed requestId,
        uint256 price
    );

    event PackOpened(
        address indexed buyer,
        uint256 indexed requestId,
        uint256[] tokenIds
    );

    event PackConfigured(
        uint8 indexed packType,
        uint256 price,
        uint8 cardCount
    );

    event PlayerPoolUpdated(
        uint8 indexed rarity,
        uint256 playerCount
    );

    /**
     * @notice Constructor to initialize the Pack Manager
     * @param cardNFT_ Address of the CardNFT contract
     * @param vrfCoordinator_ Address of the Chainlink VRF Coordinator
     * @param subscriptionId_ Chainlink VRF subscription ID
     * @param keyHash_ Chainlink VRF key hash
     */
    constructor(
        address cardNFT_,
        address vrfCoordinator_,
        uint256 subscriptionId_,
        bytes32 keyHash_
    ) VRFConsumerBaseV2Plus(vrfCoordinator_) {
        require(cardNFT_ != address(0), "PackManager: Invalid CardNFT address");
        
        cardNFT = CardNFT(cardNFT_);
        subscriptionId = subscriptionId_;
        keyHash = keyHash_;
        
        // Default VRF parameters
        callbackGasLimit = 500000;
        requestConfirmations = 3;

        // Grant admin role to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Configure or update a pack type
     * @param packType Pack type identifier
     * @param price Cost of the pack in wei
     * @param cardCount Number of cards in the pack
     * @param rarityWeights Array of weights for rarity distribution
     */
    function configurePackType(
        uint8 packType,
        uint256 price,
        uint8 cardCount,
        uint8[] calldata rarityWeights
    ) external onlyRole(ADMIN_ROLE) {
        require(price > 0, "PackManager: Price must be greater than 0");
        require(cardCount > 0, "PackManager: Card count must be greater than 0");
        require(rarityWeights.length > 0, "PackManager: Rarity weights cannot be empty");

        // Validate that weights sum to a reasonable value
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < rarityWeights.length; i++) {
            totalWeight += rarityWeights[i];
        }
        if (totalWeight == 0) revert InvalidRarityWeights();

        packTypes[packType] = PackConfig({
            price: price,
            cardCount: cardCount,
            rarityWeights: rarityWeights
        });

        emit PackConfigured(packType, price, cardCount);
    }

    /**
     * @notice Add players to the pool for a specific rarity tier
     * @param rarity Rarity tier
     * @param playerIds Array of player IDs to add
     */
    function addPlayersToPool(
        uint8 rarity,
        uint256[] calldata playerIds
    ) external onlyRole(ADMIN_ROLE) {
        require(playerIds.length > 0, "PackManager: Player IDs cannot be empty");

        for (uint256 i = 0; i < playerIds.length; i++) {
            _playerPoolByRarity[rarity].push(playerIds[i]);
        }

        emit PlayerPoolUpdated(rarity, _playerPoolByRarity[rarity].length);
    }

    /**
     * @notice Set the entire player pool for a specific rarity tier
     * @param rarity Rarity tier
     * @param playerIds Array of player IDs
     */
    function setPlayerPool(
        uint8 rarity,
        uint256[] calldata playerIds
    ) external onlyRole(ADMIN_ROLE) {
        require(playerIds.length > 0, "PackManager: Player IDs cannot be empty");

        _playerPoolByRarity[rarity] = playerIds;

        emit PlayerPoolUpdated(rarity, playerIds.length);
    }

    /**
     * @notice Get the player pool for a specific rarity tier
     * @param rarity Rarity tier
     * @return Array of player IDs
     */
    function getPlayerPool(uint8 rarity) external view returns (uint256[] memory) {
        return _playerPoolByRarity[rarity];
    }

    /**
     * @notice Get pack configuration
     * @param packType Pack type identifier
     * @return PackConfig struct
     */
    function getPackConfig(uint8 packType) external view returns (PackConfig memory) {
        return packTypes[packType];
    }

    /**
     * @notice Update Chainlink VRF parameters
     * @param subscriptionId_ New subscription ID
     * @param keyHash_ New key hash
     * @param callbackGasLimit_ New callback gas limit
     * @param requestConfirmations_ New request confirmations
     */
    function updateVRFConfig(
        uint256 subscriptionId_,
        bytes32 keyHash_,
        uint32 callbackGasLimit_,
        uint16 requestConfirmations_
    ) external onlyRole(ADMIN_ROLE) {
        subscriptionId = subscriptionId_;
        keyHash = keyHash_;
        callbackGasLimit = callbackGasLimit_;
        requestConfirmations = requestConfirmations_;
    }

    /**
     * @notice Purchase a pack and request randomness
     * @param packType Type of pack to purchase
     * @return requestId Chainlink VRF request ID
     */
    function purchasePack(uint8 packType) external payable nonReentrant returns (uint256) {
        PackConfig memory config = packTypes[packType];
        
        // Validate pack type exists
        if (config.price == 0) revert InvalidPackType();
        
        // Validate payment amount
        if (msg.value < config.price) revert InsufficientPayment();

        // Request randomness from Chainlink VRF
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: uint32(config.cardCount),
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );

        // Store pending pack data
        _pendingPacks[requestId] = PendingPack({
            buyer: msg.sender,
            packType: packType,
            playerIds: new uint256[](0),
            rarities: new uint8[](0),
            fulfilled: false
        });

        // Track this pack for the user
        _userPendingPacks[msg.sender].push(requestId);

        // Refund excess payment
        if (msg.value > config.price) {
            (bool success, ) = msg.sender.call{value: msg.value - config.price}("");
            require(success, "PackManager: Refund failed");
        }

        emit PackPurchased(msg.sender, packType, requestId, config.price);

        return requestId;
    }

    /**
     * @notice Callback function called by Chainlink VRF with random words
     * @param requestId VRF request ID
     * @param randomWords Array of random numbers
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        PendingPack storage pack = _pendingPacks[requestId];
        require(pack.buyer != address(0), "PackManager: Invalid request ID");
        require(!pack.fulfilled, "PackManager: Already fulfilled");

        PackConfig memory config = packTypes[pack.packType];

        // Initialize arrays for generated cards
        pack.playerIds = new uint256[](config.cardCount);
        pack.rarities = new uint8[](config.cardCount);

        // Generate cards using randomness
        for (uint256 i = 0; i < config.cardCount; i++) {
            // Use each random word to determine rarity and player
            uint256 randomValue = randomWords[i];
            
            // Determine rarity using weighted random selection
            uint8 rarity = _selectRarity(randomValue, config.rarityWeights);
            pack.rarities[i] = rarity;

            // Select random player from the rarity pool
            uint256[] memory playerPool = _playerPoolByRarity[rarity];
            if (playerPool.length == 0) revert EmptyPlayerPool(rarity);
            
            uint256 playerIndex = randomValue % playerPool.length;
            pack.playerIds[i] = playerPool[playerIndex];
        }

        pack.fulfilled = true;
    }

    /**
     * @notice Select rarity based on weighted random selection
     * @param randomValue Random number
     * @param rarityWeights Array of weights for each rarity
     * @return Selected rarity tier
     */
    function _selectRarity(
        uint256 randomValue,
        uint8[] memory rarityWeights
    ) private pure returns (uint8) {
        // Calculate total weight
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < rarityWeights.length; i++) {
            totalWeight += rarityWeights[i];
        }

        // Select based on weighted probability
        uint256 randomWeight = randomValue % totalWeight;
        uint256 cumulativeWeight = 0;

        for (uint8 i = 0; i < rarityWeights.length; i++) {
            cumulativeWeight += rarityWeights[i];
            if (randomWeight < cumulativeWeight) {
                return i;
            }
        }

        // Fallback to last rarity (should never reach here)
        return uint8(rarityWeights.length - 1);
    }

    /**
     * @notice Open a pack and mint cards after randomness is fulfilled
     * @param requestId VRF request ID
     * @return tokenIds Array of minted token IDs
     */
    function openPack(uint256 requestId) external nonReentrant returns (uint256[] memory) {
        PendingPack storage pack = _pendingPacks[requestId];
        
        // Validate pack exists and belongs to caller
        require(pack.buyer == msg.sender, "PackManager: Not pack owner");
        
        // Validate randomness has been fulfilled
        if (!pack.fulfilled) revert PackNotFulfilled();
        
        // Validate pack hasn't been opened yet
        if (pack.playerIds.length == 0) revert PackAlreadyOpened();

        // Mint all cards
        uint256[] memory tokenIds = new uint256[](pack.playerIds.length);
        
        for (uint256 i = 0; i < pack.playerIds.length; i++) {
            tokenIds[i] = cardNFT.mintCard(
                pack.buyer,
                pack.playerIds[i],
                pack.rarities[i]
            );
        }

        // Remove from user's pending packs array
        _removeFromUserPendingPacks(pack.buyer, requestId);

        // Clean up pending pack data
        delete _pendingPacks[requestId];

        emit PackOpened(pack.buyer, requestId, tokenIds);

        return tokenIds;
    }

    /**
     * @notice Remove a request ID from user's pending packs array
     * @param user User address
     * @param requestId Request ID to remove
     */
    function _removeFromUserPendingPacks(address user, uint256 requestId) private {
        uint256[] storage userPacks = _userPendingPacks[user];
        uint256 length = userPacks.length;
        
        for (uint256 i = 0; i < length; i++) {
            if (userPacks[i] == requestId) {
                // Move last element to this position and pop
                userPacks[i] = userPacks[length - 1];
                userPacks.pop();
                break;
            }
        }
    }

    /**
     * @notice Get pending pack information
     * @param requestId VRF request ID
     * @return PendingPack struct
     */
    function getPendingPack(uint256 requestId) external view returns (PendingPack memory) {
        return _pendingPacks[requestId];
    }

    /**
     * @notice Get all pending pack request IDs for a user
     * @param user User address
     * @return Array of request IDs
     */
    function getUserPendingPacks(address user) external view returns (uint256[] memory) {
        return _userPendingPacks[user];
    }

    /**
     * @notice Withdraw accumulated funds (admin only)
     * @param to Address to send funds to
     * @param amount Amount to withdraw
     */
    function withdraw(address payable to, uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(to != address(0), "PackManager: Invalid address");
        require(amount <= address(this).balance, "PackManager: Insufficient balance");
        
        (bool success, ) = to.call{value: amount}("");
        require(success, "PackManager: Withdrawal failed");
    }
}
