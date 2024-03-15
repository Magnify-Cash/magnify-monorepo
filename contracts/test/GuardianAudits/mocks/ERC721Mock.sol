// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721Mock is ERC721("Mock", "MOCK") {
    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function ownerOf(uint256 tokenId) public view override returns (address) {
        return _ownerOf(tokenId);
    }
}
