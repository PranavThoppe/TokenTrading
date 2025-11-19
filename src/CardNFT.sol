// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CardNFT
 * @notice ERC-721 NFT contract for fantasy football trading cards
 * @dev Implements card minting with metadata and rarity tracking
 */
contract CardNFT is ERC721, AccessControl {
    using Counters for Counters.Counter;

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
    Counters.Counter private _tokenIdCounter;

    // Mapping from token ID to card metadata
    mapping(uint256 => CardMetadata) private _cardData;

    // Mapping to track supply by rarity level
    mapping(uint8 => uint256) public raritySupply;

    // Base URI for metadata
    string private _baseTokenURI;

    // Events
    event CardMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 playerId,
        uint8 rarity
    );

    /**
     * @notice Constructor to initialize the Card NFT contract
     * @param name_ Name of the NFT collection
     * @param symbol_ Symbol of the NFT collection
     */
    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
        // Grant admin role to contract deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
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
        // Increment token ID counter
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        // Mint the token
        _safeMint(to, tokenId);

        // Store card metadata
        _cardData[tokenId] = CardMetadata({
            playerId: playerId,
            rarity: rarity,
            mintTimestamp: block.timestamp,
            metadataURI: ""
        });

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
        require(_exists(tokenId), "CardNFT: Token does not exist");
        return _cardData[tokenId];
    }

    /**
     * @notice Get the token URI for a specific card
     * @param tokenId ID of the token
     * @return URI string pointing to the card's metadata
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "CardNFT: URI query for nonexistent token");
        
        CardMetadata memory metadata = _cardData[tokenId];
        
        // If specific metadata URI is set, use it
        if (bytes(metadata.metadataURI).length > 0) {
            return metadata.metadataURI;
        }
        
        // Otherwise construct from base URI and player ID
        return _constructTokenURI(metadata.playerId);
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
        return _tokenIdCounter.current();
    }

    /**
     * @dev Internal helper to construct token URI from base URI and player ID
     * @param playerId ID of the player
     * @return Constructed URI string
     */
    function _constructTokenURI(uint256 playerId) internal view returns (string memory) {
        if (bytes(_baseTokenURI).length == 0) {
            return "";
        }
        
        return string(abi.encodePacked(_baseTokenURI, _toString(playerId), ".json"));
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
