Summary
 - [reentrancy-benign](#reentrancy-benign) (1 results) (Low)
 - [reentrancy-events](#reentrancy-events) (1 results) (Low)
## reentrancy-benign
Impact: Low
Confidence: Medium
 - [ ] ID-0
Reentrancy in [NFTYFinanceV1.initializeNewLendingDesk(address,uint256,INFTYFinanceV1.LoanConfig[])](contracts/NFTYFinanceV1.sol#L257-L284):
	External calls:
	- [INFTYERC721V1(lendingKeys).mint(msg.sender,lendingDeskIdCounter)](contracts/NFTYFinanceV1.sol#L272)
	State variables written after the call(s):
	- [setLendingDeskLoanConfigs(lendingDeskIdCounter,_loanConfigs)](contracts/NFTYFinanceV1.sol#L275)
		- [lendingDeskLoanConfigs[_lendingDeskId][_loanConfigs[i].nftCollection] = _loanConfigs[i]](contracts/NFTYFinanceV1.sol#L324-L326)

contracts/NFTYFinanceV1.sol#L257-L284


## reentrancy-events
Impact: Low
Confidence: Medium
 - [ ] ID-1
Reentrancy in [NFTYFinanceV1.initializeNewLendingDesk(address,uint256,INFTYFinanceV1.LoanConfig[])](contracts/NFTYFinanceV1.sol#L257-L284):
	External calls:
	- [INFTYERC721V1(lendingKeys).mint(msg.sender,lendingDeskIdCounter)](contracts/NFTYFinanceV1.sol#L272)
	Event emitted after the call(s):
	- [LendingDeskLoanConfigsSet(_lendingDeskId,_loanConfigs)](contracts/NFTYFinanceV1.sol#L327-L330)
		- [setLendingDeskLoanConfigs(lendingDeskIdCounter,_loanConfigs)](contracts/NFTYFinanceV1.sol#L275)

contracts/NFTYFinanceV1.sol#L257-L284


