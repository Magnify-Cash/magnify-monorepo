import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import { task, types } from "hardhat/config";
import { NFTYNotes__factory } from "../../typechain-types";

// Task to deploy NFTYNotes contract
task("deploy-nfty-notes", "Deploy NFTYNotes contract")
  .addParam(
    "name",
    "Name of the NFT collection",
    undefined,
    types.string,
    false
  )
  .addParam(
    "symbol",
    "Symbol of the NFT collection",
    undefined,
    types.string,
    false
  )
  .addParam(
    "baseuri",
    "Base URI of the NFTs' metadata",
    undefined,
    types.string,
    false
  )
  .setAction(async ({ name, baseuri, symbol }, hre) => {
    // Deploy contract
    const NFTYNotes = (await hre.ethers.getContractFactory(
      "NFTYNotes"
    )) as NFTYNotes__factory;
    const nftyNotes = await NFTYNotes.deploy(name, symbol, baseuri);
    await nftyNotes.deployed();
    console.log("NFTYNotes deployed @", nftyNotes.address);
    return nftyNotes;
  });
