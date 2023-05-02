import { task, types } from "hardhat/config";
import { TestNFTCollection__factory } from "../../typechain-types";

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
    const TestNftCollection = (await hre.ethers.getContractFactory(
      "TestNFTCollection"
    )) as TestNFTCollection__factory;
    const testNftCollection = await TestNftCollection.deploy(
      name,
      symbol,
      baseuri
    );
    await testNftCollection.deployed();

    // Print details and return
    console.log(`
    Test ERC721 NFT collection contract deployed!
    Name: ${name}
    Symbol: $${symbol}
    Base URI: ${baseuri}
    Address: ${testNftCollection.address}
    `);
    return testNftCollection;
  });
