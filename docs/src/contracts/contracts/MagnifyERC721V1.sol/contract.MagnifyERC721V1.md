# MagnifyERC721V1
[Git Source](https://github.com/Magnify-Cash/magnify-monorepo/blob/efd970ae36caf12f463329311207d019e41348d8/contracts/contracts/MagnifyERC721V1.sol)

**Inherits:**
ERC721, Ownable


## State Variables
### baseURI

```solidity
string public baseURI;
```


### magnifyCash

```solidity
address public magnifyCash;
```


### _name

```solidity
string private _name;
```


### _symbol

```solidity
string private _symbol;
```


## Functions
### onlyMagnifyCash

*Requires caller to be the Magnify Cash contract*


```solidity
modifier onlyMagnifyCash();
```

### constructor


```solidity
constructor(string memory name, string memory symbol, string memory _baseURI, address initialOwner);
```

### name


```solidity
function name() public view override returns (string memory);
```

### symbol


```solidity
function symbol() public view override returns (string memory);
```

### tokenURI


```solidity
function tokenURI(uint256 tokenId) public view override returns (string memory);
```

### setMagnifyCash

*Set Magnify Cash contract address, requires caller to be owner*


```solidity
function setMagnifyCash(address _magnifyCash) external onlyOwner;
```

### setBaseURI

*Update base URI but requires caller to be owner*


```solidity
function setBaseURI(string memory _baseURI) external onlyOwner;
```

### mint

*Call _mint but requires caller to be the Magnify Cash contract*


```solidity
function mint(address to, uint256 tokenId) external onlyMagnifyCash;
```

### burn

*Call _burn but requires caller to be the Magnify Cash contract*


```solidity
function burn(uint256 tokenId) external onlyMagnifyCash;
```

## Events
### Initialized

```solidity
event Initialized(address owner, string name, string symbol, string baseURI);
```

### BaseURISet

```solidity
event BaseURISet(string indexed baseURI);
```

### MagnifyCashSet

```solidity
event MagnifyCashSet(address indexed magnifyCash);
```

## Errors
### NameIsEmpty

```solidity
error NameIsEmpty();
```

### SymbolIsEmpty

```solidity
error SymbolIsEmpty();
```

### BaseURIIsEmpty

```solidity
error BaseURIIsEmpty();
```

### CallerIsNotMagnifyCash

```solidity
error CallerIsNotMagnifyCash();
```

### MintToZeroAddress

```solidity
error MintToZeroAddress();
```

### MagnifyCashIsZeroAddress

```solidity
error MagnifyCashIsZeroAddress();
```

