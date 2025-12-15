// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CardNFT
 * @notice ERC-721 NFT contract for NFL football trading cards
 * @dev Implements card minting with metadata, rarity tracking, and rarity-based per-player card limits
 */
contract CardNFT is ERC721, AccessControl {

    // Role for minting cards (granted to Pack Manager)
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Struct to store card metadata
    struct CardMetadata {
        uint256 playerId;
        uint8 rarity;
        uint256 mintTimestamp;
        string metadataURI;
    }

    // Token ID counter for auto-incrementing IDs
    uint256 private _nextTokenId;

    // Mapping from token ID to card metadata
    mapping(uint256 => CardMetadata) private _cardData;

    // Mapping to track supply by rarity level
    mapping(uint8 => uint256) public raritySupply;

    // Mapping from playerId to number of cards minted per rarity
    // playerId => rarity => count
    mapping(uint256 => mapping(uint8 => uint256)) public playerCardCountByRarity;

    // Maximum cards allowed per player per rarity (set by admin)
    // rarity => maxCards (0 = unlimited)
    // TODO: SET CAPS HERE - Configure max cards per rarity after deployment
    // Example: Common (0) = 1000, Uncommon (1) = 500, Rare (2) = 200, Epic (3) = 50, Legendary (4) = 10
    mapping(uint8 => uint256) public maxCardsPerRarity;

    // Base URI for metadata
    string private _baseTokenURI;

    // Events
    event CardMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 playerId,
        uint8 rarity
    );

    event MaxCardsPerRarityUpdated(uint8 indexed rarity, uint256 newMaxCards);

    /**
     * @notice Constructor to initialize the Card NFT contract
     * @param name_ Name of the NFT collection
     * @param symbol_ Symbol of the NFT collection
     */
    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
        // Grant admin role to contract deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Start token IDs at 1
        _nextTokenId = 1;
    }

    /**
     * @notice Mint a new card NFT
     * @param to Address to receive the minted card
     * @param playerId ID of the player profile
     * @param rarity Rarity level of the card
     * @return tokenId The ID of the newly minted token
     */
    function mintCard(
        address to,
        uint256 playerId,
        uint8 rarity
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        // Check if player has reached the card limit for this rarity (if limit is set)
        uint256 maxForRarity = maxCardsPerRarity[rarity];
        if (maxForRarity > 0) {
            require(
                playerCardCountByRarity[playerId][rarity] < maxForRarity,
                "CardNFT: Player card limit reached for this rarity"
            );
        }

        // Get current token ID and increment for next mint
        uint256 tokenId = _nextTokenId++;

        // Mint the token
        _safeMint(to, tokenId);

        // Store card metadata
        _cardData[tokenId] = CardMetadata({
            playerId: playerId,
            rarity: rarity,
            mintTimestamp: block.timestamp,
            metadataURI: ""
        });

        // Increment player card count for this rarity
        playerCardCountByRarity[playerId][rarity]++;

        // Update rarity supply tracking
        raritySupply[rarity]++;

        // Emit event
        emit CardMinted(tokenId, to, playerId, rarity);

        return tokenId;
    }

    /**
     * @notice Get metadata for a specific card
     * @param tokenId ID of the token
     * @return CardMetadata struct containing card details
     */
    function getCardMetadata(uint256 tokenId) external view returns (CardMetadata memory) {
        require(ownerOf(tokenId) != address(0), "CardNFT: Token does not exist");
        return _cardData[tokenId];
    }

    /**
     * @notice Get the token URI for a specific card
     * @param tokenId ID of the token
     * @return URI string pointing to the card's metadata
     * Format: baseURI + playerId + "-" + rarity + ".json"
     * Example: "ipfs://QmXxxx/1-0.json" for player 1, Common (rarity 0)
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "CardNFT: URI query for nonexistent token");
        
        CardMetadata memory metadata = _cardData[tokenId];
        
        // If specific metadata URI is set, use it
        if (bytes(metadata.metadataURI).length > 0) {
            return metadata.metadataURI;
        }
        
        // Otherwise construct from base URI, player ID, and rarity
        // Format: baseURI + playerId + "-" + rarity + ".json"
        return _constructTokenURI(metadata.playerId, metadata.rarity);
    }

    /**
     * @notice Set the base URI for token metadata
     * @param baseURI_ Base URI string (e.g., "ipfs://...")
     */
    function setBaseURI(string memory baseURI_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = baseURI_;
    }

    /**
     * @notice Get the base URI
     * @return Base URI string
     */
    function getBaseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @notice Get the current token ID counter value
     * @return Current token ID counter
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /**
     * @notice Set the maximum number of cards allowed per player for a specific rarity
     * @param rarity Rarity level (0=Common, 1=Uncommon, 2=Rare, 3=Epic, 4=Legendary)
     * @param maxCards Maximum number of cards per player for this rarity (0 = unlimited)
     * 
     * TODO: SET CAPS HERE - Configure max cards per rarity
     * Example usage after deployment:
     *   setMaxCardsPerRarity(0, 1000); // Common: 1000 cards max per player
     *   setMaxCardsPerRarity(1, 500);  // Uncommon: 500 cards max per player
     *   setMaxCardsPerRarity(2, 200);  // Rare: 200 cards max per player
     *   setMaxCardsPerRarity(3, 50);   // Epic: 50 cards max per player
     *   setMaxCardsPerRarity(4, 10);   // Legendary: 10 cards max per player
     */
    function setMaxCardsPerRarity(uint8 rarity, uint256 maxCards) external onlyRole(DEFAULT_ADMIN_ROLE) {
        maxCardsPerRarity[rarity] = maxCards;
        emit MaxCardsPerRarityUpdated(rarity, maxCards);
    }

    /**
     * @notice Get the maximum cards allowed per player for a specific rarity
     * @param rarity Rarity level
     * @return Maximum number of cards allowed (0 = unlimited)
     */
    function getMaxCardsPerRarity(uint8 rarity) external view returns (uint256) {
        return maxCardsPerRarity[rarity];
    }

    /**
     * @notice Get the number of cards minted for a specific player and rarity
     * @param playerId ID of the player
     * @param rarity Rarity level
     * @return Number of cards minted for this player at this rarity
     */
    function getPlayerCardCountByRarity(uint256 playerId, uint8 rarity) external view returns (uint256) {
        return playerCardCountByRarity[playerId][rarity];
    }

    /**
     * @dev Internal helper to construct token URI from base URI, player ID, and rarity
     * @param playerId ID of the player
     * @param rarity Rarity level of the card
     * @return Constructed URI string
     * Format: baseURI + playerId + "-" + rarity + ".json"
     * Example: "ipfs://QmXxxx/1-0.json" for player 1, Common (rarity 0)
     */
    function _constructTokenURI(uint256 playerId, uint8 rarity) internal view returns (string memory) {
        if (bytes(_baseTokenURI).length == 0) {
            return "";
        }
        
        // Format: baseURI + playerId + "-" + rarity + ".json"
        // Example: "ipfs://QmXxxx/1-0.json" for player 1, Common
        return string(abi.encodePacked(
            _baseTokenURI,
            _toString(playerId),
            "-",
            _toString(rarity),
            ".json"
        ));
    }

    /**
     * @dev Convert uint256 to string
     * @param value Value to convert
     * @return String representation of the value
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }

    /**
     * @dev Override supportsInterface to support AccessControl and ERC721
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
