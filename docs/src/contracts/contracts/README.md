## Contracts
The MagnifyCash protocol consists of a single core contract and several peripheral contracts. Below is the contract structure:

- [`MagnifyCashV1.sol`](contracts/contracts/MagnifyCashV1.sol/contract.MagnifyCashV1.md): Core protocol module.
- [`MagnifyERC721.sol`](contracts/contracts/MagnifyERC721V1.sol/contract.MagnifyERC721V1.md): Abstract ERC721 with built-in roles.
- [`MagnifyLendingKeysV1.sol`](contracts/contracts/MagnifyLendingKeysV1.sol/contract.MagnifyLendingKeysV1.md): Lending desk NFT, tokenizing lending desk ownership.
- [`MagnifyObligationNotesV1.sol`](contracts/contracts/MagnifyObligationNotesV1.sol/contract.MagnifyObligationNotesV1.md): Obligation note NFT, tokenizing a borrower's obligation to repay the loan.
