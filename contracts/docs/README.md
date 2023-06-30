## NFTYFinanceV1

NFTYFinanceV1 is a smart contract protocol that enables lending and borrowing of ERC20 tokens using NFT's as collateral. This protocol introduces "LAMM" (Lending Automated Market Maker), a novel AMM-style architecture for lending markets.

### Dependencies

This contract relies on the following external contracts and libraries:

- OpenZeppelin Contracts (version 4.3.0)
  - Ownable.sol
  - Pausable.sol
  - ReentrancyGuard.sol
  - SafeERC20.sol
  - IERC20.sol
  - IERC721.sol
  - IERC1155.sol
  - ERC165Checker.sol

### Contract Structure

The contract is organized into the following sections:

1. Storage: Defines the storage variables used by the contract
2. Events: Defines the events emitted by the contract
3. Constructor: Initializes the contract with the provided addresses and loan origination fee
4. Core Functions: Implements the core functionality of the contract, including creating lending desks, configuring loan parameters, depositing/withdrawing liquidity, borrowing loans, repaying loans, and liquidating defaulted loans
5. Admin Functions: Implements the admin functionality of the contract, including setting loan origination fees, withdrawing platform fees, and pausing/unpausing the protocol.

### Contract Functions

The contract provides the following functions:

1. `initializeNewLendingDesk`: Initializes a new lending desk.
2. `setLendingDeskLoanConfigs`: Sets loan parameters for a lending desk and NFT collection.
3. `removeLendingDeskLoanConfig`: Removes loan parameters for a lending desk and NFT collection.
4. `depositLendingDeskLiquidity`: Deposits liquidity into a lending desk.
5. `withdrawLendingDeskLiquidity`: Withdraws liquidity from a lending desk.
6. `setLendingDeskState`: Pauses / unpauses the lending desk state (active or frozen)
7. `dissolveLendingDesk`: Dissolves lending desk. Non-reversible.
8. `initializeNewLoan`: Creates a loan against an ERC20 using NFT collateral.
9. `liquidateDefaultedLoan`: Liquidates a defaulted loan.
9. `setLoanOriginationFee`: Sets the loan origination fee.
10. `withdrawPlatformFees`: Withdraws the loan origination fee for specified ERC20's

### Events

The contract emits the following events:

- NewLendingDeskInitialized: Emitted when a new lending desk is created.
- LendingDeskLoanConfigSet: Emitted when a lending desk's loan configuration is set.
- LendingDeskLoanConfigRemoved: Emitted when a lending desk's loan configuration is removed.
- LendingDeskLiquidityAdded: Emitted when liquidity is added to a lending desk.
- LendingDeskStateSet: Emitted when a lending desk is frozen/unfrozen.
- LendingDeskLiquidityWithdrawn: Emitted when liquidity is withdrawn from a lending desk.
- LendingDeskDissolved: Emitted when a lending desk is dissolved.
- NewLoanInitialized: Emitted when a new loan is created.
- LoanPaymentMade: Emitted when a loan repayment is made.
- DefaultedLoanLiquidated: Emitted when a defaulted loan is liquidated.
- LoanOriginationFeeSet: Emitted when the loan origination fee is updated.

### License

This contract is licensed under the Business Source License 1.1 (BUSL-1.1).