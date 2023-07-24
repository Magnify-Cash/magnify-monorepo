// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/INFTYERC721V1.sol";

contract NFTYERC721V1 is INFTYERC721V1, ERC721, Ownable, ReentrancyGuard {
    /* *********** */
    /*   STORAGE   */
    /* *********** */
    string public baseURI;
    address public nftyFinance;

    /* *********** */
    /*   EVENTS    */
    /* *********** */
    event BaseURISet(address indexed caller, string indexed baseURI);

    /**
     * @dev Requires caller to be the NFTY Finance contract
     */
    modifier onlyNftyFinance() {
        require(
            msg.sender == nftyFinance,
            "caller is not the NFTY Finance contract"
        );
        _;
    }

    /* *********** */
    /* CONSTRUCTOR */
    /* *********** */
    constructor(
        string memory name,
        string memory symbol,
        string memory _baseURI
    ) ERC721(name, symbol) {
        baseURI = _baseURI;
    }

    /* *********** */
    /* FUNCTIONS   */
    /* *********** */
    /**
     * @dev Set NFTY Finance contract address, requires caller to be owner
     */
    function setNftyFinance(address _nftyFinance) external onlyOwner {
        nftyFinance = _nftyFinance;
    }

    /**
     * @dev Call _safeMint but requires caller to be the NFTY Finance contract
     */
    function mint(
        address to,
        uint256 tokenId
    ) external nonReentrant onlyNftyFinance {
        require(to != address(0), "to address cannot be zero");
        require(!_exists(tokenId), "token already exists");
        _safeMint(to, tokenId);
    }

    /**
     * @dev Call _safeMint but requires caller to be the NFTY Finance contract
     */
    function burn(uint256 tokenId) external nonReentrant onlyNftyFinance {
        require(_exists(tokenId), "token does not exist");
        _burn(tokenId);
    }

    /**
     * @dev Update base URI but requires caller to be owner
     */
    function setBaseURI(
        string memory _baseURI
    ) external nonReentrant onlyOwner {
        require(bytes(_baseURI).length > 0, "base URI cannot be empty");
        baseURI = _baseURI;
        emit BaseURISet(msg.sender, _baseURI);
    }

    /**
     * @dev The following functions are overrides required by Solidity.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
