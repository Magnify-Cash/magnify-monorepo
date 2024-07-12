// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.22;

import "./MagnifyERC721V1.sol";

contract MagnifyObligationNotesV1 is MagnifyERC721V1 {
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
        address _initialOwner
    ) MagnifyERC721V1(_name, _symbol, _baseURI, _initialOwner) {}
}
