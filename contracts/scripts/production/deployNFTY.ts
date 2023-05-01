// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import config from "../../deploy-nfty-config.json";
import {
  NFTYLending__factory,
  NFTYNotes__factory,
} from "../../../typechain-types";
import { defineDeployer } from "../helper";
import { ethers, upgrades } from "hardhat";

async function main() {
  let deployerPK = await defineDeployer();
  const deployer = new ethers.Wallet(deployerPK, ethers.provider);
  console.log("Deploying contracts with account:", deployer.address);

  const nftyLendingFactory = (await ethers.getContractFactory(
    "NFTYLending"
  )) as NFTYLending__factory;
  const nftyLending = await upgrades.deployProxy(
    nftyLendingFactory.connect(deployer),
    [
      config.whitelistedERC20s,
      config.whitelistedNFTs,
      config.promissoryNote,
      config.obligationReceipt,
      config.nftyToken,
      config.oracle,
    ]
  );
  await nftyLending.deployed();

  // Setting note admin in the NFTYNotes contracts
  const NFTYNotes = (await ethers.getContractFactory(
    "NFTYNotes"
  )) as NFTYNotes__factory;
  const promissoryNote = NFTYNotes.attach(config.promissoryNote);
  const obligationReceipt = NFTYNotes.attach(config.obligationReceipt);
  await promissoryNote.setNoteAdmin(nftyLending.address);
  await obligationReceipt.setNoteAdmin(nftyLending.address);

  console.log("Successfully deployed NFTYLending contract");
  console.log("    Proxy contract address (endpoint):", nftyLending.address);
  console.log(
    "    Proxy Admin contract address:",
    await upgrades.erc1967.getAdminAddress(nftyLending.address)
  );
  console.log(
    "    Implementation contract address:",
    await upgrades.erc1967.getImplementationAddress(nftyLending.address)
  );
  console.log("    Deployer (owner) account:", deployer.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
