# Dependencies Documentation

## Core Dependencies

### 1. OpenZeppelin Contracts

**Version:** Latest (installed via forge)  
**Repository:** https://github.com/OpenZeppelin/openzeppelin-contracts

**Purpose:**
- ERC-721 NFT standard implementation
- Access control (Ownable, AccessControl)
- Security utilities (ReentrancyGuard, Pausable)
- Safe math operations

**Key Contracts Used:**
- `ERC721.sol` - Base NFT implementation
- `ERC721URIStorage.sol` - Token URI management
- `AccessControl.sol` - Role-based permissions
- `ReentrancyGuard.sol` - Reentrancy protection
- `Ownable.sol` - Ownership management

**Installation:**
```bash
forge install OpenZeppelin/openzeppelin-contracts
```

**Import Example:**
```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
```

### 2. Chainlink Contracts

**Version:** Latest (installed via forge)  
**Repository:** https://github.com/smartcontractkit/chainlink-brownie-contracts

**Purpose:**
- Verifiable Random Function (VRF) for provably fair randomness
- Used for random card generation in pack opening

**Key Contracts Used:**
- `VRFConsumerBaseV2.sol` - VRF consumer base contract
- `VRFCoordinatorV2Interface.sol` - VRF coordinator interface

**Sepolia Testnet Configuration:**
- VRF Coordinator: `0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625`
- Key Hash: `0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c`
- Subscription required (create at https://vrf.chain.link/)

**Installation:**
```bash
forge install smartcontractkit/chainlink-brownie-contracts
```

**Import Example:**
```solidity
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
```

### 3. Forge Standard Library

**Version:** Latest (installed via forge)  
**Repository:** https://github.com/foundry-rs/forge-std

**Purpose:**
- Testing utilities and helpers
- Console logging for debugging
- VM cheatcodes for test manipulation

**Key Features:**
- `Test.sol` - Base test contract with assertions
- `console.sol` - Console logging
- `Vm.sol` - VM cheatcodes interface
- `Script.sol` - Base script contract for deployments

**Installation:**
```bash
forge install foundry-rs/forge-std
```

**Import Example:**
```solidity
import "forge-std/Test.sol";
import "forge-std/Script.sol";
import "forge-std/console.sol";
```

## Development Dependencies

### Foundry Toolkit

**Components:**
- **forge** - Build, test, and deploy contracts
- **cast** - Interact with contracts and blockchain
- **anvil** - Local Ethereum node for testing
- **chisel** - Solidity REPL for quick testing

**Installation:**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**Documentation:** https://book.getfoundry.sh/

## Dependency Management

### Installing Dependencies

All dependencies are managed through Foundry's package manager:

```bash
# Install a new dependency
forge install <github-org>/<repo-name>

# Update dependencies
forge update

# Remove a dependency
forge remove <dependency-name>
```

### Import Remappings

The `remappings.txt` file maps import paths to dependency locations:

```
@openzeppelin/=lib/openzeppelin-contracts/
@chainlink/=lib/chainlink-brownie-contracts/
forge-std/=lib/forge-std/src/
```

This allows clean imports in contracts:
```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
```

Instead of:
```solidity
import "lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
```

## Version Management

### Solidity Compiler

Configured in `foundry.toml`:
```toml
solc_version = "0.8.20"
```

**Why 0.8.20?**
- Built-in overflow/underflow protection
- Latest stable features
- Compatible with OpenZeppelin and Chainlink contracts
- Gas optimizations

### Updating Dependencies

To update all dependencies to latest versions:
```bash
forge update
```

To update a specific dependency:
```bash
forge update lib/<dependency-name>
```

## Security Considerations

### Dependency Audits

- **OpenZeppelin:** Extensively audited, industry standard
- **Chainlink:** Audited by multiple firms, battle-tested
- **Forge-std:** Maintained by Foundry team, widely used

### Best Practices

1. Pin dependency versions in production
2. Review dependency code before using
3. Keep dependencies updated for security patches
4. Use only necessary contracts from dependencies
5. Verify dependency integrity after installation

## Troubleshooting

### Dependency Installation Issues

**Problem:** Dependencies not found after installation  
**Solution:** Run `forge remappings` to verify remappings are correct

**Problem:** Import errors in contracts  
**Solution:** Check `remappings.txt` and ensure paths match

**Problem:** Compilation errors with dependencies  
**Solution:** Ensure Solidity version compatibility in `foundry.toml`

### Updating Issues

**Problem:** Conflicts after updating dependencies  
**Solution:** 
```bash
forge clean
forge update
forge build
```

## Additional Resources

- [Foundry Dependency Management](https://book.getfoundry.sh/projects/dependencies)
- [OpenZeppelin Contracts Documentation](https://docs.openzeppelin.com/contracts/)
- [Chainlink VRF Documentation](https://docs.chain.link/vrf/v2/introduction)
- [Forge-std Documentation](https://book.getfoundry.sh/reference/forge-std/)
