// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.18;

import "erc721a/contracts/ERC721A.sol";

contract TestERC721 is ERC721A {
    string public baseURI;

    constructor(
        string memory name,
        string memory symbol,
        string memory _baseURI
    ) ERC721A(name, symbol) {
        baseURI = _baseURI;
    }

    function mint(uint256 quantity) external {
        _mint(msg.sender, quantity);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}
