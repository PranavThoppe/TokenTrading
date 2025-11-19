#!/bin/bash

# Setup script for Blockchain Trading Cards Platform

echo "Setting up Blockchain Trading Cards Platform..."

# Check if Foundry is installed
if ! command -v forge &> /dev/null
then
    echo "Foundry is not installed. Please install it first:"
    echo "curl -L https://foundry.paradigm.xyz | bash"
    echo "foundryup"
    exit 1
fi

echo "Installing OpenZeppelin contracts..."
forge install OpenZeppelin/openzeppelin-contracts

echo "Installing Chainlink contracts..."
forge install smartcontractkit/chainlink-brownie-contracts

echo "Installing Forge Standard Library..."
forge install foundry-rs/forge-std

echo "Building contracts..."
forge build

echo "Setup complete! Run 'forge test' to verify installation."
