import { task, types } from "hardhat/config";
import { TestERC20__factory } from "../../typechain-types";

// Task to deploy test ERC20 token
task("deploy-token", "Deploys a test ERC20 token contract")
  .addParam("name", "Name of the token", undefined, types.string, false)
  .addParam("symbol", "Symbol of the token", undefined, types.string, false)
  .setAction(async ({ name, symbol }, hre) => {
    // Deploy contract
    const TestERC20 = (await hre.ethers.getContractFactory(
      "TestERC20"
    )) as TestERC20__factory;
    const testErc20 = await TestERC20.deploy(name, symbol);
    await testErc20.deployed();

    // Print details and return
    console.log(`
    Test ERC20 token contract deployed!
    Name: ${name}
    Symbol: $${symbol}
    Address: ${testErc20.address}
    `);
    return testErc20;
  });
