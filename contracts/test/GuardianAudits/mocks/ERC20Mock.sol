// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20("Mock", "MOCK") {
    function mint(address to, uint256 value) external{
        _mint(to, value);
    }

    function burn(uint256 value) external{
        _burn(msg.sender, value);
    }
}
