// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {MagnifyCashV1} from "contracts/MagnifyCashV1.sol";
import {MagnifyObligationNotesV1} from "contracts/MagnifyObligationNotesV1.sol";
import {MagnifyLendingKeysV1} from "contracts/MagnifyLendingKeysV1.sol";

import {EchidnaUtils} from "./EchidnaUtils.sol";

contract EchidnaSetup is EchidnaUtils {
    MagnifyCashV1 magnifyCash;
    MagnifyObligationNotesV1 obligationNotes;
    MagnifyLendingKeysV1 lendingKeys;

    address platformWallet = address(0x2);

    function deploy() internal {
        obligationNotes = new MagnifyObligationNotesV1(
            "Magnify Obligation Notes", "BORROW", "https://metadata.magnify.cash/BORROW/", address(this)
        );

        lendingKeys =
            new MagnifyLendingKeysV1("Magnify Lending Keys", "KEYS", "https://metadata.magnify.cash/KEYS/", address(this));

        magnifyCash =
            new MagnifyCashV1(address(obligationNotes), address(lendingKeys), 200, platformWallet, address(this));

        obligationNotes.setMagnifyCash(address(magnifyCash));
        lendingKeys.setMagnifyCash(address(magnifyCash));
    }
}
