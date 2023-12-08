import { TestERC721 } from "contracts/typechain-types";
import { ContractTransactionResponse } from "ethers";
import { task, types } from "hardhat/config";

type TaskResult = TestERC721 & {
  deploymentTransaction(): ContractTransactionResponse;
};

// Task to deploy test ERC721 NFT collection
task<TaskResult>(
  "deploy-nft-collection",
  "Deploys a test ERC721 NFT collection contract"
)
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
    const TestERC721 = await hre.ethers.getContractFactory("TestERC721");
    const testErc721 = await TestERC721.deploy(name, symbol, baseuri);
    await testErc721.waitForDeployment();

    // Print details and return
    console.log(`
    Test ERC721 NFT collection contract deployed!
    Name: ${name}
    Symbol: $${symbol}
    Base URI: ${baseuri}
    Address: ${testErc721.target}
    `);
    return testErc721;
  });
