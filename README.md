# Blockchain Trading Cards Platform

A blockchain-based fantasy football trading card platform built on Ethereum using Foundry.

## Overview

This platform enables users to:
- Purchase and open card packs containing NFT trading cards
- Trade cards peer-to-peer with other users
- List cards on auctions and place bids
- View and manage their card collection

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) - Ethereum development toolkit
- [Node.js](https://nodejs.org/) (v16 or higher) - For additional tooling

## Installation

1. Install Foundry dependencies:
```bash
forge install OpenZeppelin/openzeppelin-contracts
forge install smartcontractkit/chainlink-brownie-contracts
forge install foundry-rs/forge-std
```

2. Build the contracts:
```bash
forge build
```

3. Run tests:
```bash
forge test
```

## Project Structure

```
.
├── src/                    # Smart contract source files
├── test/                   # Test files
├── script/                 # Deployment and interaction scripts
├── lib/                    # External dependencies
├── foundry.toml           # Foundry configuration
└── remappings.txt         # Import remappings
```

## Smart Contracts

- **CardNFT.sol** - ERC-721 NFT contract for trading cards
- **PackManager.sol** - Handles pack purchases and card minting
- **Marketplace.sol** - Peer-to-peer trading functionality
- **Auction.sol** - Auction system for card sales

## Testing

Run all tests:
```bash
forge test
```

Run tests with verbosity:
```bash
forge test -vvv
```

Run tests with coverage:
```bash
forge coverage
```

## Deployment

Deploy to Sepolia testnet:
```bash
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify
```

## Configuration

- Solidity Version: 0.8.20
- Target Network: Sepolia Testnet
- Optimizer: Enabled (200 runs)

## License

MIT
