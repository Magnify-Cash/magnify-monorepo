# IMagnifyCashV1
[Git Source](https://github.com/Magnify-Cash/magnify-monorepo/blob/efd970ae36caf12f463329311207d019e41348d8/contracts/contracts/interfaces/IMagnifyCashV1.sol)


## Functions
### initializeNewLendingDesk

Creates a new lending desk

*Emits an {NewLendingDeskInitialized} event.*


```solidity
function initializeNewLendingDesk(address _erc20, uint256 _depositAmount, LoanConfig[] calldata _loanConfigs)
    external;
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
function setLendingDeskLoanConfigs(uint256 _lendingDeskId, LoanConfig[] calldata _loanConfigs) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_lendingDeskId`|`uint256`|Identifier for the lending desk|
|`_loanConfigs`|`LoanConfig[]`|Loan config for each NFT collection this lending desk will support|


### removeLendingDeskLoanConfig

Removes a new lending configuration

*Emits an {LendingDeskLoanConfigsSet} event.*


```solidity
function removeLendingDeskLoanConfig(uint256 _lendingDeskId, address _nftCollection) external;
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
function depositLendingDeskLiquidity(uint256 _lendingDeskId, uint256 _amount) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_lendingDeskId`|`uint256`|The id of the lending desk|
|`_amount`|`uint256`|The balance to be transferred|


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
function setLendingDeskState(uint256 _lendingDeskId, bool _freezed) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_lendingDeskId`|`uint256`|ID of the lending desk to be frozen|
|`_freezed`|`bool`|Whether to freeze or unfreeze|


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
) external;
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
function getLoanAmountDue(uint256 _loanId) external view returns (uint256 amount);
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

This function is called by the desk owner in order to liquidate a loan and claim the NFT collateral

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
function setLoanOriginationFee(uint256 _loanOriginationFee) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_loanOriginationFee`|`uint256`|Basis points fee the borrower will have to pay to the platform when borrowing loan|


### setPlatformWallet

Allows the admin of the contract to set the platform wallet where platform fees will be sent to

*Emits an {PlatformWalletSet} event.*


```solidity
function setPlatformWallet(address _platformWallet) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_platformWallet`|`address`|Wallet where platform fees will be sent to|


### setPaused

Allows the admin of the contract to pause the contract as an emergency response.

*Emits either a {Paused} or {Unpaused} event.*


```solidity
function setPaused(bool _paused) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_paused`|`bool`|Whether to pause or unpause|


## Structs
### Loan
Struct used to store loans


```solidity
struct Loan {
    uint256 amount;
    uint256 amountPaidBack;
    address nftCollection;
    uint64 startTime;
    uint64 nftId;
    uint64 lendingDeskId;
    uint32 duration;
    uint32 interest;
    LoanStatus status;
    bool nftCollectionIsErc1155;
}
```

### LoanConfig
Struct used to store loan config set by the shop owner for an NFT collection


```solidity
struct LoanConfig {
    address nftCollection;
    bool nftCollectionIsErc1155;
    uint256 minAmount;
    uint256 maxAmount;
    uint32 minInterest;
    uint32 maxInterest;
    uint32 minDuration;
    uint32 maxDuration;
}
```

### LendingDesk
Struct used to store lending desks on this contract


```solidity
struct LendingDesk {
    address erc20;
    uint256 balance;
    LendingDeskStatus status;
}
```

## Enums
### LendingDeskStatus
LendingDeskStatus used to store lending desk status

Active Default status when a lending desk is created

Frozen Used when a lender pauses or 'freezes' their desk


```solidity
enum LendingDeskStatus {
    Active,
    Frozen
}
```

### LoanStatus
LoanStatus used to store loan status

Active Default status when a loan is issued

Resolved Used when a loan is fully paid back by borrower

Defaulted Used when a loan is liquidated by lender


```solidity
enum LoanStatus {
    Active,
    Resolved,
    Defaulted
}
```

