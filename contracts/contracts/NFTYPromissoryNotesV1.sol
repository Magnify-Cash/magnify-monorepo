// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.22;

import "./NFTYERC721V1.sol";

contract NFTYPromissoryNotesV1 is NFTYERC721V1 {
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
        address _initialOwner
    ) NFTYERC721V1(_name, _symbol, _baseURI, _initialOwner) {}
}
