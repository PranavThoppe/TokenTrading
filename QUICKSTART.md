# Quick Start Guide

## Installation

### 1. Install Foundry

**Unix/Linux/Mac:**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**Windows:**
Follow instructions at: https://book.getfoundry.sh/getting-started/installation

### 2. Install Project Dependencies

**Option A - Using setup script:**
```bash
# Unix/Linux/Mac
chmod +x setup.sh
./setup.sh

# Windows
setup.bat
```

**Option B - Manual installation:**
```bash
forge install OpenZeppelin/openzeppelin-contracts
forge install smartcontractkit/chainlink-brownie-contracts
forge install foundry-rs/forge-std
forge build
```

**Option C - Using Make (Unix/Linux/Mac):**
```bash
make install
make build
```

## Verify Installation

Run tests to verify everything is set up correctly:
```bash
forge test
```

You should see output indicating tests are running (even if no tests exist yet).

## Common Commands

| Command | Description |
|---------|-------------|
| `forge build` | Compile contracts |
| `forge test` | Run all tests |
| `forge test -vvv` | Run tests with detailed output |
| `forge coverage` | Generate coverage report |
| `forge fmt` | Format Solidity code |
| `forge clean` | Clean build artifacts |

## Next Steps

1. Review the [README.md](README.md) for project overview
2. Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
3. Start implementing contracts in the `src/` directory
4. Write tests in the `test/` directory
5. Create deployment scripts in the `script/` directory

## Project Structure

```
blockchain-trading-cards/
├── src/                    # Smart contracts
├── test/                   # Test files
├── script/                 # Deployment scripts
├── lib/                    # Dependencies
├── foundry.toml           # Foundry configuration
├── remappings.txt         # Import remappings
└── .env.example           # Environment variables template
```

## Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your configuration values:
- RPC URLs (Alchemy, Infura, etc.)
- Private key (for deployment)
- Etherscan API key (for verification)
- Chainlink VRF settings

**⚠️ NEVER commit your `.env` file with real credentials!**

## Troubleshooting

### Foundry not found
- Make sure Foundry is installed and in your PATH
- Run `foundryup` to update to the latest version

### Build errors
- Run `forge clean` and then `forge build`
- Check that dependencies are installed in `lib/`

### Test failures
- Ensure contracts compile successfully first
- Check that test setup is correct

## Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Chainlink VRF](https://docs.chain.link/vrf/v2/introduction)
