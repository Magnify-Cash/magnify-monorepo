# NFTYFinanceV1 Integration Guide

Welcome to the NFTYFinanceV1 Integration Guide! This document is designed to help developers seamlessly integrate their applications with the NFTY Finance protocol. NFTYFinanceV1 is a smart contract protocol that facilitates lending and borrowing of ERC20 tokens using NFTs as collateral. The protocol is built with a focus on being fully on-chain, non-custodial, and independent of external oracles and intermediaries.

## Protocol Overview

NFTY Finance introduces "LAMM" (Lending Automated Market Maker), an innovative AMM-style architecture for lending markets. The core contracts that power the protocol are as follows:

- `NFTYFinanceV1.sol`: Contains the core protocol module.
- `NFTYFinanceERC721.sol`: An abstract ERC721 with built-in roles, meant for inheritance by other ERC721 contracts.
- `NFTYLendingKeysV1.sol`: Manages lending desk ownership.
- `NFTYObligationNotesV1.sol`: Handles a borrower's obligation to repay.
- `NFTYPromissoryNotesV1.sol`: Represents the lender's promise to be repaid.

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

  // Call the initializeNewLendingDesk function
  const tx = await contract.initializeNewLendingDesk();
  await tx.wait();

  console.log('Lending desk created successfully!');
};
```

Python (using web3.py) - Example:
```python
from web3 import Web3

w3 = Web3(Web3.HTTPProvider('YOUR_RPC_URL'))

contract = w3.eth.contract(address='NFTYFinanceV1_CONTRACT_ADDRESS', abi=NFTYFinanceV1_ABI)

tx_hash = contract.functions.initializeNewLendingDesk().transact()
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

  // Call the initializeNewLoan function with necessary parameters
  const tx = await contract.initializeNewLoan('TOKEN_ADDRESS', 'NFT_ADDRESS', 'NFT_ID', 'AMOUNT_TO_BORROW');
  await tx.wait();

  console.log('Loan initialized successfully!');
};
```

Python (using web3.py) - Example:
```python
from web3 import Web3

w3 = Web3(Web3.HTTPProvider('YOUR_RPC_URL'))

contract = w3.eth.contract(address='NFTYFinanceV1_CONTRACT_ADDRESS', abi=NFTYFinanceV1_ABI)

tx_hash = contract.functions.initializeNewLoan().transact()
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

## Conclusion
Integrating with NFTYFinanceV1 empowers developers with a powerful and flexible lending and borrowing solution, all directly on-chain. Utilize the provided examples and guidelines to seamlessly incorporate NFTY Finance into your application. For any challenges or questions, don't hesitate to seek support from the NFTY Finance community. Happy integrating!