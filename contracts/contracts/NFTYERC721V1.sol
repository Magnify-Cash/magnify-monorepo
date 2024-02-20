// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.22;

import "solady/src/tokens/ERC721.sol";
import "solady/src/auth/Ownable.sol";
import {LibString} from "solady/src/utils/LibString.sol";

contract NFTYERC721V1 is ERC721, Ownable {
    using LibString for uint256;

    /* *********** */
    /*   STORAGE   */
    /* *********** */
    string public baseURI;
    address public nftyFinance;
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
    event NFTYFinanceSet(address indexed nftyFinance);

    error NameIsEmpty();
    error SymbolIsEmpty();
    error BaseURIIsEmpty();
    error CallerIsNotNFTYFinance();
    error MintToZeroAddress();
    error NFTYFinanceIsZeroAddress();

    /**
     * @dev Requires caller to be the NFTY Finance contract
     */
    modifier onlyNftyFinance() {
        if (msg.sender != nftyFinance) revert CallerIsNotNFTYFinance();
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
     * @dev Set NFTY Finance contract address, requires caller to be owner
     */
    function setNftyFinance(address _nftyFinance) external onlyOwner {
        if (_nftyFinance == address(0)) revert NFTYFinanceIsZeroAddress();
        nftyFinance = _nftyFinance;
        emit NFTYFinanceSet(_nftyFinance);
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
     * @dev Call _safeMint but requires caller to be the NFTY Finance contract
     */
    function mint(address to, uint256 tokenId) external onlyNftyFinance {
        if (to == address(0)) revert MintToZeroAddress();
        if (_ownerOf(tokenId) != address(0)) revert TokenAlreadyExists();
        _safeMint(to, tokenId);
    }

    /**
     * @dev Call _safeMint but requires caller to be the NFTY Finance contract
     */
    function burn(uint256 tokenId) external onlyNftyFinance {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        _burn(tokenId);
    }
}
