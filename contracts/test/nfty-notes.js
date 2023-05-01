/* eslint-disable new-cap */
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTYNotes", function () {
  before(async function () {
    [owner, david, bob, alice] = await ethers.getSigners();

    this.nftyNotesFactory = await ethers.getContractFactory("NFTYNotes");
    this.chainId = await owner.getChainId();
    this.tokenCounter = 0; // used to set and track minted token ids
    this.encoder = ethers.utils.defaultAbiCoder; // used as mint data generator
  });

  it("should deploy", async function () {
    const tokenName = "My NFTY Note";
    const tokenSymbol = "MSN";
    const tokenURI = "https://my-nfty-notes.local/";

    this.nftyNotes = await this.nftyNotesFactory.deploy(
      tokenName,
      tokenSymbol,
      tokenURI
    );
    await this.nftyNotes.deployed();

    this.DEFAULT_ADMIN_ROLE = await this.nftyNotes.DEFAULT_ADMIN_ROLE();
    this.LOAN_COORDINATOR_ROLE = await this.nftyNotes.LOAN_COORDINATOR_ROLE();
    this.BASE_URI_ROLE = await this.nftyNotes.BASE_URI_ROLE();

    const ownerIsAdmin = await this.nftyNotes.hasRole(
      this.DEFAULT_ADMIN_ROLE,
      owner.address
    );
    expect(ownerIsAdmin).to.be.true;

    const ownerIsBaseUri = await this.nftyNotes.hasRole(
      this.BASE_URI_ROLE,
      owner.address
    );
    expect(ownerIsBaseUri).to.be.true;

    const baseUri = await this.nftyNotes.baseURI();
    expect(baseUri).to.equal(tokenURI + this.chainId + "/");
  });

  it("should fail to set loan coordinator from non admin", async function () {
    await expect(
      this.nftyNotes.connect(bob).setLoanCoordinator(bob.address)
    ).to.be.revertedWith(
      "AccessControl: account " +
        bob.address.toLowerCase() +
        " is missing role " +
        this.DEFAULT_ADMIN_ROLE
    );
  });

  it("should set loan coordinator", async function () {
    await this.nftyNotes.setLoanCoordinator(bob.address);

    const bobIsLoanCoordinator = await this.nftyNotes.hasRole(
      this.LOAN_COORDINATOR_ROLE,
      bob.address
    );
    expect(bobIsLoanCoordinator).to.be.true;
  });

  it("should fail to mint from non loan coordinator", async function () {
    const loanId = 42;
    await expect(
      this.nftyNotes
        .connect(david)
        .mint(
          alice.address,
          this.tokenCounter,
          this.encoder.encode(["uint256"], [loanId])
        )
    ).to.be.revertedWith(
      "AccessControl: account " +
        david.address.toLowerCase() +
        " is missing role " +
        this.LOAN_COORDINATOR_ROLE
    );
  });

  it("should fail to mint without loan id", async function () {
    await this.nftyNotes.setLoanCoordinator(owner.address);

    await expect(
      this.nftyNotes.connect(owner).mint(alice.address, this.tokenCounter, [])
    ).to.be.revertedWith("data must contain loanId");
  });

  it("should mint", async function () {
    const loanIds = [1, 2, 3];
    for (let i = 0; i < loanIds.length; i++) {
      const loanId = loanIds[i];
      await this.nftyNotes
        .connect(owner)
        .mint(
          alice.address,
          this.tokenCounter,
          this.encoder.encode(["uint256"], [loanId])
        );

      // check receiver
      const ownerOf = await this.nftyNotes.ownerOf(this.tokenCounter);
      expect(ownerOf).to.equal(alice.address);
      const balance = await this.nftyNotes.balanceOf(alice.address);
      expect(balance).to.equal(i + 1);

      // check contract storage
      const loan = await this.nftyNotes.loans(this.tokenCounter);
      expect(loan.loanCoordinator).to.equal(owner.address);
      expect(loan.loanId.toNumber()).to.equal(loanId);

      this.tokenCounter++;
    }
  });

  it("should call exists", async function () {
    let exists;

    for (let i = 0; i < this.tokenCounter; i++) {
      exists = await this.nftyNotes.exists(i);
      expect(exists).to.be.true;
    }

    exists = await this.nftyNotes.exists(this.tokenCounter + 1);
    expect(exists).to.be.false;
  });

  it("should fail to burn from non loan coordinator", async function () {
    await expect(
      this.nftyNotes.connect(david).burn(this.tokenCounter)
    ).to.be.revertedWith(
      "AccessControl: account " +
        david.address.toLowerCase() +
        " is missing role " +
        this.LOAN_COORDINATOR_ROLE
    );
  });

  it("should fail to burn with invalid token id", async function () {
    const invalidTokenId = 100;
    const exists = await this.nftyNotes.exists(invalidTokenId);
    expect(exists).to.be.false;

    await expect(
      this.nftyNotes.connect(owner).burn(invalidTokenId)
    ).to.be.revertedWith("ERC721: invalid token ID");
  });

  it("should burn", async function () {
    const tokenId = this.tokenCounter - 1;

    exists = await this.nftyNotes.exists(tokenId);
    expect(exists).to.be.true;

    await this.nftyNotes.connect(owner).burn(tokenId);

    exists = await this.nftyNotes.exists(tokenId);
    expect(exists).to.be.false;

    // check token owner
    await expect(this.nftyNotes.ownerOf(tokenId)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );

    const balance = await this.nftyNotes.balanceOf(alice.address);
    expect(balance).to.equal(this.tokenCounter - 1);

    // check contract storage
    const loan = await this.nftyNotes.loans(tokenId);
    expect(loan.loanCoordinator).to.equal(ethers.constants.AddressZero);
    expect(loan.loanId.toNumber()).to.equal(0);
  });

  it("should call supportsInterface", async function () {
    const erc721InterfaceId = "0x80ac58cd";
    let supports = await this.nftyNotes.supportsInterface(erc721InterfaceId);
    expect(supports).to.be.true;

    const invalidInterfaceId = "0xffffffff";
    supports = await this.nftyNotes.supportsInterface(invalidInterfaceId);
    expect(supports).to.be.false;
  });

  it("should fail to set base URI from non owner", async function () {
    await expect(
      this.nftyNotes.connect(bob).setBaseURI("https://my-new-nfty-notes.local/")
    ).to.be.revertedWith(
      "AccessControl: account " +
        bob.address.toLowerCase() +
        " is missing role " +
        this.BASE_URI_ROLE
    );
  });

  it("should set base URI", async function () {
    const newUri = "https://my-new-nfty-notes.local/";
    await this.nftyNotes.setBaseURI(newUri);

    const baseUri = await this.nftyNotes.baseURI();
    expect(baseUri).to.equal(newUri + this.chainId + "/");
  });
});
