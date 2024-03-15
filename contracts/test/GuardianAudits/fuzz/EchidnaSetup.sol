// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {NFTYFinanceV1} from "contracts/NFTYFinanceV1.sol";
import {NFTYObligationNotesV1} from "contracts/NFTYObligationNotesV1.sol";
import {NFTYLendingKeysV1} from "contracts/NFTYLendingKeysV1.sol";

import {EchidnaUtils} from "./EchidnaUtils.sol";

contract EchidnaSetup is EchidnaUtils {
    NFTYFinanceV1 nftyFinance;
    NFTYObligationNotesV1 obligationNotes;
    NFTYLendingKeysV1 lendingKeys;

    address platformWallet = address(0x2);

    function deploy() internal {
        obligationNotes = new NFTYObligationNotesV1(
            "NFTY Obligation Notes", "BORROW", "https://metadata.nfty.finance/BORROW/", address(this)
        );

        lendingKeys =
            new NFTYLendingKeysV1("NFTY Lending Keys", "KEYS", "https://metadata.nfty.finance/KEYS/", address(this));

        nftyFinance =
            new NFTYFinanceV1(address(obligationNotes), address(lendingKeys), 200, platformWallet, address(this));

        obligationNotes.setNftyFinance(address(nftyFinance));
        lendingKeys.setNftyFinance(address(nftyFinance));
    }
}
