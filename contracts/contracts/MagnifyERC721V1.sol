// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.22;

import "solady/src/tokens/ERC721.sol";
import "solady/src/auth/Ownable.sol";
import {LibString} from "solady/src/utils/LibString.sol";

contract MagnifyERC721V1 is ERC721, Ownable {
    using LibString for uint256;

    /* *********** */
    /*   STORAGE   */
    /* *********** */
    string public baseURI;
    address public magnifyCash;
    string private _name;
    string private _symbol;

    /* *********** */
    /*   EVENTS    */
    /* *********** */
    event Initialized(
        address owner,
        string name,
        string symbol,
        string baseURI
    );
    event BaseURISet(string indexed baseURI);
    event MagnifyCashSet(address indexed magnifyCash);

    error NameIsEmpty();
    error SymbolIsEmpty();
    error BaseURIIsEmpty();
    error CallerIsNotMagnifyCash();
    error MintToZeroAddress();
    error MagnifyCashIsZeroAddress();

    /**
     * @dev Requires caller to be the Magnify Cash contract
     */
    modifier onlyMagnifyCash() {
        if (msg.sender != magnifyCash) revert CallerIsNotMagnifyCash();
        _;
    }

    /* *********** */
    /* CONSTRUCTOR */
    /* *********** */
    constructor(
        string memory name,
        string memory symbol,
        string memory _baseURI,
        address initialOwner
    ) {
        if (bytes(name).length == 0) revert NameIsEmpty();
        if (bytes(symbol).length == 0) revert SymbolIsEmpty();
        if (bytes(_baseURI).length == 0) revert BaseURIIsEmpty();

        baseURI = _baseURI;
        _name = name;
        _symbol = symbol;
        _initializeOwner(initialOwner);

        emit Initialized(msg.sender, name, symbol, _baseURI);
    }

    function name() public view override returns (string memory) {
        return _name;
    }

    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        return string.concat(baseURI, tokenId.toString());
    }

    /* *********** */
    /* FUNCTIONS   */
    /* *********** */
    /**
     * @dev Set Magnify Cash contract address, requires caller to be owner
     */
    function setMagnifyCash(address _magnifyCash) external onlyOwner {
        if (_magnifyCash == address(0)) revert MagnifyCashIsZeroAddress();
        magnifyCash = _magnifyCash;
        emit MagnifyCashSet(_magnifyCash);
    }

    /**
     * @dev Update base URI but requires caller to be owner
     */
    function setBaseURI(string memory _baseURI) external onlyOwner {
        if (bytes(_baseURI).length == 0) revert BaseURIIsEmpty();
        baseURI = _baseURI;
        emit BaseURISet(_baseURI);
    }

    /**
     * @dev Call _mint but requires caller to be the Magnify Cash contract
     */
    function mint(address to, uint256 tokenId) external onlyMagnifyCash {
        if (to == address(0)) revert MintToZeroAddress();
        if (_ownerOf(tokenId) != address(0)) revert TokenAlreadyExists();
        _mint(to, tokenId);
    }

    /**
     * @dev Call _burn but requires caller to be the Magnify Cash contract
     */
    function burn(uint256 tokenId) external onlyMagnifyCash {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        _burn(tokenId);
    }
}
