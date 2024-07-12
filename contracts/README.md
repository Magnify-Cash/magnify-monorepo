# MagnifyCash - V1
MagnifyCash V1 is a smart contract protocol that facilitates lending and borrowing of ERC20 tokens using NFTs as collateral. The protocol introduces a novel AMM-style architecture called "LAMM" (Lending Automated Market Maker) for lending markets.

The protocol provides a simple but powerful DeFi primitive where any NFT can be lent against any fungible token. All lending parameters are fully customizable - duration, interest, and loan value - offering liquidity providers a full range of capital utilization.

Going a step further all objects in the protocol are tokenized (liquidity, credit, and debit positions). The goal here is a composable base layer where developers can steadily build on top of for years to come.

To sustain the protocol and its community long-term, a 2% loan origination fee is levied on all loans issued, which is split equally between the protocol insurance fund, NFT royalty payouts, and protocol revenue.


<INSERT GRAPHIC HERE>


## Contracts
The MagnifyCashV1 protocol consists of a single core contract and several peripheral contracts. Here is the contract structure:

- `MagnifyCashV1.sol`: Core protocol module.
- `MagnifyCashERC721.sol`: Abstract ERC721 with built-in roles.
- `MagnifyLendingKeysV1.sol`: Lending Desk NFT, tokenizing lending desk ownership.
- `MagnifyObligationNotesV1.sol`: Obligation note NFT, tokenizing a borrower's obligation to repay the loan.

## Contract Structure

The contract is organized into the following sections:

1. Storage: Defines the storage variables used by the contract.
2. Events: Defines the events emitted by the contract.
3. Constructor: Initializes the contract with provided addresses and sets the loan origination fee.
4. Core Functions: Implements the core functionality of the contract, including creating lending desks, configuring loan parameters, depositing/withdrawing liquidity, borrowing loans, repaying loans, and liquidating defaulted loans.
5. Admin Functions: Implements the admin functionality of the contract, such as setting loan origination fees, withdrawing platform fees, and pausing/unpausing the protocol.
