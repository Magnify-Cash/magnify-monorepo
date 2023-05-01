// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC721TestToken is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    string public baseURI;

    constructor() ERC721("TEST", "NFT") {}

    function awardItem(address player) external returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(player, newItemId);

        return newItemId;
    }

    /**
     * Base URI for metadata testing
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    /**
     * @dev Sets baseURI.
     * @param _customBaseURI - Base URI for the Nft
     */
    function setBaseURI(string memory _customBaseURI) external onlyOwner {
        baseURI = bytes(_customBaseURI).length > 0 ? _customBaseURI : "";
    }
}
