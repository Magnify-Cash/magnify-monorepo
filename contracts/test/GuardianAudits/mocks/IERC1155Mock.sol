// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.22;

interface IERC1155Mock {
    function mint(address to, uint256 id, uint256 value, bytes memory data) external;
    function setApprovalForAll(address operator, bool approved) external;
    function balanceOf(address account, uint256 id) external view returns (uint256);
}
