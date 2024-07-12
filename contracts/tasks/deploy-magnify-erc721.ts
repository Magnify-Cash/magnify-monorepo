import { MagnifyERC721V1 } from "contracts/typechain-types";
import { ContractTransactionResponse } from "ethers";
import { task, types } from "hardhat/config";

type TaskResult = MagnifyERC721V1 & {
  deploymentTransaction(): ContractTransactionResponse;
};

// Task to deploy MagnifyERC721 contract
task<TaskResult>("deploy-magnify-erc721", "Deploy MagnifyERC721 contract")
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
    const [owner] = await hre.ethers.getSigners();
    // Deploy contract
    const MagnifyERC721 = await hre.ethers.getContractFactory("MagnifyERC721V1");
    const magnifyErc721 = await MagnifyERC721.deploy(
      name,
      symbol,
      baseuri,
      owner.address
    );
    await magnifyErc721.waitForDeployment();
    console.log("MagnifyERC721 deployed @", magnifyErc721.target);
    return magnifyErc721;
  });
