// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/INFTYERC721V1.sol";

contract NFTYERC721V1 is INFTYERC721V1, ERC721, Ownable {
    /* *********** */
    /*   STORAGE   */
    /* *********** */
    string public baseURI;
    address public nftyFinance;

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

    /**
     * @dev Requires caller to be the NFTY Finance contract
     */
    modifier onlyNftyFinance() {
        require(msg.sender == nftyFinance, "caller is not NFTY Finance");
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
    ) Ownable(initialOwner) ERC721(name, symbol) {
        require(bytes(name).length > 0, "name cannot be empty");
        require(bytes(symbol).length > 0, "symbol cannot be empty");
        require(bytes(_baseURI).length > 0, "base URI cannot be empty");

        baseURI = _baseURI;

        emit Initialized(msg.sender, name, symbol, _baseURI);
    }

    /* *********** */
    /* FUNCTIONS   */
    /* *********** */
    /**
     * @dev Set NFTY Finance contract address, requires caller to be owner
     */
    function setNftyFinance(address _nftyFinance) external onlyOwner {
        require(
            _nftyFinance != address(0),
            "NFTY Finance address cannot be zero"
        );
        nftyFinance = _nftyFinance;
        emit NFTYFinanceSet(_nftyFinance);
    }

    /**
     * @dev Update base URI but requires caller to be owner
     */
    function setBaseURI(string memory _baseURI) external onlyOwner {
        require(bytes(_baseURI).length > 0, "base URI cannot be empty");
        baseURI = _baseURI;
        emit BaseURISet(_baseURI);
    }

    /**
     * @dev Call _safeMint but requires caller to be the NFTY Finance contract
     */
    function mint(address to, uint256 tokenId) external onlyNftyFinance {
        require(to != address(0), "to address cannot be zero");
        require(!(_ownerOf(tokenId) != address(0)), "token already exists");
        _safeMint(to, tokenId);
    }

    /**
     * @dev Call _safeMint but requires caller to be the NFTY Finance contract
     */
    function burn(uint256 tokenId) external onlyNftyFinance {
        require((_ownerOf(tokenId) != address(0)), "token does not exist");
        _burn(tokenId);
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
