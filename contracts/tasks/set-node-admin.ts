import { task, types } from "hardhat/config";
import { NFTYNotes__factory } from "../../typechain-types";

// Task to set note admin in a NFTYNotes contract
task("set-nfty-lending", "Set NFTYLending in a NFTYNotes contract")
  .addParam(
    "lending",
    "The NFTYLending contract address",
    undefined,
    types.string,
    false
  )
  .addParam(
    "notes",
    "Address of the NFTYNotes contract",
    undefined,
    types.string,
    false
  )
  .setAction(async ({ lending, notes }, hre) => {
    const NFTYNotes = (await hre.ethers.getContractFactory(
      "NFTYNotes"
    )) as NFTYNotes__factory;
    const nftyNotes = NFTYNotes.attach(notes);

    const tx = await nftyNotes.setNftyLending(lending);
    console.log("Transactions sent:", tx.hash);
  });
