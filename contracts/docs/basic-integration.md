# NFTYFinanceV1 Integration Guide

Welcome to the NFTYFinanceV1 Integration Guide! This document is designed to help developers seamlessly integrate their applications with the NFTY Finance protocol. NFTYFinanceV1 is a smart contract protocol that facilitates lending and borrowing of ERC20 tokens using NFTs as collateral. The protocol is built with a focus on being fully on-chain, non-custodial, and independent of external oracles and intermediaries.

## Integration Steps

Integrating your application with NFTYFinanceV1 is developer-friendly, offering flexibility in choosing the Ethereum RPC stack that suits your preferences. Below are the steps for lenders and borrowers:

### For Lenders

**Step 1: Create Lending Desk**

Use the `initializeNewLendingDesk` function to establish a new lending desk within the NFTY Finance protocol. This enables you to define your lending parameters and get ready to offer loans.

JavaScript/TypeScript (using ethers.js) - Example:
```javascript
const initializeNewLendingDesk = async () => {
  // Connect to Ethereum network using ethers.js
  const provider = new ethers.providers.JsonRpcProvider('YOUR_RPC_URL');
  const signer = provider.getSigner();

  // Instantiate NFTYFinanceV1 contract
  const contract = new ethers.Contract('NFTYFinanceV1_CONTRACT_ADDRESS', NFTYFinanceV1_ABI, signer);

  // Prepare the inputs (erc20ToLoan, initialFundingAmount, loanConfigs)
  const erc20ToLoan = "0x..."
  const initialFundingAmount = 100
  const loanConfigs = [{
    nftCollection: erc721.address,
    minAmount: ethers.utils.parseUnits("10", 18),
    maxAmount: ethers.utils.parseUnits("100", 18),
    minDuration: BigNumber.from(24),
    maxDuration: BigNumber.from(240),
    minInterest: BigNumber.from(200),
    maxInterest: BigNumber.from(1500),
  }];

  // Call the initializeNewLendingDesk function
  const tx = await contract.initializeNewLendingDesk(erc20ToLoan, initialFundingAmount, loanConfigs);
  await tx.wait();

  console.log('Lending desk created successfully!');
};
```

Python (using web3.py) - Example:
```python
from web3 import Web3

w3 = Web3(Web3.HTTPProvider('YOUR_RPC_URL'))

# Get contract
contract = w3.eth.contract(address='NFTYFinanceV1_CONTRACT_ADDRESS', abi=NFTYFinanceV1_ABI)

# Prepare the inputs (erc20ToLoan, initialFundingAmount, loanConfigs)
erc20ToLoan = "0x..."
initialFundingAmount = 100
loanConfigs = [{
  nftCollection: erc721.address,
  minAmount: 1,
  maxAmount: 100,
  minDuration: 30,
  maxDuration: 120,
  minInterest: 100,
  maxInterest: 1000,
}];

# Call the initializeNewLendingDesk function
tx_hash = contract.functions.initializeNewLendingDesk(
  erc20ToLoan,
  initialFundingAmount,
  loanConfigs
).transact()
tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash)

print('Lending desk created successfully!')
```

### For Borrowers

**Step 1: Initialize Loan**

Borrowers can create loans against ERC20 tokens by providing NFT collateral through the `initializeNewLoan` function. This process is straightforward and requires minimal effort from borrowers.

JavaScript/TypeScript (using ethers.js) - Example:
```javascript
const initializeNewLoan = async () => {
  // Connect to Ethereum network using ethers.js
  const provider = new ethers.providers.JsonRpcProvider('YOUR_RPC_URL');
  const signer = provider.getSigner();

  // Instantiate NFTYFinanceV1 contract
  const contract = new ethers.Contract('NFTYFinanceV1_CONTRACT_ADDRESS', NFTYFinanceV1_ABI, signer);

  // call with parameters
  const _lendingDeskId = BigNumber.from(1);
  const _nftCollection = "0x..";
  const _nftId = BigNumber.from(1001)
  const _duration = BigNumber.from(30);
  const _amount = ethers.utils.parseUnits("50", 18);

  const tx = await contract.initializeNewLoan(
   _lendingDeskId,
   _nftCollection,
   _nftId,
   _duration,
   _amount,
  );
  await tx.wait();

  console.log('Loan initialized successfully!');
};
```

Python (using web3.py) - Example:
```python
from web3 import Web3

w3 = Web3(Web3.HTTPProvider('YOUR_RPC_URL'))

# Get contract
contract = w3.eth.contract(address='NFTYFinanceV1_CONTRACT_ADDRESS', abi=NFTYFinanceV1_ABI)

# call with params
_lendingDeskId = 1
_nftCollection = "0x.."
_nftId = 101
_duration = 30
_amount = 50

tx_hash = contract.functions.initializeNewLoan(
  _lendingDeskId,
  _nftCollection,
  _nftId,
  _duration,
  _amount,
).transact()
tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash)

print('Lending desk created successfully!')
```

## Best Practices
-
-
-

## Troubleshooting
Hop into the discord!

## Read More
For more in-depth information on the NFTY Finance protocol, contract interactions, and advanced features, please refer to the documentation in the `/contracts` directory.