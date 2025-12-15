// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./TestHelper.sol";
import "../src/CardNFT.sol";

/**
 * @title CardNFTTest
 * @notice Unit tests for the CardNFT contract
 */
contract CardNFTTest is TestHelper {
    CardNFT public cardNFT;
    
    // Test constants
    string constant NAME = "NFL Trading Cards";
    string constant SYMBOL = "NFL";
    string constant BASE_URI = "ipfs://QmTest/";
    
    // Rarity levels
    uint8 constant COMMON = 0;
    uint8 constant UNCOMMON = 1;
    uint8 constant RARE = 2;
    uint8 constant EPIC = 3;
    uint8 constant LEGENDARY = 4;
    
    // Player IDs
    uint256 constant PLAYER_1 = 1001;
    uint256 constant PLAYER_2 = 1002;
    uint256 constant PLAYER_3 = 1003;
    
    // Events to test
    event CardMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 playerId,
        uint8 rarity
    );
    
    function setUp() public override {
        super.setUp();
        
        // Deploy CardNFT contract (test contract is the deployer)
        cardNFT = new CardNFT(NAME, SYMBOL);
        cardNFT.setBaseURI(BASE_URI);
        
        // Grant admin role to deployer address for testing
        cardNFT.grantRole(cardNFT.DEFAULT_ADMIN_ROLE(), deployer);
    }
    
    // ============ Constructor Tests ============
    
    function test_Constructor_SetsNameAndSymbol() public view {
        assertEq(cardNFT.name(), NAME);
        assertEq(cardNFT.symbol(), SYMBOL);
    }
    
    function test_Constructor_GrantsAdminRoleToDeployer() public view {
        // The test contract itself is the deployer in Foundry
        assertTrue(cardNFT.hasRole(cardNFT.DEFAULT_ADMIN_ROLE(), address(this)));
    }
    
    function test_Constructor_InitializesTokenIdCounterAtOne() public view {
        assertEq(cardNFT.getCurrentTokenId(), 0);
    }
    
    // ============ Minting Tests ============
    
    function test_MintCard_RevertsWhenCallerNotMinter() public {
        vm.prank(user1);
        vm.expectRevert();
        cardNFT.mintCard(user1, PLAYER_1, COMMON);
    }
    
    function test_MintCard_SucceedsWithMinterRole() public {
        // Grant minter role to user1
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        // Mint card
        vm.prank(user1);
        uint256 tokenId = cardNFT.mintCard(user2, PLAYER_1, COMMON);
        
        assertEq(tokenId, 1);
        assertEq(cardNFT.ownerOf(tokenId), user2);
    }
    
    function test_MintCard_EmitsCardMintedEvent() public {
        // Grant minter role
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        // Expect event
        vm.expectEmit(true, true, false, true);
        emit CardMinted(1, user2, PLAYER_1, COMMON);
        
        // Mint card
        vm.prank(user1);
        cardNFT.mintCard(user2, PLAYER_1, COMMON);
    }
    
    function test_MintCard_IncrementsTokenId() public {
        // Grant minter role
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        vm.startPrank(user1);
        uint256 tokenId1 = cardNFT.mintCard(user2, PLAYER_1, COMMON);
        uint256 tokenId2 = cardNFT.mintCard(user2, PLAYER_2, RARE);
        uint256 tokenId3 = cardNFT.mintCard(user2, PLAYER_3, LEGENDARY);
        vm.stopPrank();
        
        assertEq(tokenId1, 1);
        assertEq(tokenId2, 2);
        assertEq(tokenId3, 3);
        assertEq(cardNFT.getCurrentTokenId(), 3);
    }
    
    function test_MintCard_WithDifferentRarityLevels() public {
        // Grant minter role
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        vm.startPrank(user1);
        uint256 commonToken = cardNFT.mintCard(user2, PLAYER_1, COMMON);
        uint256 uncommonToken = cardNFT.mintCard(user2, PLAYER_1, UNCOMMON);
        uint256 rareToken = cardNFT.mintCard(user2, PLAYER_1, RARE);
        uint256 epicToken = cardNFT.mintCard(user2, PLAYER_1, EPIC);
        uint256 legendaryToken = cardNFT.mintCard(user2, PLAYER_1, LEGENDARY);
        vm.stopPrank();
        
        // Verify all tokens were minted
        assertEq(cardNFT.ownerOf(commonToken), user2);
        assertEq(cardNFT.ownerOf(uncommonToken), user2);
        assertEq(cardNFT.ownerOf(rareToken), user2);
        assertEq(cardNFT.ownerOf(epicToken), user2);
        assertEq(cardNFT.ownerOf(legendaryToken), user2);
        
        // Verify metadata has correct rarity
        assertEq(cardNFT.getCardMetadata(commonToken).rarity, COMMON);
        assertEq(cardNFT.getCardMetadata(uncommonToken).rarity, UNCOMMON);
        assertEq(cardNFT.getCardMetadata(rareToken).rarity, RARE);
        assertEq(cardNFT.getCardMetadata(epicToken).rarity, EPIC);
        assertEq(cardNFT.getCardMetadata(legendaryToken).rarity, LEGENDARY);
    }
    
    function test_MintCard_UpdatesRaritySupply() public {
        // Grant minter role
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        // Initial supply should be 0
        assertEq(cardNFT.raritySupply(COMMON), 0);
        assertEq(cardNFT.raritySupply(LEGENDARY), 0);
        
        vm.startPrank(user1);
        cardNFT.mintCard(user2, PLAYER_1, COMMON);
        cardNFT.mintCard(user2, PLAYER_2, COMMON);
        cardNFT.mintCard(user2, PLAYER_3, LEGENDARY);
        vm.stopPrank();
        
        // Verify supply tracking
        assertEq(cardNFT.raritySupply(COMMON), 2);
        assertEq(cardNFT.raritySupply(LEGENDARY), 1);
    }
    
    // ============ Metadata Tests ============
    
    function test_GetCardMetadata_ReturnsCorrectData() public {
        // Grant minter role and mint card
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        uint256 mintTime = block.timestamp;
        
        vm.prank(user1);
        uint256 tokenId = cardNFT.mintCard(user2, PLAYER_1, RARE);
        
        // Get metadata
        CardNFT.CardMetadata memory metadata = cardNFT.getCardMetadata(tokenId);
        
        assertEq(metadata.playerId, PLAYER_1);
        assertEq(metadata.rarity, RARE);
        assertEq(metadata.mintTimestamp, mintTime);
    }
    
    function test_GetCardMetadata_RevertsForNonexistentToken() public {
        vm.expectRevert();
        cardNFT.getCardMetadata(999);
    }
    
    function test_GetCardMetadata_StoresMultipleCardsCorrectly() public {
        // Grant minter role
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        vm.startPrank(user1);
        uint256 token1 = cardNFT.mintCard(user2, PLAYER_1, COMMON);
        uint256 token2 = cardNFT.mintCard(user2, PLAYER_2, RARE);
        uint256 token3 = cardNFT.mintCard(user2, PLAYER_3, LEGENDARY);
        vm.stopPrank();
        
        // Verify each card has correct metadata
        CardNFT.CardMetadata memory meta1 = cardNFT.getCardMetadata(token1);
        CardNFT.CardMetadata memory meta2 = cardNFT.getCardMetadata(token2);
        CardNFT.CardMetadata memory meta3 = cardNFT.getCardMetadata(token3);
        
        assertEq(meta1.playerId, PLAYER_1);
        assertEq(meta1.rarity, COMMON);
        
        assertEq(meta2.playerId, PLAYER_2);
        assertEq(meta2.rarity, RARE);
        
        assertEq(meta3.playerId, PLAYER_3);
        assertEq(meta3.rarity, LEGENDARY);
    }
    
    // ============ Token URI Tests ============
    
    function test_TokenURI_ConstructsFromBaseURIAndPlayerIdAndRarity() public {
        // Grant minter role and mint card
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        vm.prank(user1);
        uint256 tokenId = cardNFT.mintCard(user2, PLAYER_1, COMMON);
        
        string memory uri = cardNFT.tokenURI(tokenId);
        // Format: baseURI + playerId + "-" + rarity + ".json"
        assertEq(uri, string(abi.encodePacked(BASE_URI, "1001-0.json")));
    }
    
    function test_TokenURI_RevertsForNonexistentToken() public {
        vm.expectRevert();
        cardNFT.tokenURI(999);
    }
    
    function test_SetBaseURI_OnlyAdminCanSet() public {
        // Non-admin should fail
        vm.prank(user1);
        vm.expectRevert();
        cardNFT.setBaseURI("ipfs://NewURI/");
        
        // Admin should succeed
        vm.prank(deployer);
        cardNFT.setBaseURI("ipfs://NewURI/");
        
        assertEq(cardNFT.getBaseURI(), "ipfs://NewURI/");
    }
    
    function test_TokenURI_UpdatesWhenBaseURIChanges() public {
        // Grant minter role and mint card
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        vm.prank(user1);
        uint256 tokenId = cardNFT.mintCard(user2, PLAYER_1, COMMON);
        
        // Check initial URI (format: baseURI + playerId + "-" + rarity + ".json")
        string memory uri1 = cardNFT.tokenURI(tokenId);
        assertEq(uri1, string(abi.encodePacked(BASE_URI, "1001-0.json")));
        
        // Update base URI
        vm.prank(deployer);
        cardNFT.setBaseURI("ipfs://NewBase/");
        
        // Check updated URI
        string memory uri2 = cardNFT.tokenURI(tokenId);
        assertEq(uri2, "ipfs://NewBase/1001-0.json");
    }
    
    // ============ Ownership Transfer Tests ============
    
    function test_TransferFrom_OwnerCanTransfer() public {
        // Grant minter role and mint card
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        vm.prank(user1);
        uint256 tokenId = cardNFT.mintCard(user2, PLAYER_1, COMMON);
        
        // Transfer from user2 to user3
        vm.prank(user2);
        cardNFT.transferFrom(user2, user3, tokenId);
        
        assertEq(cardNFT.ownerOf(tokenId), user3);
    }
    
    function test_TransferFrom_NonOwnerCannotTransfer() public {
        // Grant minter role and mint card
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        vm.prank(user1);
        uint256 tokenId = cardNFT.mintCard(user2, PLAYER_1, COMMON);
        
        // user3 tries to transfer user2's card
        vm.prank(user3);
        vm.expectRevert();
        cardNFT.transferFrom(user2, user3, tokenId);
    }
    
    function test_SafeTransferFrom_WorksCorrectly() public {
        // Grant minter role and mint card
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        vm.prank(user1);
        uint256 tokenId = cardNFT.mintCard(user2, PLAYER_1, COMMON);
        
        // Safe transfer from user2 to user3
        vm.prank(user2);
        cardNFT.safeTransferFrom(user2, user3, tokenId);
        
        assertEq(cardNFT.ownerOf(tokenId), user3);
    }
    
    function test_Approve_AllowsApprovedAddressToTransfer() public {
        // Grant minter role and mint card
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        vm.prank(user1);
        uint256 tokenId = cardNFT.mintCard(user2, PLAYER_1, COMMON);
        
        // user2 approves user3
        vm.prank(user2);
        cardNFT.approve(user3, tokenId);
        
        // user3 can now transfer
        vm.prank(user3);
        cardNFT.transferFrom(user2, user3, tokenId);
        
        assertEq(cardNFT.ownerOf(tokenId), user3);
    }
    
    function test_SetApprovalForAll_AllowsOperatorToTransferAll() public {
        // Grant minter role and mint cards
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        vm.startPrank(user1);
        uint256 token1 = cardNFT.mintCard(user2, PLAYER_1, COMMON);
        uint256 token2 = cardNFT.mintCard(user2, PLAYER_2, RARE);
        vm.stopPrank();
        
        // user2 sets user3 as operator for all tokens
        vm.prank(user2);
        cardNFT.setApprovalForAll(user3, true);
        
        // user3 can transfer both tokens
        vm.startPrank(user3);
        cardNFT.transferFrom(user2, user3, token1);
        cardNFT.transferFrom(user2, user3, token2);
        vm.stopPrank();
        
        assertEq(cardNFT.ownerOf(token1), user3);
        assertEq(cardNFT.ownerOf(token2), user3);
    }
    
    function test_BalanceOf_TracksOwnershipCorrectly() public {
        // Grant minter role
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        // Initial balance should be 0
        assertEq(cardNFT.balanceOf(user2), 0);
        
        // Mint 3 cards to user2
        vm.startPrank(user1);
        cardNFT.mintCard(user2, PLAYER_1, COMMON);
        cardNFT.mintCard(user2, PLAYER_2, RARE);
        cardNFT.mintCard(user2, PLAYER_3, LEGENDARY);
        vm.stopPrank();
        
        assertEq(cardNFT.balanceOf(user2), 3);
    }
    
    // ============ Access Control Tests ============
    
    function test_AccessControl_OnlyAdminCanGrantMinterRole() public {
        // Verify user2 doesn't have minter role initially
        assertFalse(cardNFT.hasRole(cardNFT.MINTER_ROLE(), user2));
        
        // Non-admin attempt should revert with AccessControlUnauthorizedAccount
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                0x6697b232, // AccessControlUnauthorizedAccount selector
                user1,
                cardNFT.DEFAULT_ADMIN_ROLE()
            )
        );
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user2);
        
        // Verify role was not granted
        assertFalse(cardNFT.hasRole(cardNFT.MINTER_ROLE(), user2));
        
        // Admin can grant minter role
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user2);
        
        assertTrue(cardNFT.hasRole(cardNFT.MINTER_ROLE(), user2));
    }
    
    function test_AccessControl_OnlyAdminCanRevokeMinterRole() public {
        // Grant minter role first
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        // Verify role was granted
        assertTrue(cardNFT.hasRole(cardNFT.MINTER_ROLE(), user1));
        
        // Non-admin attempt should revert with AccessControlUnauthorizedAccount
        vm.prank(user2);
        vm.expectRevert(
            abi.encodeWithSelector(
                0x6697b232, // AccessControlUnauthorizedAccount selector
                user2,
                cardNFT.DEFAULT_ADMIN_ROLE()
            )
        );
        cardNFT.revokeRole(cardNFT.MINTER_ROLE(), user1);
        
        // Verify role was not revoked
        assertTrue(cardNFT.hasRole(cardNFT.MINTER_ROLE(), user1));
        
        // Admin can revoke
        vm.prank(deployer);
        cardNFT.revokeRole(cardNFT.MINTER_ROLE(), user1);
        
        assertFalse(cardNFT.hasRole(cardNFT.MINTER_ROLE(), user1));
    }
    
    function test_AccessControl_RevokedMinterCannotMint() public {
        // Grant and then revoke minter role
        vm.startPrank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        cardNFT.revokeRole(cardNFT.MINTER_ROLE(), user1);
        vm.stopPrank();
        
        // user1 should not be able to mint
        vm.prank(user1);
        vm.expectRevert();
        cardNFT.mintCard(user2, PLAYER_1, COMMON);
    }
    
    function test_AccessControl_MultipleMinters() public {
        // Grant minter role to multiple addresses
        vm.startPrank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user2);
        vm.stopPrank();
        
        // Both should be able to mint
        vm.prank(user1);
        uint256 token1 = cardNFT.mintCard(user3, PLAYER_1, COMMON);
        
        vm.prank(user2);
        uint256 token2 = cardNFT.mintCard(user3, PLAYER_2, RARE);
        
        assertEq(cardNFT.ownerOf(token1), user3);
        assertEq(cardNFT.ownerOf(token2), user3);
    }
    
    // ============ ERC-721 Compliance Tests ============
    
    function test_ERC721_SupportsInterface() public view {
        // ERC-721 interface ID
        bytes4 erc721InterfaceId = 0x80ac58cd;
        assertTrue(cardNFT.supportsInterface(erc721InterfaceId));
        
        // ERC-165 interface ID
        bytes4 erc165InterfaceId = 0x01ffc9a7;
        assertTrue(cardNFT.supportsInterface(erc165InterfaceId));
        
        // AccessControl interface ID
        bytes4 accessControlInterfaceId = 0x7965db0b;
        assertTrue(cardNFT.supportsInterface(accessControlInterfaceId));
    }
    
    function test_ERC721_OwnerOfReturnsCorrectOwner() public {
        // Grant minter role and mint card
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        vm.prank(user1);
        uint256 tokenId = cardNFT.mintCard(user2, PLAYER_1, COMMON);
        
        assertEq(cardNFT.ownerOf(tokenId), user2);
    }
    
    function test_ERC721_OwnerOfRevertsForNonexistentToken() public {
        vm.expectRevert();
        cardNFT.ownerOf(999);
    }
    
    function test_ERC721_GetApprovedReturnsZeroInitially() public {
        // Grant minter role and mint card
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        vm.prank(user1);
        uint256 tokenId = cardNFT.mintCard(user2, PLAYER_1, COMMON);
        
        assertEq(cardNFT.getApproved(tokenId), address(0));
    }
    
    function test_ERC721_GetApprovedReturnsApprovedAddress() public {
        // Grant minter role and mint card
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        vm.prank(user1);
        uint256 tokenId = cardNFT.mintCard(user2, PLAYER_1, COMMON);
        
        // Approve user3
        vm.prank(user2);
        cardNFT.approve(user3, tokenId);
        
        assertEq(cardNFT.getApproved(tokenId), user3);
    }
    
    function test_ERC721_IsApprovedForAllReturnsFalseInitially() public view {
        assertFalse(cardNFT.isApprovedForAll(user2, user3));
    }
    
    function test_ERC721_IsApprovedForAllReturnsTrueAfterApproval() public {
        vm.prank(user2);
        cardNFT.setApprovalForAll(user3, true);
        
        assertTrue(cardNFT.isApprovedForAll(user2, user3));
    }
    
    // ============ Edge Cases and Integration Tests ============
    
    function test_MintCard_ToZeroAddressReverts() public {
        // Grant minter role
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        // Minting to zero address should revert
        vm.prank(user1);
        vm.expectRevert();
        cardNFT.mintCard(address(0), PLAYER_1, COMMON);
    }
    
    function test_TransferMetadataRemainsIntact() public {
        // Grant minter role and mint card
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        vm.prank(user1);
        uint256 tokenId = cardNFT.mintCard(user2, PLAYER_1, RARE);
        
        // Get metadata before transfer
        CardNFT.CardMetadata memory metaBefore = cardNFT.getCardMetadata(tokenId);
        
        // Transfer card
        vm.prank(user2);
        cardNFT.transferFrom(user2, user3, tokenId);
        
        // Get metadata after transfer
        CardNFT.CardMetadata memory metaAfter = cardNFT.getCardMetadata(tokenId);
        
        // Metadata should remain the same
        assertEq(metaAfter.playerId, metaBefore.playerId);
        assertEq(metaAfter.rarity, metaBefore.rarity);
        assertEq(metaAfter.mintTimestamp, metaBefore.mintTimestamp);
    }
    
    function test_MultipleCardsWithSamePlayerIdButDifferentRarity() public {
        // Grant minter role
        vm.prank(deployer);
        cardNFT.grantRole(cardNFT.MINTER_ROLE(), user1);
        
        // Mint same player with different rarities
        vm.startPrank(user1);
        uint256 token1 = cardNFT.mintCard(user2, PLAYER_1, COMMON);
        uint256 token2 = cardNFT.mintCard(user2, PLAYER_1, LEGENDARY);
        vm.stopPrank();
        
        // Both should exist with different rarities
        assertEq(cardNFT.getCardMetadata(token1).playerId, PLAYER_1);
        assertEq(cardNFT.getCardMetadata(token1).rarity, COMMON);
        
        assertEq(cardNFT.getCardMetadata(token2).playerId, PLAYER_1);
        assertEq(cardNFT.getCardMetadata(token2).rarity, LEGENDARY);
    }
}
