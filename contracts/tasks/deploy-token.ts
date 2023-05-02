import { task, types } from "hardhat/config";
import { TestToken__factory } from "../../typechain-types";

// Task to deploy test ERC20 token
task("deploy-token", "Deploys a test ERC20 token contract")
  .addParam("name", "Name of the token", undefined, types.string, false)
  .addParam("symbol", "Symbol of the token", undefined, types.string, false)
  .setAction(async ({ name, symbol }, hre) => {
    // Deploy contract
    const TestToken = (await hre.ethers.getContractFactory(
      "TestToken"
    )) as TestToken__factory;
    const testToken = await TestToken.deploy(name, symbol);
    await testToken.deployed();

    // Print details and return
    console.log(`
    Test ERC20 token contract deployed!
    Name: ${name}
    Symbol: $${symbol}
    Address: ${testToken.address}
    `);
    return testToken;
  });
