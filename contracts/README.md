# NFTYFinance - V1
NFTYFinance V1 is a smart contract protocol that facilitates lending and borrowing of ERC20 tokens using NFTs as collateral. The protocol introduces a novel AMM-style architecture called "LAMM" (Lending Automated Market Maker) for lending markets.

The protocol provides a simple but powerful DeFi primitive where any NFT can be lent against any fungible token. All lending parameters are fully customizable - duration, interest, and loan value - offering liquidity providers a full range of capital utilization.

Going a step further all objects in the protocol are tokenized (liquidity, credit, and debit positions). The goal here is a composable base layer where developers can steadily build on top of for years to come.

To sustain the protocol and its community long-term, a 2% loan origination fee is levied on all loans issued, which is split equally between the protocol insurance fund, NFT royalty payouts, and protocol revenue.


<INSERT GRAPHIC HERE>


## Contracts
The NFTYFinanceV1 protocol consists of a single core contract and several peripheral contracts. Here is the contract structure:

- `NFTYFinanceV1.sol`: Core protocol module.
- `NFTYFinanceERC721.sol`: Abstract ERC721 with built-in roles.
- `NFTYLendingKeysV1.sol`: Lending Desk NFT, tokenizing lending desk ownership.
- `NFTYObligationNotesV1.sol`: Obligation note NFT, tokenizing a borrower's obligation to repay the loan.
- `NFTYPromissoryNotesV1.sol`: Promissory note NFT, tokenizing a lender's promise to be repaid.

## Dependencies
The contract relies on the following external contracts and libraries:

- OpenZeppelin Contracts (version 4.3.0)
  - `Ownable.sol`
  - `Pausable.sol`
  - `SafeERC20.sol`
  - `IERC721.sol`
  - `IERC1155.sol`
  - `ERC721Holder.sol`
  - `ERC1155Holder.sol`
  - `ERC165Checker.sol`

## Contract Structure

The contract is organized into the following sections:

1. Storage: Defines the storage variables used by the contract.
2. Events: Defines the events emitted by the contract.
3. Constructor: Initializes the contract with provided addresses and sets the loan origination fee.
4. Core Functions: Implements the core functionality of the contract, including creating lending desks, configuring loan parameters, depositing/withdrawing liquidity, borrowing loans, repaying loans, and liquidating defaulted loans.
5. Admin Functions: Implements the admin functionality of the contract, such as setting loan origination fees, withdrawing platform fees, and pausing/unpausing the protocol.

## Contract Functions

The contract provides the following functions:

### Core Functions
1. `initializeNewLendingDesk`: Initializes a new lending desk.
2. `setLendingDeskLoanConfigs`: Sets loan parameters for a lending desk and NFT collection.
3. `removeLendingDeskLoanConfig`: Removes support for an NFT collection from a lending desk.
4. `depositLendingDeskLiquidity`: Deposits liquidity into a lending desk.
5. `withdrawLendingDeskLiquidity`: Withdraws liquidity from a lending desk.
6. `setLendingDeskState`: Pauses/unpauses the lending desk state (active or frozen).
7. `dissolveLendingDesk`: Dissolves a lending desk (non-reversible action).
8. `initializeNewLoan`: Creates a loan against an ERC20 token using NFT collateral.
9. `makeLoanPayment`: Make a payment on loan
10. `liquidateDefaultedLoan`: Liquidates a defaulted loan.

### Admin Functions
11. `setLoanOriginationFee`: Sets the loan origination fee.
12. `withdrawPlatformFees`: Withdraws the loan origination fee for specified ERC20 tokens.
13. `setPaused`: Pauses / unpauses the contract


## Events

The contract emits the following events:

1. `NewLendingDeskInitialized`: Emitted when a new lending desk is created.
2. `LendingDeskLoanConfigsSet`: Emitted when a lending desk's loan configurations are set.
3. `LendingDeskLoanConfigRemoved`: Emitted when a lending desk's support for an NFT collection is removed.
4. `LendingDeskLiquidityDeposited`: Emitted when liquidity is added to a lending desk.
5. `LendingDeskLiquidityWithdrawn`: Emitted when liquidity is withdrawn from a lending desk.
6. `LendingDeskStateSet`: Emitted when a lending desk is frozen/unfrozen.
7. `LendingDeskDissolved`: Emitted when a lending desk is dissolved.
8. `NewLoanInitialized`: Emitted when a new loan is created.
9. `LoanPaymentMade`: Emitted when a loan repayment is made.
10. `DefaultedLoanLiquidated`: Emitted when a defaulted loan is liquidated.
11. `ProtocolInitialized`: Emitted when protocol is first deployed and init'd.
12. `LoanOriginationFeeSet`: Emitted when the loan origination fee is updated.
13. `PlatformFeesWithdrawn`: Emitted when platform fees are withdrawn

## License

This contract is licensed under the Business Source License 1.1 (BUSL-1.1).