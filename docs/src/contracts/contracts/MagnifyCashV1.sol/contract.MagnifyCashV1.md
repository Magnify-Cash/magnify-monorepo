# MagnifyCashV1
[Git Source](https://github.com/Magnify-Cash/magnify-monorepo/blob/efd970ae36caf12f463329311207d019e41348d8/contracts/contracts/MagnifyCashV1.sol)

**Inherits:**
[IMagnifyCashV1](/contracts/contracts/interfaces/IMagnifyCashV1.sol/contract.IMagnifyCashV1.md), Ownable, Pausable, ERC721Holder, ERC1155Holder


## State Variables
### lendingDeskIdCounter
Unique identifier for lending desks


```solidity
uint256 public lendingDeskIdCounter;
```


### loanIdCounter
Unique identifier for loans


```solidity
uint256 public loanIdCounter;
```


### lendingDesks
Mapping to store lending desks


```solidity
mapping(uint256 => LendingDesk) public lendingDesks;
```


### lendingDeskLoanConfigs
Mapping to store loan configs of lending desks


```solidity
mapping(uint256 => mapping(address => LoanConfig)) public lendingDeskLoanConfigs;
```


### loans
Mapping to store loans


```solidity
mapping(uint256 => Loan) public loans;
```


### obligationNotes
The address of the ERC721 to generate obligation notes for borrowers


```solidity
address public immutable obligationNotes;
```


### lendingKeys
The address of the lending desk ownership ERC721


```solidity
address public immutable lendingKeys;
```


### loanOriginationFee
The basis points of fees that the borrower will pay for each loan


```solidity
uint256 public loanOriginationFee;
```


### platformWallet
The address of the platform wallet


```solidity
address public platformWallet;
```


## Functions
### constructor


```solidity
constructor(
    address _obligationNotes,
    address _lendingKeys,
    uint256 _loanOriginationFee,
    address _platformWallet,
    address _initialOwner
);
```

### initializeNewLendingDesk

Creates a new lending desk

*Emits an {NewLendingDeskInitialized} event.*


```solidity
function initializeNewLendingDesk(address _erc20, uint256 _depositAmount, LoanConfig[] calldata _loanConfigs)
    external
    whenNotPaused;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_erc20`|`address`|The ERC20 that will be accepted for loans in this lending desk|
|`_depositAmount`|`uint256`|The initial balance of this lending desk|
|`_loanConfigs`|`LoanConfig[]`|Loan config for each NFT collection this lending desk will support|


### setLendingDeskLoanConfigs

Creates a new lending configuration

*Emits an {LendingDeskLoanConfigsSet} event.*


```solidity
function setLendingDeskLoanConfigs(uint256 _lendingDeskId, LoanConfig[] calldata _loanConfigs) public whenNotPaused;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_lendingDeskId`|`uint256`|Identifier for the lending desk|
|`_loanConfigs`|`LoanConfig[]`|Loan config for each NFT collection this lending desk will support|


### _setLendingDeskLoanConfigs


```solidity
function _setLendingDeskLoanConfigs(uint256 _lendingDeskId, LoanConfig[] calldata _loanConfigs) internal;
```

### removeLendingDeskLoanConfig

Removes a new lending configuration

*Emits an {LendingDeskLoanConfigsSet} event.*


```solidity
function removeLendingDeskLoanConfig(uint256 _lendingDeskId, address _nftCollection) external whenNotPaused;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_lendingDeskId`|`uint256`|Identifier for the lending desk|
|`_nftCollection`|`address`|Address for the NFT collection to remove supported config for|


### depositLendingDeskLiquidity

This function is called to add liquidity to a lending desk

*Emits an {LendingDeskLiquidityDeposited} event.*


```solidity
function depositLendingDeskLiquidity(uint256 _lendingDeskId, uint256 _amount) public whenNotPaused;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_lendingDeskId`|`uint256`|The id of the lending desk|
|`_amount`|`uint256`|The balance to be transferred|


### _depositLendingDeskLiquidity


```solidity
function _depositLendingDeskLiquidity(uint256 _lendingDeskId, uint256 _amount) internal;
```

### withdrawLendingDeskLiquidity

This function is called to cash out a lending desk

*Emits an {LendingDeskLiquidityWithdrawn} event.*


```solidity
function withdrawLendingDeskLiquidity(uint256 _lendingDeskId, uint256 _amount) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_lendingDeskId`|`uint256`|The id of the lending desk to be cashout|
|`_amount`|`uint256`|Amount to withdraw from the lending desk|


### setLendingDeskState

This function can be called by the lending desk owner in order to freeze it

*Emits an {LendingDeskStateSet} event.*


```solidity
function setLendingDeskState(uint256 _lendingDeskId, bool _freeze) external whenNotPaused;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_lendingDeskId`|`uint256`|ID of the lending desk to be frozen|
|`_freeze`|`bool`|Whether to freeze or unfreeze|


### initializeNewLoan

This function can be called by a borrower to create a loan

*Emits an {NewLoanInitialized} event*


```solidity
function initializeNewLoan(
    uint64 _lendingDeskId,
    address _nftCollection,
    uint64 _nftId,
    uint32 _duration,
    uint256 _amount,
    uint32 _maxInterestAllowed
) external whenNotPaused;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_lendingDeskId`|`uint64`|ID of the lending desk related to this offer|
|`_nftCollection`|`address`|The NFT collection address to be used as collateral|
|`_nftId`|`uint64`|ID of the NFT to be used as collateral|
|`_duration`|`uint32`|Loan duration in hours|
|`_amount`|`uint256`|Amount to ask on this loan in ERC20|
|`_maxInterestAllowed`|`uint32`||


### getLoanAmountDue

This function can be called by anyone to get the remaining due amount of a loan


```solidity
function getLoanAmountDue(uint256 _loanId) public view returns (uint256 amount);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_loanId`|`uint256`|ID of the loan|


### makeLoanPayment

This function can be called by the obligation note holder to pay a loan and get the collateral back

*Emits an {LoanPaymentMade} event.*


```solidity
function makeLoanPayment(uint256 _loanId, uint256 _amount, bool _resolve) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_loanId`|`uint256`|ID of the loan|
|`_amount`|`uint256`|The amount to be paid, in erc20 tokens|
|`_resolve`|`bool`|Whether to resolve the loan or not. If true, _amount is ignored.|


### liquidateDefaultedLoan

This function is called by the lending desk key owner in order to liquidate a loan and claim the NFT collateral

*Emits an {LiquidatedOverdueLoan} event.*


```solidity
function liquidateDefaultedLoan(uint256 _loanId) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_loanId`|`uint256`|ID of the loan|


### setLoanOriginationFee

Allows the admin of the contract to modify loan origination fee.

*Emits an {LoanOriginationFeeSet} event.*


```solidity
function setLoanOriginationFee(uint256 _loanOriginationFee) public onlyOwner;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_loanOriginationFee`|`uint256`|Basis points fee the borrower will have to pay to the platform when borrowing loan|


### setPlatformWallet

Allows the admin of the contract to set the platform wallet where platform fees will be sent to

*Emits an {PlatformWalletSet} event.*


```solidity
function setPlatformWallet(address _platformWallet) public onlyOwner;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_platformWallet`|`address`|Wallet where platform fees will be sent to|


### setPaused

Allows the admin of the contract to pause the contract as an emergency response.

*Emits either a {Paused} or {Unpaused} event.*


```solidity
function setPaused(bool _paused) external onlyOwner;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_paused`|`bool`|Whether to pause or unpause|


## Events
### NewLendingDeskInitialized
Event that will be emitted every time a lending desk is created


```solidity
event NewLendingDeskInitialized(
    uint256 lendingDeskId, address owner, address erc20, uint256 initialBalance, LoanConfig[] loanConfigs
);
```

### LendingDeskLoanConfigsSet
Event that will be emitted every time a lending desk config is created


```solidity
event LendingDeskLoanConfigsSet(uint256 lendingDeskId, LoanConfig[] loanConfigs);
```

### LendingDeskLoanConfigRemoved
Event that will be emitted every time a lending desk config is removed


```solidity
event LendingDeskLoanConfigRemoved(uint256 lendingDeskId, address nftCollection);
```

### LendingDeskLiquidityDeposited
Event that will be emitted every time liquidity is added to a lending desk


```solidity
event LendingDeskLiquidityDeposited(uint256 lendingDeskId, uint256 amountDeposited);
```

### LendingDeskLiquidityWithdrawn
Event that will be emitted every time there is a cash out on a lending desk


```solidity
event LendingDeskLiquidityWithdrawn(uint256 lendingDeskId, uint256 amountWithdrawn);
```

### LendingDeskStateSet
Event that will be emitted every time a lending desk is frozen// unfrozen


```solidity
event LendingDeskStateSet(uint256 lendingDeskId, bool freeze);
```

### NewLoanInitialized
Event that will be emitted every time a new offer is accepted


```solidity
event NewLoanInitialized(
    uint256 lendingDeskId,
    uint256 loanId,
    address borrower,
    address nftCollection,
    uint256 nftId,
    uint256 amount,
    uint256 duration,
    uint256 interest,
    uint256 platformFee
);
```

### LoanPaymentMade
Event that will be emitted every time a borrower pays back a loan


```solidity
event LoanPaymentMade(uint256 loanId, uint256 amountPaid, bool resolved);
```

### DefaultedLoanLiquidated
Event that will be emitted every time a loan is liquidated when the obligation note holder did not pay it back in time


```solidity
event DefaultedLoanLiquidated(uint256 loanId);
```

### ProtocolInitialized
Event that will be when the contract is deployed


```solidity
event ProtocolInitialized(address obligationNotes, address lendingKeys);
```

### LoanOriginationFeeSet
Event that will be emitted every time an admin updates loan origination fee


```solidity
event LoanOriginationFeeSet(uint256 loanOriginationFee);
```

### PlatformWalletSet
Event that will be emitted every time an admin updates the platform wallet


```solidity
event PlatformWalletSet(address platformWallet);
```

## Errors
### ObligationNotesIsZeroAddr

```solidity
error ObligationNotesIsZeroAddr();
```

### LendingKeysIsZeroAddr

```solidity
error LendingKeysIsZeroAddr();
```

### ERC20IsZeroAddr

```solidity
error ERC20IsZeroAddr();
```

### InvalidLendingDeskId

```solidity
error InvalidLendingDeskId();
```

### CallerIsNotLendingDeskOwner

```solidity
error CallerIsNotLendingDeskOwner();
```

### MinAmountIsZero

```solidity
error MinAmountIsZero();
```

### MaxAmountIsLessThanMin

```solidity
error MaxAmountIsLessThanMin();
```

### MinInterestIsZero

```solidity
error MinInterestIsZero();
```

### MaxInterestIsLessThanMin

```solidity
error MaxInterestIsLessThanMin();
```

### MinDurationIsZero

```solidity
error MinDurationIsZero();
```

### MaxDurationIsLessThanMin

```solidity
error MaxDurationIsLessThanMin();
```

### InvalidInterest

```solidity
error InvalidInterest();
```

### InvalidNFTCollection

```solidity
error InvalidNFTCollection();
```

### LendingDeskIsNotActive

```solidity
error LendingDeskIsNotActive();
```

### InsufficientLendingDeskBalance

```solidity
error InsufficientLendingDeskBalance();
```

### UnsupportedNFTCollection

```solidity
error UnsupportedNFTCollection();
```

### AmountIsZero

```solidity
error AmountIsZero();
```

### LendingDeskIsNotFrozen

```solidity
error LendingDeskIsNotFrozen();
```

### InvalidLoanId

```solidity
error InvalidLoanId();
```

### LendingDeskIsNotEmpty

```solidity
error LendingDeskIsNotEmpty();
```

### LoanAmountTooLow

```solidity
error LoanAmountTooLow();
```

### LoanAmountTooHigh

```solidity
error LoanAmountTooHigh();
```

### LoanDurationTooLow

```solidity
error LoanDurationTooLow();
```

### LoanDurationTooHigh

```solidity
error LoanDurationTooHigh();
```

### LoanIsNotActive

```solidity
error LoanIsNotActive();
```

### CallerIsNotBorrower

```solidity
error CallerIsNotBorrower();
```

### CallerIsNotLender

```solidity
error CallerIsNotLender();
```

### LoanHasNotDefaulted

```solidity
error LoanHasNotDefaulted();
```

### LoanHasDefaulted

```solidity
error LoanHasDefaulted();
```

### PlatformWalletIsZeroAddr

```solidity
error PlatformWalletIsZeroAddr();
```

### LoanOriginationFeeMoreThan10Percent

```solidity
error LoanOriginationFeeMoreThan10Percent();
```

### LoanMustBeActiveForMin1Hour

```solidity
error LoanMustBeActiveForMin1Hour();
```

### LoanPaymentExceedsDebt

```solidity
error LoanPaymentExceedsDebt();
```

### InterestRateTooHigh

```solidity
error InterestRateTooHigh();
```

