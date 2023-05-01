// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTYNotes is ERC721, AccessControl, ReentrancyGuard {
    using Address for address;
    using Strings for uint256;

    bytes32 public constant NOTE_DESK_ADMIN = keccak256("NOTE_DESK_ADMIN");
    bytes32 public constant BASE_URI_ROLE = keccak256("BASE_URI_ROLE");

    struct Note {
        address noteDesk;
        uint256 noteId;
    }

    mapping(uint256 => Note) public notes;

    string public baseURI;

    constructor(
        string memory name,
        string memory symbol,
        string memory customBaseURI
    ) ERC721(name, symbol) {
        require(bytes(name).length > 0, "NFTYNotes: name cannot be empty");
        require(bytes(symbol).length > 0, "NFTYNotes: symbol cannot be empty");
        require(
            bytes(customBaseURI).length > 0,
            "NFTYNotes: customBaseURI cannot be empty"
        );

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(BASE_URI_ROLE, msg.sender);
        _setBaseURI(customBaseURI);
    }

    modifier onlyNoteAdmin() {
        require(
            hasRole(NOTE_DESK_ADMIN, msg.sender),
            "NFTYNotes: caller is not the Note Desk owner"
        );
        _;
    }

    modifier onlyBaseUriRole() {
        require(
            hasRole(BASE_URI_ROLE, msg.sender),
            "NFTYNotes: caller is not a base URI role"
        );
        _;
    }

    function setNoteAdmin(
        address account
    ) external nonReentrant onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            account != address(0),
            "NFTYNotes: account cannot be zero address"
        );
        grantRole(NOTE_DESK_ADMIN, account);
    }

    function mint(
        address to,
        uint256 tokenId,
        bytes calldata data
    ) external nonReentrant onlyNoteAdmin {
        require(to != address(0), "NFTYNotes: to address cannot be zero");
        require(tokenId > 0, "NFTYNotes: tokenId cannot be zero");
        require(data.length > 0, "NFTYNotes: data cannot be empty");
        require(!_exists(tokenId), "NFTYNotes: token already exists");

        uint256 noteId = abi.decode(data, (uint256));
        require(noteId > 0, "NFTYNotes: noteId cannot be zero");
        require(
            notes[tokenId].noteId == 0,
            "NFTYNotes: token already has a loan note"
        );

        notes[tokenId] = Note(msg.sender, noteId);
        _safeMint(to, tokenId, data);

        emit Minted(to, tokenId, msg.sender, noteId);
    }

    function burn(uint256 tokenId) external nonReentrant onlyNoteAdmin {
        require(tokenId > 0, "NFTYNotes: tokenId cannot be zero");
        require(
            ownerOf(tokenId) == msg.sender,
            "NFTYNotes: caller is not the owner of the token"
        );
        require(
            notes[tokenId].noteId > 0,
            "NFTYNotes: token does not have a loan note"
        );

        notes[tokenId].noteId = 0;
        _burn(tokenId);

        emit Burned(tokenId, msg.sender);
    }

    function setBaseURI(
        string memory customBaseURI
    ) external nonReentrant onlyBaseUriRole {
        require(
            bytes(customBaseURI).length > 0,
            "NFTYNotes: customBaseURI cannot be empty"
        );

        _setBaseURI(customBaseURI);

        emit BaseURISet(customBaseURI, msg.sender);
    }

    function _setBaseURI(string memory _baseURI_) internal virtual {
        baseURI = _baseURI_;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(_exists(tokenId), "NFTYNotes: URI query for nonexistent token");

        if (bytes(baseURI).length > 0) {
            return string(abi.encodePacked(baseURI, tokenId.toString()));
        } else {
            return "";
        }
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function exists(uint256 _tokenId) external view returns (bool) {
        return _exists(_tokenId);
    }

    event Minted(
        address indexed to,
        uint256 indexed tokenId,
        address indexed noteAdmin,
        uint256 noteId
    );
    event Burned(uint256 indexed tokenId, address indexed noteAdmin);
    event BaseURISet(string indexed baseURI, address indexed baseUriRole);
}
