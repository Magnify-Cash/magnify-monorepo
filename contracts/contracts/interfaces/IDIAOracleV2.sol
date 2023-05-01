// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

interface IDIAOracleV2 {
    function getValue(string memory) external view returns (uint128, uint128);
}
