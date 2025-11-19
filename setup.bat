@echo off
REM Setup script for Blockchain Trading Cards Platform (Windows)

echo Setting up Blockchain Trading Cards Platform...

REM Check if Foundry is installed
where forge >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Foundry is not installed. Please install it first:
    echo Visit: https://book.getfoundry.sh/getting-started/installation
    exit /b 1
)

echo Installing OpenZeppelin contracts...
forge install OpenZeppelin/openzeppelin-contracts

echo Installing Chainlink contracts...
forge install smartcontractkit/chainlink-brownie-contracts

echo Installing Forge Standard Library...
forge install foundry-rs/forge-std

echo Building contracts...
forge build

echo Setup complete! Run 'forge test' to verify installation.
