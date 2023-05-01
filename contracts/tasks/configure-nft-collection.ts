import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import { task, types } from "hardhat/config";
import { NFTYLending__factory } from "../../typechain-types";

// Task to configure an NFT collection's settings
task("configure-nft-collection", "Configure an NFT collection's settings")
  .addParam(
    "nftyaddr",
    "Address of the NFTYLending contract",
    undefined,
    types.string,
    false
  )
  .addParam(
    "nftaddr",
    "Address of the ERC721 contract",
    undefined,
    types.string,
    false
  )
  .addParam(
    "allowed",
    "Whether the NFT collection is whitelisted or not",
    undefined,
    types.boolean,
    false
  )
  .addParam(
    "image",
    "Image of the NFT collection",
    undefined,
    types.string,
    false
  )
  .setAction(async ({ nftyaddr, nftaddr, allowed, image }, hre) => {
    const NFTYLending = (await hre.ethers.getContractFactory(
      "NFTYLending"
    )) as NFTYLending__factory;
    const nftyLending = NFTYLending.attach(nftyaddr);

    const tx = await nftyLending.setNft(nftaddr, { allowed, image });

    // Print details
    console.log("Transaction sent:", tx.hash);
  });
