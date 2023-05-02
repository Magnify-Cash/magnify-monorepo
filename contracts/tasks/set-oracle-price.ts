import { task, types } from "hardhat/config";
import {
  NFTYLending__factory,
  DIAOracleV2__factory,
} from "../../typechain-types";
import { BigNumber } from "ethers";

// Task to set token price in testnet oracle
task("set-oracle-price", "Set token price in testnet oracle")
  .addParam("symbol", "Symbol of the token", undefined, types.string, false)
  .addParam("price", "Price of token in USD", undefined, types.float, false)
  .addParam(
    "addr",
    "Address of the NFTYLending contract",
    undefined,
    types.string,
    false
  )
  .setAction(async ({ price, addr, symbol }, hre) => {
    const NFTYLending = (await hre.ethers.getContractFactory(
      "NFTYLending"
    )) as NFTYLending__factory;
    const nftyLending = NFTYLending.attach(addr);

    // Set fee expiration time to 10 years
    const tx1 = await nftyLending.setFeeExpiration(BigNumber.from(315360000));

    // Get Oracle address and contract instance
    const oracleAddr = await nftyLending.oracle();
    const DIAOracle = (await hre.ethers.getContractFactory(
      "DIAOracleV2"
    )) as DIAOracleV2__factory;
    const diaOracle = DIAOracle.attach(oracleAddr);

    // Set price in oracle
    const tx2 = await diaOracle.setValue(
      `${symbol}/USD`,
      hre.ethers.utils.parseUnits(price.toString(), 18),
      Math.floor(new Date().getTime() / 1000)
    );

    // Print details
    console.log("Transactions sent:", tx1.hash, tx2.hash);
  });
