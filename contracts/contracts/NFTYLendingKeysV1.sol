// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

import "./NFTYERC721V1.sol";

contract NFTYLendingKeysV1 is NFTYERC721V1 {
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI
    ) NFTYERC721V1(_name, _symbol, _baseURI) {}
}
