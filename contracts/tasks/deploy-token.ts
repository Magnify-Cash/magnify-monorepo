import { TestERC20 } from "contracts/typechain-types";
import { ContractTransactionResponse } from "ethers";
import { task, types } from "hardhat/config";

type TaskResult = TestERC20 & {
  deploymentTransaction(): ContractTransactionResponse;
};

// Task to deploy test ERC20 token
task<TaskResult>("deploy-token", "Deploys a test ERC20 token contract")
  .addParam("name", "Name of the token", undefined, types.string, false)
  .addParam("symbol", "Symbol of the token", undefined, types.string, false)
  .setAction(async ({ name, symbol }, hre) => {
    // Deploy contract
    const TestERC20 = await hre.ethers.getContractFactory("TestERC20");
    const testErc20 = await TestERC20.deploy(name, symbol);
    await testErc20.waitForDeployment();

    // Print details and return
    console.log(`
    Test ERC20 token contract deployed!
    Name: ${name}
    Symbol: $${symbol}
    Address: ${testErc20.target}
    `);
    return testErc20;
  });
