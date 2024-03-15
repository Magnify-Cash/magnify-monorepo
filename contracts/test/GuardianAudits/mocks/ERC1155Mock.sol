// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.22;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract ERC1155Mock is ERC1155("mocks.com/{id}.json") {

    function mint(address to, uint256 id, uint256 value, bytes memory data) public{
        _mint(to,id,value,data);
    } 
}
