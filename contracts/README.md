# NFTYFinanceV1

NFTYFinanceV1 is a smart contract protocol that facilitates lending and borrowing of ERC20 tokens using NFTs as collateral. The protocol introduces a novel AMM-style architecture called "LAMM" (Lending Automated Market Maker) for lending markets.

## Contracts

The NFTYFinanceV1 protocol consists of a single core contract and several peripheral contracts. Here is the contract structure:

- `NFTYFinanceV1.sol`: Contains the core protocol module.
- `NFTYFinanceERC721.sol`: Contains an abstract ERC721 with built-in roles, intended for inheritance by other ERC721 contracts.
- `NFTYLendingKeysV1.sol`: Contains the lending desk key module, responsible for handling lending desk ownership.
- `NFTYObligationNotesV1.sol`: Contains the obligation note module, which manages a borrower's obligation to repay the loan.
- `NFTYPromissoryNotesV1.sol`: Contains the promissory note module, which represents the lender's promise to be repaid.

## Dependencies

The contract relies on the following external contracts and libraries:

- OpenZeppelin Contracts (version 4.3.0)
  - `Ownable.sol`
  - `Pausable.sol`
  - `ReentrancyGuard.sol`
  - `SafeERC20.sol`
  - `IERC20.sol`
  - `IERC721.sol`
  - `IERC1155.sol`
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

1. `initializeNewLendingDesk`: Initializes a new lending desk.
2. `setLendingDeskLoanConfigs`: Sets loan parameters for a lending desk and NFT collection.
3. `removeLendingDeskLoanConfig`: Removes support for an NFT collection from a lending desk.
4. `depositLendingDeskLiquidity`: Deposits liquidity into a lending desk.
5. `withdrawLendingDeskLiquidity`: Withdraws liquidity from a lending desk.
6. `setLendingDeskState`: Pauses/unpauses the lending desk state (active or frozen).
7. `dissolveLendingDesk`: Dissolves a lending desk (non-reversible action).
8. `initializeNewLoan`: Creates a loan against an ERC20 token using NFT collateral.
9. `liquidateDefaultedLoan`: Liquidates a defaulted loan.
10. `setLoanOriginationFee`: Sets the loan origination fee.
11. `withdrawPlatformFees`: Withdraws the loan origination fee for specified ERC20 tokens.

## Events

The contract emits the following events:

- `NewLendingDeskInitialized`: Emitted when a new lending desk is created.
- `LendingDeskLoanConfigsSet`: Emitted when a lending desk's loan configurations are set.
- `LendingDeskLoanConfigRemoved`: Emitted when a lending desk's support for an NFT collection is removed.
- `LendingDeskLiquidityDeposited`: Emitted when liquidity is added to a lending desk.
- `LendingDeskStateSet`: Emitted when a lending desk is frozen/unfrozen.
- `LendingDeskLiquidityWithdrawn`: Emitted when liquidity is withdrawn from a lending desk.
- `LendingDeskDissolved`: Emitted when a lending desk is dissolved.
- `NewLoanInitialized`: Emitted when a new loan is created.
- `LoanPaymentMade`: Emitted when a loan repayment is made.
- `DefaultedLoanLiquidated`: Emitted when a defaulted loan is liquidated.
- `LoanOriginationFeeSet`: Emitted when the loan origination fee is updated.

## License

This contract is licensed under the Business Source License 1.1 (BUSL-1.1).