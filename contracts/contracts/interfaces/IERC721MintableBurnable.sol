// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IERC721MintableBurnable is IERC721 {
    function mint(address to, uint256 tokenId) external;

    function burn(uint256 tokenId) external;

    function exists(uint256 _tokenId) external view returns (bool);
}
