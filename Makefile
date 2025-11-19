.PHONY: install build test clean coverage deploy-sepolia

# Install dependencies
install:
	forge install OpenZeppelin/openzeppelin-contracts
	forge install smartcontractkit/chainlink-brownie-contracts
	forge install foundry-rs/forge-std

# Build contracts
build:
	forge build

# Run tests
test:
	forge test

# Run tests with verbosity
test-v:
	forge test -vvv

# Run tests with gas reporting
test-gas:
	forge test --gas-report

# Generate coverage report
coverage:
	forge coverage

# Clean build artifacts
clean:
	forge clean

# Format code
format:
	forge fmt

# Deploy to Sepolia testnet
deploy-sepolia:
	forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify

# Run local node
anvil:
	anvil

# Help
help:
	@echo "Available commands:"
	@echo "  make install        - Install dependencies"
	@echo "  make build          - Build contracts"
	@echo "  make test           - Run tests"
	@echo "  make test-v         - Run tests with verbosity"
	@echo "  make test-gas       - Run tests with gas reporting"
	@echo "  make coverage       - Generate coverage report"
	@echo "  make clean          - Clean build artifacts"
	@echo "  make format         - Format code"
	@echo "  make deploy-sepolia - Deploy to Sepolia testnet"
	@echo "  make anvil          - Run local Ethereum node"
