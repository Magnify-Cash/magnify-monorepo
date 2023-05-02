import { task, types } from "hardhat/config";
import { NFTYLending__factory } from "../../typechain-types";

// Task to configure an ERC20 token's settings
task("configure-token", "Configure an ERC20 token's settings")
  .addParam(
    "nftyaddr",
    "Address of the NFTYLending contract",
    undefined,
    types.string,
    false
  )
  .addParam(
    "tokenaddr",
    "Address of the ERC20 contract",
    undefined,
    types.string,
    false
  )
  .addParam(
    "allowed",
    "Whether the token is whitelisted or not",
    undefined,
    types.boolean,
    false
  )
  .addParam(
    "minbasket",
    "Minimum size of a liquidity shop",
    undefined,
    types.int,
    false
  )
  .addParam(
    "minpay",
    "Minimum payment amount for a loan",
    undefined,
    types.int,
    false
  )
  .setAction(
    async ({ nftyaddr, tokenaddr, allowed, minbasket, minpay }, hre) => {
      const NFTYLending = (await hre.ethers.getContractFactory(
        "NFTYLending"
      )) as NFTYLending__factory;
      const nftyLending = NFTYLending.attach(nftyaddr);

      const tx = await nftyLending.setErc20(tokenaddr, {
        minimumBasketSize: minbasket,
        minimumPaymentAmount: minpay,
        allowed,
      });

      // Print details
      console.log("Transaction sent:", tx.hash);
    }
  );
