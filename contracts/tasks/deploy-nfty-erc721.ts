import { task, types } from "hardhat/config";
import { NFTYERC721V1__factory } from "../../typechain-types";

// Task to deploy NFTYERC721 contract
task("deploy-nfty-erc721", "Deploy NFTYERC721 contract")
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
    const NFTYERC721 = (await hre.ethers.getContractFactory(
      "NFTYERC721V1"
    )) as NFTYERC721V1__factory;
    const nftyErc721 = await NFTYERC721.deploy(name, symbol, baseuri);
    await nftyErc721.deployed();
    console.log("NFTYERC721 deployed @", nftyErc721.address);
    return nftyErc721;
  });
