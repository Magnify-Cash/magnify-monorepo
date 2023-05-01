import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import { task, types } from "hardhat/config";
import { NFTYNotes__factory } from "../../typechain-types";

// Task to set note admin in a NFTYNotes contract
task("set-note-admin", "Set note admin in a NFTYNotes contract")
  .addParam(
    "admin",
    "The note admin, i.e. the NFTYLending contract address",
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
  .setAction(async ({ admin, notes }, hre) => {
    const NFTYNotes = (await hre.ethers.getContractFactory(
      "NFTYNotes"
    )) as NFTYNotes__factory;
    const nftyNotes = NFTYNotes.attach(notes);

    const tx = await nftyNotes.setNoteAdmin(admin);
    console.log("Transactions sent:", tx.hash);
  });
