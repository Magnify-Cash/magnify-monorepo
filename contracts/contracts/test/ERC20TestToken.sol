// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20TestToken is ERC20 {
    /**
     * @dev Sets the values for {total}, {name} and {symbol}.
     *
     * All of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 total
    ) ERC20(name_, symbol_) {
        _mint(msg.sender, total * (10 ** uint256(decimals())));
    }
}
