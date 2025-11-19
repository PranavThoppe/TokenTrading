# Contributing Guide

## Development Setup

### Prerequisites

1. Install Foundry:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. Clone and setup:
```bash
git clone <repository-url>
cd blockchain-trading-cards
```

3. Install dependencies:
```bash
# On Unix/Linux/Mac
chmod +x setup.sh
./setup.sh

# On Windows
setup.bat

# Or manually
forge install
```

## Development Workflow

### Building

```bash
forge build
```

### Testing

Run all tests:
```bash
forge test
```

Run with verbosity:
```bash
forge test -vvv
```

Run specific test:
```bash
forge test --match-test testFunctionName
```

Run with gas reporting:
```bash
forge test --gas-report
```

### Coverage

Generate coverage report:
```bash
forge coverage
```

### Formatting

Format all Solidity files:
```bash
forge fmt
```

### Local Development

Start local Ethereum node:
```bash
anvil
```

Deploy to local node:
```bash
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

## Code Standards

### Solidity Style Guide

- Follow the [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use NatSpec comments for all public functions
- Keep functions small and focused
- Use descriptive variable names

### Testing Standards

- Write tests for all new functionality
- Aim for high test coverage (>80%)
- Test both success and failure cases
- Use descriptive test names: `test_FunctionName_Condition_ExpectedOutcome`

### Security Best Practices

- Use OpenZeppelin contracts where possible
- Implement reentrancy guards on payable functions
- Validate all inputs
- Use access control for privileged functions
- Follow checks-effects-interactions pattern

## Commit Guidelines

- Use clear, descriptive commit messages
- Reference issue numbers when applicable
- Keep commits focused on single changes

## Pull Request Process

1. Create a feature branch
2. Implement changes with tests
3. Ensure all tests pass
4. Update documentation if needed
5. Submit PR with clear description
6. Address review feedback

## Questions?

Open an issue for any questions or concerns.
