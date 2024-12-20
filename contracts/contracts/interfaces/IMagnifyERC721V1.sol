// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IMagnifyERC721V1 is IERC721 {
    function mint(address to, uint256 tokenId) external;

    function burn(uint256 tokenId) external;
}
