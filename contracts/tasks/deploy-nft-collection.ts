import { task, types } from "hardhat/config";
import { TestERC721__factory } from "../../typechain-types";

// Task to deploy test ERC721 NFT collection
task("deploy-nft-collection", "Deploys a test ERC721 NFT collection contract")
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
  .setAction(async ({ name, symbol, baseuri }, hre) => {
    // Deploy contract
    const TestERC721 = (await hre.ethers.getContractFactory(
      "TestERC721"
    )) as TestERC721__factory;
    const testErc721 = await TestERC721.deploy(name, symbol, baseuri);
    await testErc721.deployed();

    // Print details and return
    console.log(`
    Test ERC721 NFT collection contract deployed!
    Name: ${name}
    Symbol: $${symbol}
    Base URI: ${baseuri}
    Address: ${testErc721.address}
    `);
    return testErc721;
  });
