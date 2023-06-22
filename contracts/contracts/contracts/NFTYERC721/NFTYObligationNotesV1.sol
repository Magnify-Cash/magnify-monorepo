// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

import "./NFTYERC721.sol";

contract NFTYObligationNotesV1 is NFTYERC721 {
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI
    ) NFTYERC721(_name, _symbol, _baseURI) {}
}
