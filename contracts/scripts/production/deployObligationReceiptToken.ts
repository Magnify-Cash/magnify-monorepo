// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// eslint-disable-next-line no-unused-vars
import config from "../../deploy-nfty-notes-config.json";
import { NFTYNotes__factory } from "../../../typechain-types";
import { defineDeployer } from "../helper";
import { ethers } from "hardhat";

async function main() {
  let deployerPK = await defineDeployer();
  const deployer = new ethers.Wallet(deployerPK, ethers.provider);
  console.log("Deploying contracts with account:", deployer.address);

  const obligationReceiptParameters = config.obligationReceipt;
  const nftyNotesFactory = (await ethers.getContractFactory(
    "NFTYNotes"
  )) as NFTYNotes__factory;
  const nftyNotes = await nftyNotesFactory
    .connect(deployer)
    .deploy(
      obligationReceiptParameters.name,
      obligationReceiptParameters.symbol,
      obligationReceiptParameters.baseUri
    );
  const obligationReceipt = await nftyNotes.deployed();
  console.log(
    "Successfully deployed obligation receipt contract at",
    obligationReceipt.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
