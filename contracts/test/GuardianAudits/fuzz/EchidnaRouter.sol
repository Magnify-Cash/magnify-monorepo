// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {EchidnaSetup} from "./EchidnaSetup.sol";
import {ERC20Mock} from "../mocks/ERC20Mock.sol";
import {ERC20Mock6} from "../mocks/ERC20Mock6.sol";
import {ERC721Mock} from "../mocks/ERC721Mock.sol";
import {ERC1155Mock} from "../mocks/ERC1155Mock.sol";
import {IERC721Mock} from "../mocks/IERC721Mock.sol";
import {IERC1155Mock} from "../mocks/IERC1155Mock.sol";
import {INFTYFinanceV1} from "contracts/interfaces/INFTYFinanceV1.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {INFTYERC721V1} from "contracts/interfaces/INFTYERC721V1.sol";

// echidna ./test/GuardianAudits/fuzz/EchidnaRouter.sol --contract EchidnaRouter --config config.yaml --workers 4

contract EchidnaRouter is EchidnaSetup {
    struct Params {
        uint256 deskId;
        address nftCollection;
        bool isERC1155;
    }

    uint256 constant MAX_AMOUNT = 1_000_000 ether;
    uint256 constant MAX_INTEREST = 20000;
    uint256 constant MAX_DURATION = 10 weeks / 1 hours; // amount of hours

    /*//////////////////////////////////////////////////////////////////////////
                                TEST CONTRACTS/VARS
    //////////////////////////////////////////////////////////////////////////*/

    address[] private _users;

    uint256 currentTimestamp;
    uint256 currentBlock;

    address erc20;
    address erc20_6;

    address[] internal s_erc721s;
    address[] internal s_erc1155s;

    uint256 internal s_erc721Counter;
    uint256 internal s_erc1155Counter;

    INFTYFinanceV1.LoanConfig[] internal s_loanConfigs;

    mapping(uint256 deskId => uint256 totalDeposited) internal s_totalDeposited;
    mapping(uint256 deskId => uint256 totalBorrowed) internal s_totalBorrowed;

    /*//////////////////////////////////////////////////////////////////////////
                                    CONSTRUCTOR
    //////////////////////////////////////////////////////////////////////////*/
    constructor() payable {
        EchidnaSetup.deploy();

        _users.push(USER1);
        _users.push(USER2);
        _users.push(USER3);

        erc20 = address(new ERC20Mock());
        erc20_6 = address(new ERC20Mock6());

        for (uint256 i = 0; i < 5; i++) {
            s_erc721s.push(address(new ERC721Mock()));
            s_erc1155s.push(address(new ERC1155Mock()));
        }
    }

    /*//////////////////////////////////////////////////////////////////////////
                                    MODIFIERS
    //////////////////////////////////////////////////////////////////////////*/

    modifier settleBlockTime() {
        vm.warp(currentTimestamp);
        vm.roll(currentBlock);
        _;
    }

    modifier globalInvariants() {
        _;
        _ensureGlobalInvariants();
    }

    /*//////////////////////////////////////////////////////////////////////////
                               NFTY FINANCE HANDLERS
    //////////////////////////////////////////////////////////////////////////*/
    function fuzz_initializeNewLendingDesk(uint256 depositAmount, uint256 seed1, uint256 seed2, uint256 seed3, bool isERC1155)
        public
        settleBlockTime
        globalInvariants
    {
        // PRE_CONDITIONS
        INFTYFinanceV1.LoanConfig[] memory configs = new INFTYFinanceV1.LoanConfig[](2);
        configs[0] = _getNewLoanConfig(seed1, seed2, seed3, isERC1155);
        configs[1] = _getNewLoanConfig(seed1 / 2, seed2 / 2, seed3 / 2, !isERC1155);

        // Prevent same nftCollection as one will override the other.
        if (configs[0].nftCollection == configs[1].nftCollection) return;

        uint256 lendingDeskIdCounter = nftyFinance.lendingDeskIdCounter();
        depositAmount = bound(depositAmount, 1, MAX_AMOUNT);

        address lendingToken;
        if (seed1 % 5 == 0) lendingToken = erc20;
        else lendingToken = erc20_6;

        uint256 balanceBefore = ERC20Mock(lendingToken).balanceOf(address(nftyFinance));

        // ACTIONS
        deal(lendingToken, msg.sender, depositAmount);
        vm.prank(msg.sender);
        ERC20Mock(lendingToken).approve(address(nftyFinance), depositAmount);
        vm.prank(msg.sender);
        (bool success,) = address(nftyFinance).call(
            abi.encodeWithSelector(
                INFTYFinanceV1.initializeNewLendingDesk.selector, lendingToken, depositAmount, configs
            )
        );

        // POST_CONDITIONS
        if (success) {
            uint256 lendingDeskIdCounterAfter = nftyFinance.lendingDeskIdCounter();
            s_totalDeposited[lendingDeskIdCounterAfter] += depositAmount;
            INFTYFinanceV1.LendingDesk memory lendingDesk = _getLendingDesk(lendingDeskIdCounterAfter);

            assertEq(lendingDeskIdCounterAfter, lendingDeskIdCounter + 1, "lending desk id");
            assertEq(lendingKeys.ownerOf(lendingDeskIdCounterAfter), msg.sender, "lending desk owner");
            assertEq(lendingDesk.erc20, lendingToken, "wrong erc20 address");
            assertEq(lendingDesk.balance, depositAmount, "balance!=depositAmount");
            assertEq(
                ERC20Mock(lendingToken).balanceOf(address(nftyFinance)), balanceBefore + depositAmount, "wrong balance"
            );

            for (uint256 i = 0; i < configs.length; i++) {
                INFTYFinanceV1.LoanConfig memory config =
                    _getLoanConfig(lendingDeskIdCounterAfter, configs[i].nftCollection);

                assertEq(config.nftCollection, configs[i].nftCollection, "nft collection");
                assertEq(config.nftCollectionIsErc1155, configs[i].nftCollectionIsErc1155, "ERC type");
                assertEq(config.minAmount, configs[i].minAmount, "minAmount");
                assertEq(config.maxAmount, configs[i].maxAmount, "maxAmount");
                assertEq(config.minInterest, configs[i].minInterest, "minInterest");
                assertEq(config.maxInterest, configs[i].maxInterest, "maxInterest");
                assertEq(config.minDuration, configs[i].minDuration, "minDuration");
                assertEq(config.maxDuration, configs[i].maxDuration, "maxDuration");
            }

            assertTrue(_hasValidInterest(configs[0]) && _hasValidInterest(configs[1]), "Invalid interest");
        }
    }

    function fuzz_setLendingDeskLoanConfigs(uint256 seed1, uint256 seed2, uint256 seed3, bool isERC1155) public settleBlockTime globalInvariants {
        // PRE_CONDITIONS
        uint256 deskId = _getRandomDeskId(seed1);
        if (deskId == 0) return;

        INFTYFinanceV1.LoanConfig[] memory configs = new INFTYFinanceV1.LoanConfig[](2);
        configs[0] = _getNewLoanConfig(seed1, seed2, seed3, isERC1155);
        configs[1] = _getNewLoanConfig(seed1 / 2, seed2 / 2, seed3 / 2, !isERC1155);

        // Prevent same nftCollection as one will override the other.
        if (configs[0].nftCollection == configs[1].nftCollection) return;

        address lendingKeyOwner = lendingKeys.ownerOf(deskId);

        // ACTIONS
        vm.prank(msg.sender);
        (bool success,) = address(nftyFinance).call(
            abi.encodeWithSelector(INFTYFinanceV1.setLendingDeskLoanConfigs.selector, deskId, configs)
        );

        // POST_CONDITIONS
        if (success) {
            for (uint256 i = 0; i < configs.length; i++) {
                INFTYFinanceV1.LoanConfig memory config = _getLoanConfig(deskId, configs[i].nftCollection);

                assertEq(config.nftCollection, configs[i].nftCollection, "nft collection");
                assertEq(config.nftCollectionIsErc1155, configs[i].nftCollectionIsErc1155, "ERC type");
                assertEq(config.minAmount, configs[i].minAmount, "minAmount");
                assertEq(config.maxAmount, configs[i].maxAmount, "maxAmount");
                assertEq(config.minInterest, configs[i].minInterest, "minInterest");
                assertEq(config.maxInterest, configs[i].maxInterest, "maxInterest");
                assertEq(config.minDuration, configs[i].minDuration, "minDuration");
                assertEq(config.maxDuration, configs[i].maxDuration, "maxDuration");
            }

            assertTrue(_hasValidInterest(configs[0]) && _hasValidInterest(configs[1]), "Invalid interest");
            assertTrue(lendingKeyOwner == msg.sender, "Not owner of lending desk");
        }
    }

    function fuzz_removeLendingDeskLoanConfig(uint256 seed) public settleBlockTime globalInvariants {
        // PRE_CONDITIONS
        uint256 deskId = _getRandomDeskId(seed);
        if (deskId == 0) return;

        (address nftCollection,) = _getRandomNftCollection(seed);
        address lendingKeyOwner = lendingKeys.ownerOf(deskId);
        address configuredCollection = _getLoanConfig(deskId, nftCollection).nftCollection;

        // ACTIONS
        vm.prank(msg.sender);
        (bool success,) = address(nftyFinance).call(
            abi.encodeWithSelector(INFTYFinanceV1.removeLendingDeskLoanConfig.selector, deskId, nftCollection)
        );

        // POST_CONDITIONS
        if (success) {
            INFTYFinanceV1.LoanConfig memory config = _getLoanConfig(deskId, nftCollection);

            assertEq(config.nftCollection, address(0), "nft collection");
            assertFalse(config.nftCollectionIsErc1155, "ERC type");
            assertEq(config.minAmount, 0, "minAmount");
            assertEq(config.maxAmount, 0, "maxAmount");
            assertEq(config.minInterest, 0, "minInterest");
            assertEq(config.maxInterest, 0, "maxInterest");
            assertEq(config.minDuration, 0, "minDuration");
            assertEq(config.maxDuration, 0, "maxDuration");
            assertTrue(lendingKeyOwner == msg.sender, "Not owner of lending desk");
            assertTrue(configuredCollection != address(0), "Config Removed for empty collection");
        }
    }

    function fuzz_depositLendingDeskLiquidity(uint256 depositAmount, uint256 seed)
        public
        settleBlockTime
        globalInvariants
    {
        // PRE_CONDITIONS
        uint256 deskId = _getRandomDeskId(seed);
        if (deskId == 0) return;

        depositAmount = bound(depositAmount, 1, MAX_AMOUNT);
        uint256 deskBalanceBefore = _getLendingDesk(deskId).balance;
        address lendingToken = _getLendingDesk(deskId).erc20;
        address lendingKeyOwner = lendingKeys.ownerOf(deskId);

        // ACTIONS
        deal(lendingToken, msg.sender, depositAmount);
        vm.prank(msg.sender);
        ERC20Mock(lendingToken).approve(address(nftyFinance), depositAmount);
        vm.prank(msg.sender);
        (bool success,) = address(nftyFinance).call(
            abi.encodeWithSelector(INFTYFinanceV1.depositLendingDeskLiquidity.selector, deskId, depositAmount)
        );

        // POST_CONDITIONS
        if (success) {
            s_totalDeposited[deskId] += depositAmount;
            assertEq(_getLendingDesk(deskId).balance, deskBalanceBefore + depositAmount, "desk balance");
            assertTrue(lendingKeyOwner == msg.sender, "Not owner of lending desk");
        }
    }

    function fuzz_withdrawLendingDeskLiquidity(uint256 withdrawAmount, uint256 seed)
        public
        settleBlockTime
        globalInvariants
    {
        // PRE_CONDITIONS
        uint256 deskId = _getRandomDeskId(seed);
        if (deskId == 0) return;

        uint256 deskBalanceBefore = _getLendingDesk(deskId).balance;
        withdrawAmount = bound(withdrawAmount, 1, deskBalanceBefore);
        address lendingKeyOwner = lendingKeys.ownerOf(deskId);

        // ACTIONS
        vm.prank(msg.sender);
        (bool success,) = address(nftyFinance).call(
            abi.encodeWithSelector(INFTYFinanceV1.withdrawLendingDeskLiquidity.selector, deskId, withdrawAmount)
        );

        // POST_CONDITIONS
        if (success) {
            assertEq(_getLendingDesk(deskId).balance, deskBalanceBefore - withdrawAmount, "desk balance");
            assertTrue(lendingKeyOwner == msg.sender, "Not owner of lending desk");
        }

        if (deskBalanceBefore < withdrawAmount) {
            assertFalse(success, "Not enough balance");
        }
    }

    function fuzz_setLendingDeskState(uint256 seed, bool freeze) public settleBlockTime globalInvariants {
        // PRE_CONDITIONS
        uint256 deskId = _getRandomDeskId(seed);
        if (deskId == 0) return;
        INFTYFinanceV1.LendingDeskStatus statusBefore = _getLendingDesk(deskId).status;
        address lendingKeyOwner = lendingKeys.ownerOf(deskId);

        // ACTIONS
        vm.prank(msg.sender);
        (bool success,) = address(nftyFinance).call(
            abi.encodeWithSelector(INFTYFinanceV1.setLendingDeskState.selector, deskId, freeze)
        );

        // POST_CONDITIONS
        if (success) {
            if (freeze) {
                assertTrue(_getLendingDesk(deskId).status == INFTYFinanceV1.LendingDeskStatus.Frozen, "freeze status");
            } else {
                assertTrue(_getLendingDesk(deskId).status == INFTYFinanceV1.LendingDeskStatus.Active, "active status");
            }
            assertTrue(lendingKeyOwner == msg.sender, "Not owner of lending desk");
            assertFalse(statusBefore == INFTYFinanceV1.LendingDeskStatus.Frozen && freeze, "Already frozen");
            assertFalse(statusBefore == INFTYFinanceV1.LendingDeskStatus.Active && !freeze, "Already unfrozen");
        }
    }

    function fuzz_initializeNewLoan(uint256 borrowAmount, uint256 duration, uint32 seed)
        public
        settleBlockTime
        globalInvariants
    {
        // PRE_CONDITIONS
        Params memory params; //To prevent "stack too deep" error
        params.deskId = _getRandomDeskId(seed);

        (params.nftCollection, params.isERC1155) = _getRandomNftCollection(seed);

        duration = _bound(uint256(duration), 1, MAX_DURATION);
        borrowAmount = _bound(borrowAmount, 1, MAX_AMOUNT);

        INFTYFinanceV1.LendingDeskStatus statusBefore = _getLendingDesk(params.deskId).status;
        uint256 currentLoanId = nftyFinance.loanIdCounter();
        uint256 user_balBefore = IERC20(_getLendingDesk(params.deskId).erc20).balanceOf(msg.sender);
        uint256 platform_balBefore = IERC20(_getLendingDesk(params.deskId).erc20).balanceOf(platformWallet);

        //ACTION
        uint256 nftId = _mintNft(params.nftCollection, params.isERC1155);
        if (params.isERC1155) {
            vm.prank(msg.sender);
            IERC1155Mock(params.nftCollection).setApprovalForAll(address(nftyFinance), true);
        } else {
            vm.prank(msg.sender);
            IERC721Mock(params.nftCollection).approve(address(nftyFinance), nftId);
        }
        vm.prank(msg.sender);
        (bool success,) = address(nftyFinance).call(
            abi.encodeWithSelector(
                INFTYFinanceV1.initializeNewLoan.selector,
                params.deskId,
                params.nftCollection,
                nftId,
                duration,
                borrowAmount,
                type(uint32).max
            )
        );

        //POST-CONDITION
        if (success) {
            INFTYFinanceV1.Loan memory loan = _getLoan(currentLoanId + 1);
            INFTYFinanceV1.LoanConfig memory config = _getLoanConfig(params.deskId, params.nftCollection);
            s_totalBorrowed[currentLoanId + 1] += borrowAmount;

            //Assert if the parameters are set correctly
            //❌ Following Assertion Fails
            assertTrue(loan.interest == _calculateInterest(borrowAmount, duration, config), "Interest Set Incorrectly");
            assertTrue(config.nftCollection != address(0), "Invalid Config");
            assertEq(loan.amount, borrowAmount, "loan.amount");
            assertEq(loan.amountPaidBack, 0, "loan.amountPaidBack");
            assertEq(loan.nftCollection, params.nftCollection, "loan.nftCollection");
            assertEq(loan.startTime, uint64(block.timestamp), "loan.startTime");
            assertEq(loan.nftId, nftId, "loan.nftId");
            assertEq(loan.lendingDeskId, params.deskId, "loan.lendingDeskId");
            assertEq(loan.duration, duration, "loan.duration");
            assertTrue(loan.status == INFTYFinanceV1.LoanStatus.Active, "loan.status");
            assertFalse(
                statusBefore == INFTYFinanceV1.LendingDeskStatus.Frozen, "Lending Desk frozen"
            );

            //Assert for Amount Received by borrower and platform wallet
            uint256 platformFees = (200 * borrowAmount) / 10000;

            assertEq(
                IERC20(_getLendingDesk(params.deskId).erc20).balanceOf(msg.sender),
                user_balBefore + borrowAmount - platformFees,
                "User Not recieved full amount"
            );
            assertEq(
                IERC20(_getLendingDesk(params.deskId).erc20).balanceOf(platformWallet),
                platform_balBefore + platformFees,
                "Platform Not recieved full amount"
            );
        }
    }

    function fuzz_makeLoanPayment(uint256 repayAmount, uint32 seed) public settleBlockTime globalInvariants {
        // PRE_CONDITIONS
        uint256 loanId = _getRandomLoanId(seed);
        INFTYFinanceV1.Loan memory loan = _getLoan(loanId);
        address lendingToken = _getLendingDesk(loan.lendingDeskId).erc20;
        repayAmount = _bound(repayAmount, 1, MAX_AMOUNT);
        bool isEntireAmountRepaid;

        bool fullRepayment = seed % 3 == 0;
        if (fullRepayment) {
            repayAmount = nftyFinance.getLoanAmountDue(loanId);
        }
        isEntireAmountRepaid = repayAmount == nftyFinance.getLoanAmountDue(loanId);

        //ACTIONS

        uint256 erc20Balance = ERC20Mock(lendingToken).balanceOf(msg.sender);
        if (erc20Balance < repayAmount) {
            deal(lendingToken, msg.sender, repayAmount - erc20Balance);
        }

        vm.prank(msg.sender);
        ERC20Mock(lendingToken).approve(address(nftyFinance), repayAmount);

        vm.prank(msg.sender);
        (bool success,) = address(nftyFinance).call(
            abi.encodeWithSelector(INFTYFinanceV1.makeLoanPayment.selector, loanId, repayAmount, fullRepayment)
        );

        //POST-CONDITION
        if (success) {
            INFTYFinanceV1.Loan memory newLoanDetails = _getLoan(loanId);
            INFTYFinanceV1.LoanConfig memory loanConfig =
                _getLoanConfig(newLoanDetails.lendingDeskId, newLoanDetails.nftCollection);
            assertEq(newLoanDetails.amountPaidBack, loan.amountPaidBack + repayAmount, "loan.amountPaidBack");

            // Full Repayment
            if (fullRepayment) {
                assertTrue(newLoanDetails.status == INFTYFinanceV1.LoanStatus.Resolved, "loan resolved");
                assertTrue(newLoanDetails.amountPaidBack >= newLoanDetails.amount, "loan not paid back completely");

                if (loanConfig.nftCollectionIsErc1155) {
                    assertGe(
                        IERC1155Mock(loan.nftCollection).balanceOf(msg.sender, loan.nftId), 1, "erc1155 not received"
                    );
                } else {
                    assertEq(IERC721Mock(loan.nftCollection).ownerOf(loan.nftId), msg.sender, "erc721 not received");
                }
            } else {
                if (!isEntireAmountRepaid) {
                    assertTrue(
                        newLoanDetails.status == INFTYFinanceV1.LoanStatus.Active, "loan not active with payment pending"
                    );
                }
            }

            //❌ Following Assertion Fails
            //If duration passes, should not be able to repay loan
            uint256 hoursElapsed = (block.timestamp - loan.startTime) / 1 hours;
            assertTrue(hoursElapsed < loan.duration, "Loan Repaid after Duration");

            assertFalse(loan.status != INFTYFinanceV1.LoanStatus.Active, "loan not active");
        }
    }

    function fuzz_liquidateDefaultedLoan(uint256 seed) public settleBlockTime globalInvariants {
        // PRE_CONDITIONS
        uint256 loanId = _getRandomLoanId(seed);
        INFTYFinanceV1.Loan memory loan = _getLoan(loanId);
        address lender = lendingKeys.ownerOf(loan.lendingDeskId);
        uint256 endTime = loan.startTime + loan.duration * 1 hours;

        //ACTIONS
        vm.prank(msg.sender);
        (bool success,) =
            address(nftyFinance).call(abi.encodeWithSelector(INFTYFinanceV1.liquidateDefaultedLoan.selector, loanId));

        //POST-CONDITION
        if (success) {
            INFTYFinanceV1.Loan memory newLoanDetails = _getLoan(loanId);
            INFTYFinanceV1.LoanConfig memory loanConfig =
                _getLoanConfig(newLoanDetails.lendingDeskId, newLoanDetails.nftCollection);

            assertTrue(newLoanDetails.status == INFTYFinanceV1.LoanStatus.Defaulted, "loan defaulted");
            assertGe(block.timestamp, endTime, "loan defaulted");

            if (loanConfig.nftCollectionIsErc1155) {
                assertGe(IERC1155Mock(loan.nftCollection).balanceOf(lender, loan.nftId), 1, "erc1155 not received");
            } else {
                assertEq(IERC721Mock(loan.nftCollection).ownerOf(loan.nftId), lender, "erc721 not received");
            }

            assertTrue(lender == msg.sender, "Not owner of lending desk");
            assertFalse(block.timestamp < endTime, "Loan not defaulted");
            assertFalse(loan.status != INFTYFinanceV1.LoanStatus.Active, "loan not active");
        }
    }

    function fuzz_transferObligationNote(uint256 seed) public settleBlockTime globalInvariants {
        // PRE_CONDITIONS
        uint256 loanId = _getRandomLoanId(seed);
        address recipient = _getRandomUser(seed);

        if (msg.sender == recipient) return;

        //ACTIONS
        vm.prank(msg.sender);
        obligationNotes.safeTransferFrom(msg.sender, recipient, loanId);
    }

    function fuzz_transferLendingDesk(uint256 seed) public settleBlockTime globalInvariants {
        // PRE_CONDITIONS
        uint256 deskId = _getRandomDeskId(seed);
        address recipient = _getRandomUser(seed);

        if (msg.sender == recipient) return;

        //ACTIONS
        vm.prank(msg.sender);
        lendingKeys.safeTransferFrom(msg.sender, recipient, deskId);
    }

    /**
     * Change Time
     */
    function time(uint256 seed) public globalInvariants {
        // Preconditions
        uint256 timeDelta = bound(seed, 1 days, 3 weeks);
        uint256 blockDelta = bound(seed, 1, 100);

        currentTimestamp += timeDelta;
        vm.warp(currentTimestamp);

        // Advance one block when we change time
        currentBlock += blockDelta;
        vm.roll(currentBlock);
    }

    /*//////////////////////////////////////////////////////////////////////////
                               Global Invariants
    //////////////////////////////////////////////////////////////////////////*/

    function _ensureGlobalInvariants() internal {
        _invariant_ContractBalanceGreaterThanDeskBalances();
        // _invariant_DeskDepositsGreaterThanBorrowed();
    }

    /// @dev Contract Balance >= All Desk Balances
    function _invariant_ContractBalanceGreaterThanDeskBalances() internal {
        uint256 totalDesks = nftyFinance.lendingDeskIdCounter();
        uint256 totalDeskBalances;

        for (uint256 i = 1; i <= totalDesks;) {
            totalDeskBalances += _getLendingDesk(i).balance;

            unchecked {
                ++i;
            }
        }

        uint256 contractBalance = IERC20(erc20).balanceOf(address(nftyFinance));
        uint256 contractBalance6 = IERC20(erc20_6).balanceOf(address(nftyFinance));
        assertGe(contractBalance + contractBalance6, totalDeskBalances, "Contract Balance < All Desk Balances");
    }

    /// @dev Lending Desk Total Deposits >= Total Borrowed
    function _invariant_DeskDepositsGreaterThanBorrowed() internal {
        uint256 totalDesks = nftyFinance.lendingDeskIdCounter();

        for (uint256 i = 1; i <= totalDesks;) {
            assertGe(s_totalDeposited[i], s_totalBorrowed[i], "Total Deposits < Total Borrowed");

            unchecked {
                ++i;
            }
        }
    }

    /*//////////////////////////////////////////////////////////////////////////
                               HELPERS
    //////////////////////////////////////////////////////////////////////////*/

    function _getNewLoanConfig(uint256 amountSeed, uint interestSeed, uint durationSeed, bool isERC1155)
        internal
        returns (INFTYFinanceV1.LoanConfig memory)
    {
        bool useExistingConfig = amountSeed % 2 == 0;
        if (useExistingConfig && s_loanConfigs.length > 0) {
            uint256 index = bound(amountSeed, 0, s_loanConfigs.length - 1);
            return s_loanConfigs[index];
        }

        uint256 minAmount = bound(amountSeed, 1, MAX_AMOUNT);
        uint256 maxAmount = bound(amountSeed, minAmount, MAX_AMOUNT);
        uint32 minInterest = uint32(bound(interestSeed, 1, MAX_INTEREST));
        uint32 minDuration = uint32(bound(durationSeed, 1, MAX_DURATION));
        uint32 maxDuration = uint32(bound(durationSeed, minDuration, MAX_DURATION)); 
        
        uint32 maxInterest;
        if (minAmount == maxAmount && minDuration == maxDuration) {
            maxInterest = minInterest;
        } else {
            maxInterest = uint32(bound(interestSeed, minInterest, MAX_INTEREST));
        }


        // Pick one existing NFT collections
        address nftCollection;
        if (isERC1155) {
            nftCollection = s_erc1155s[bound(amountSeed, 0, s_erc1155s.length - 1)];
        } else {
            nftCollection = s_erc721s[bound(amountSeed, 0, s_erc721s.length - 1)];
        }

        INFTYFinanceV1.LoanConfig memory _config = INFTYFinanceV1.LoanConfig(
            nftCollection, isERC1155, minAmount, maxAmount, minInterest, maxInterest, minDuration, maxDuration
        );

        s_loanConfigs.push(_config);

        return _config;
    }

    function _getLendingDesk(uint256 id) internal view returns (INFTYFinanceV1.LendingDesk memory) {
        (address _erc20, uint256 _balance, INFTYFinanceV1.LendingDeskStatus status) = nftyFinance.lendingDesks(id);
        return INFTYFinanceV1.LendingDesk(_erc20, _balance, status);
    }

    function _getLoanConfig(uint256 id, address nftCollection)
        internal
        view
        returns (INFTYFinanceV1.LoanConfig memory)
    {
        (
            address _nftCollection,
            bool _isERC1155,
            uint256 _minAmount,
            uint256 _maxAmount,
            uint32 _minInterest,
            uint32 _maxInterest,
            uint32 _minDuration,
            uint32 _maxDuration
        ) = nftyFinance.lendingDeskLoanConfigs(id, nftCollection);
        return INFTYFinanceV1.LoanConfig(
            _nftCollection, _isERC1155, _minAmount, _maxAmount, _minInterest, _maxInterest, _minDuration, _maxDuration
        );
    }

    function _getLoan(uint256 id) internal view returns (INFTYFinanceV1.Loan memory) {
        (
            uint256 _amount,
            uint256 _amountPaidBack,
            address _nftCollection,
            uint64 _startTime,
            uint64 _nftId,
            uint64 _lendingDeskId,
            uint32 _duration,
            uint32 _interest,
            INFTYFinanceV1.LoanStatus _status,
            bool isERC1155
        ) = nftyFinance.loans(id);
        return INFTYFinanceV1.Loan(
            _amount, _amountPaidBack, _nftCollection, _startTime, _nftId, _lendingDeskId, _duration, _interest, _status, isERC1155
        );
    }

    function _hasValidInterest(INFTYFinanceV1.LoanConfig memory _config) internal pure returns (bool) {
        if (
            _config.minAmount == _config.maxAmount && _config.minDuration == _config.maxDuration
                && _config.minInterest != _config.maxInterest
        ) {
            return false;
        }

        return true;
    }

    function _getRandomDeskId(uint256 seed) internal view returns (uint256) {
        if (nftyFinance.lendingDeskIdCounter() == 0) return 0;

        return _bound(seed, 1, nftyFinance.lendingDeskIdCounter());
    }

    function _getRandomLoanId(uint256 seed) internal view returns (uint256) {
        if (nftyFinance.loanIdCounter() == 0) return 0;

        return _bound(seed, 1, nftyFinance.loanIdCounter());
    }

    function _getRandomNftCollection(uint256 seed) internal returns (address collection, bool isERC1155) {
        if (seed % 2 == 0) {
            collection = s_erc1155s[bound(seed, 0, s_erc1155s.length - 1)];
            isERC1155 = true;
        } else {
            collection = s_erc721s[bound(seed, 0, s_erc721s.length - 1)];
            isERC1155 = false;
        }
    }

    function _getRandomUser(uint256 seed) internal view returns (address) {
        return _users[_bound(seed, 0, _users.length - 1)];
    }

    function _mintNft(address nftCollection, bool isERC1155) internal returns (uint256 nftId) {
        if (isERC1155) {
            IERC1155Mock(nftCollection).mint(msg.sender, ++s_erc1155Counter, 1, "");
            return s_erc1155Counter;
        } else {
            IERC721Mock(nftCollection).mint(msg.sender, ++s_erc721Counter);
            return s_erc721Counter;
        }
    }

    function _calculateInterest(uint256 borrowAmount, uint256 duration, INFTYFinanceV1.LoanConfig memory config)
        internal
        returns (uint32 interest)
    {
        if (config.maxAmount == config.minAmount && config.maxDuration == config.minDuration) {
            interest = config.minInterest;
        } else if (config.maxAmount != config.minAmount && config.maxDuration == config.minDuration) {
            interest = config.minInterest
                + uint32(
                    ((borrowAmount - config.minAmount) * (config.maxInterest - config.minInterest))
                        / (config.maxAmount - config.minAmount)
                );
        } else if (config.maxAmount == config.minAmount && config.maxDuration != config.minDuration) {
            interest = config.minInterest
                + uint32(
                    ((duration - config.minDuration) * (config.maxInterest - config.minInterest))
                        / (config.maxDuration - config.minDuration)
                );
        } else {
            interest = config.minInterest
                + uint32(
                    (
                        (
                            ((borrowAmount - config.minAmount) * (config.maxInterest - config.minInterest))
                                / (config.maxAmount - config.minAmount)
                        )
                            + (
                                ((duration - config.minDuration) * (config.maxInterest - config.minInterest))
                                    / (config.maxDuration - config.minDuration)
                            )
                    ) / 2
                );
        }
    }
}
