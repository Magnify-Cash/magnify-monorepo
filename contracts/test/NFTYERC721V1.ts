import { expect } from "chai";
import { ethers } from "hardhat";
import { NFTYERC721V1 } from "../../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("NFTYNotes", function () {
  const deployContractFixture = async () => {
    const tokenName = "My NFTY Note";
    const tokenSymbol = "MSN";
    const tokenUri = "https://my-nfty-notes.local/";
    const [owner, alice] = await ethers.getSigners();

    const NFTYNotes = (await ethers.getContractFactory(
      "NFTYNotes"
    )) as NFTYNotes__factory;
    const nftyNotes = await NFTYNotes.deploy(tokenName, tokenSymbol, tokenUri);
    await nftyNotes.deployed();

    const defaultAdminRole = await nftyNotes.DEFAULT_ADMIN_ROLE();
    const nftyLendingRole = await nftyNotes.NFTY_LENDING();
    const baseUriRole = await nftyNotes.BASE_URI_ROLE();

    return {
      nftyNotes,
      owner,
      alice,
      defaultAdminRole,
      nftyLendingRole,
      baseUriRole,
    };
  };

  const mintNoteFixture = async () => {
    const loanId = 1;

    const { nftyNotes, owner, alice } = await loadFixture(
      deployContractFixture
    );
    await nftyNotes.setNftyLending(owner.address);
    await nftyNotes.mint(alice.address, loanId);
    return { nftyNotes, owner, alice, loanId };
  };

  it("should deploy", async () => {
    const tokenName = "My NFTY Note";
    const tokenSymbol = "MSN";
    const tokenUri = "https://my-nfty-notes.local/";
    const [owner] = await ethers.getSigners();

    const NFTYNotes = (await ethers.getContractFactory(
      "NFTYNotes"
    )) as NFTYNotes__factory;

    const nftyNotes = await NFTYNotes.deploy(tokenName, tokenSymbol, tokenUri);
    await nftyNotes.deployed();

    const defaultAdminRole = await nftyNotes.DEFAULT_ADMIN_ROLE();
    const ownerIsAdmin = await nftyNotes.hasRole(
      defaultAdminRole,
      owner.address
    );
    expect(ownerIsAdmin).to.be.true;

    const baseUriRole = await nftyNotes.BASE_URI_ROLE();
    const ownerIsBaseUri = await nftyNotes.hasRole(baseUriRole, owner.address);
    expect(ownerIsBaseUri).to.be.true;

    const baseUri = await nftyNotes.baseURI();
    expect(baseUri).to.equal(tokenUri);
  });

  it("should fail to set note admin from non admin", async () => {
    const { nftyNotes, alice, defaultAdminRole } = await loadFixture(
      deployContractFixture
    );

    await expect(
      nftyNotes.connect(alice).setNftyLending(alice.address)
    ).to.be.revertedWith(
      "AccessControl: account " +
        alice.address.toLowerCase() +
        " is missing role " +
        defaultAdminRole
    );
  });

  it("should set note admin", async () => {
    const { nftyNotes, alice, nftyLendingRole } = await loadFixture(
      deployContractFixture
    );

    await nftyNotes.setNftyLending(alice.address);

    const aliceIsNoteAdmin = await nftyNotes.hasRole(
      nftyLendingRole,
      alice.address
    );
    expect(aliceIsNoteAdmin).to.be.true;
  });

  it("should fail to mint from non note admin", async () => {
    const loanId = 42;
    const { nftyNotes, alice } = await loadFixture(deployContractFixture);

    await expect(
      nftyNotes.connect(alice).mint(alice.address, loanId)
    ).to.be.revertedWith("NFTYNotes: caller is not NFTYLending");
  });

  it("should mint", async () => {
    const { nftyNotes, alice, owner } = await loadFixture(
      deployContractFixture
    );

    await nftyNotes.setNftyLending(owner.address);

    for (let loanId = 0; loanId < 3; loanId++) {
      await nftyNotes.mint(alice.address, loanId);

      // check receiver
      const nftOwner = await nftyNotes.ownerOf(loanId);
      expect(nftOwner).to.equal(alice.address);
      const balance = await nftyNotes.balanceOf(alice.address);
      expect(balance).to.equal(loanId + 1);
    }
  });

  it("should call exists", async () => {
    const { nftyNotes, loanId } = await loadFixture(mintNoteFixture);

    // Assertions
    expect(await nftyNotes.exists(loanId)).to.be.true;
    expect(await nftyNotes.exists(loanId + 1)).to.be.false;
  });

  it("should fail to burn from non note admin", async () => {
    const { nftyNotes, loanId, alice } = await loadFixture(mintNoteFixture);

    await expect(nftyNotes.connect(alice).burn(loanId)).to.be.revertedWith(
      "NFTYNotes: caller is not NFTYLending"
    );
  });

  it("should fail to burn with invalid token id", async () => {
    const { nftyNotes } = await loadFixture(mintNoteFixture);
    const invalidTokenId = 100;

    expect(await nftyNotes.exists(invalidTokenId)).to.be.false;
    await expect(nftyNotes.burn(invalidTokenId)).to.be.revertedWith(
      "NFTYNotes: loan does not exist"
    );
  });

  // TODO: seems like contract has a bug, confirm and fix
  it("should burn", async () => {
    const { nftyNotes, loanId, alice } = await loadFixture(mintNoteFixture);

    expect(await nftyNotes.exists(loanId)).to.be.true;

    await nftyNotes.burn(loanId);

    expect(await nftyNotes.exists(loanId)).to.be.false;

    // check token owner
    await expect(nftyNotes.ownerOf(loanId)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );

    expect(await nftyNotes.balanceOf(alice.address)).to.equal(0);
  });

  it("should call supportsInterface", async () => {
    const { nftyNotes } = await loadFixture(deployContractFixture);
    const erc721InterfaceId = "0x80ac58cd";
    const invalidInterfaceId = "0xffffffff";

    expect(await nftyNotes.supportsInterface(erc721InterfaceId)).to.be.true;
    expect(await nftyNotes.supportsInterface(invalidInterfaceId)).to.be.false;
  });

  it("should fail to set base URI from non base URI role", async () => {
    const { nftyNotes, alice } = await loadFixture(deployContractFixture);

    await expect(
      nftyNotes.connect(alice).setBaseURI("https://my-new-nfty-notes.local/")
    ).to.be.revertedWith("NFTYNotes: caller is not a base URI role");
  });

  it("should set base URI", async () => {
    const { nftyNotes } = await loadFixture(deployContractFixture);
    const newUri = "https://my-new-nfty-notes.local/";
    await nftyNotes.setBaseURI(newUri);

    const baseUri = await nftyNotes.baseURI();
    expect(baseUri).to.equal(newUri);
  });
});
