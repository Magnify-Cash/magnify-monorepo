// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

import "./NFTYERC721.sol";

contract NFTYObligationNotesV1 is NFTYERC721 {
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) NFTYERC721(name, symbol, baseURI) {}
}
