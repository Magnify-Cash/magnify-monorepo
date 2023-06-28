// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./interfaces/INFTYERC721.sol";

contract NFTYERC721 is INFTYERC721, ERC721, AccessControl, ReentrancyGuard {
    /* *********** */
    /*   STORAGE   */
    /* *********** */
    string public baseURI;
    bytes32 public constant NFTY_LENDING_ROLE = keccak256("NFTY_LENDING_ROLE");
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");

    /* *********** */
    /*   EVENTS    */
    /* *********** */
    event BaseURISet(address indexed caller, string indexed baseURI);

    /* *********** */
    /* CONSTRUCTOR */
    /* *********** */
    constructor(
        string memory name,
        string memory symbol,
        string memory _baseURI
    ) ERC721(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(URI_SETTER_ROLE, msg.sender);

        baseURI = _baseURI;
    }

    /* *********** */
    /* FUNCTIONS   */
    /* *********** */
    /**
     * @dev Call _safeMint but require NFTY_LENDING_ROLE
     */
    function mint(
        address to,
        uint256 tokenId
    ) external nonReentrant onlyRole(NFTY_LENDING_ROLE) {
        require(to != address(0), "to address cannot be zero");
        require(!_exists(tokenId), "token already exists");
        _safeMint(to, tokenId);
    }

    /**
     * @dev Call _safeMint but require NFTY_LENDING_ROLE
     */
    function burn(
        uint256 tokenId
    ) external nonReentrant onlyRole(NFTY_LENDING_ROLE) {
        require(_exists(tokenId), "token does not exist");
        _burn(tokenId);
    }

    /**
     * @dev Update base URI but require URI_SETTER_ROLE
     */
    function setBaseURI(
        string memory _baseURI
    ) external nonReentrant onlyRole(URI_SETTER_ROLE) {
        require(bytes(_baseURI).length > 0, "base URI cannot be empty");
        baseURI = _baseURI;
        emit BaseURISet(msg.sender, _baseURI);
    }

    /**
     * @dev The following functions are overrides required by Solidity.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC721, AccessControl, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
