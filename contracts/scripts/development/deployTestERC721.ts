import { ERC721TestToken__factory } from "../../../typechain-types";
import { defineDeployer } from "../helper";
import { ethers } from "hardhat";

async function main() {
  let deployerPK = await defineDeployer();
  const deployer = new ethers.Wallet(deployerPK, ethers.provider);

  console.log("Deploying contract with account:", deployer.address);
  const testTokenFactory = (await ethers.getContractFactory(
    "ERC721TestToken"
  )) as ERC721TestToken__factory;
  const testToken = await testTokenFactory.connect(deployer).deploy();
  const contract = await testToken.deployed();
  console.log(
    "Successfully deployed Test ERC721 Token contract at",
    contract.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
