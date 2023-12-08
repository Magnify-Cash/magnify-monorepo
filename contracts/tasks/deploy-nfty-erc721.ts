import { NFTYERC721V1 } from "contracts/typechain-types";
import { ContractTransactionResponse } from "ethers";
import { task, types } from "hardhat/config";

type TaskResult = NFTYERC721V1 & {
  deploymentTransaction(): ContractTransactionResponse;
};

// Task to deploy NFTYERC721 contract
task<TaskResult>("deploy-nfty-erc721", "Deploy NFTYERC721 contract")
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
    const NFTYERC721 = await hre.ethers.getContractFactory("NFTYERC721V1");
    const nftyErc721 = await NFTYERC721.deploy(
      name,
      symbol,
      baseuri,
      owner.address
    );
    await nftyErc721.waitForDeployment();
    console.log("NFTYERC721 deployed @", nftyErc721.target);
    return nftyErc721;
  });
