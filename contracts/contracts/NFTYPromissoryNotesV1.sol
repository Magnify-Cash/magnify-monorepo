// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

import "./NFTYERC721.sol";

contract NFTYPromissoryNotesV1 is NFTYERC721 {
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
        address _nftyFinance
    ) NFTYERC721(_name, _symbol, _baseURI, _nftyFinance) {}
}
