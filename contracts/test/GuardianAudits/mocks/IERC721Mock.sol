// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.22;

interface IERC721Mock {
    function mint(address to, uint256 id) external;
    function approve(address to, uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external view returns (address owner);
}
