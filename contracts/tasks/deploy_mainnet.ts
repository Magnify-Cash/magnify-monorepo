import { task } from "hardhat/config";
import { readFile, writeFile } from "fs/promises";
import { Contract } from "ethers";
import "dotenv/config";
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig({ path: "../.env" });

// Task to deploy Magnify Cash contract with its dependencies
task(
  "deploy_mainnet",
  "Deploy Magnify Cash contract with all its dependencies"
).setAction(async (_, hre) => {
  var platformWallet = process.env.PLATFORM_WALLET;
  var obligationURI = process.env.OBLIGATION_URI;
  var keysURI = process.env.KEYS_URI;
  var contractOwner = process.env.CONTRACT_OWNER;
  var lof = parseInt(process.env.LOF || "0");
  if (platformWallet === "" || obligationURI === "" || keysURI === "" || lof === 0 || contractOwner == "") {
    console.log("Platform Wallet:", platformWallet)
    console.log("Obligation Notes URI:", obligationURI)
    console.log("Lending Keys URI:", keysURI)
    console.log("Loan Origination Fee (BPS):", lof)
    console.log("Contract Owner:", contractOwner)
    console.log("Cannot continue. Missing one of the above")
    return
  }
  console.log("INIT MagnifyCash")


  console.log("Step 1: Deploying MagnifyCash dependenices...");
  const obligationNotes: Contract = await hre.run("deploy-magnify-erc721", {
    name: "Magnify Cash Obligation Notes",
    symbol: "BORROW",
    baseuri: obligationURI,
  });
  const lendingKeys: Contract = await hre.run("deploy-magnify-erc721", {
    name: "Magnify Cash Lending Keys",
    symbol: "KEYS",
    baseuri: keysURI,
  });

  // Deploy MagnifyCash
  console.log("Step 2: Deploying MagnifyCash Protocol...");
  const [owner] = await hre.ethers.getSigners();
  const MagnifyCashV1 = await hre.ethers.getContractFactory("MagnifyCashV1");
  const magnifyCash = await MagnifyCashV1.deploy(
    obligationNotes.target,
    lendingKeys.target,
    lof,
    platformWallet!,
    owner.address
  );
  await magnifyCash.waitForDeployment();

  console.log("Step 3: Configure MagnifyCash Protocol")
  // Set MagnifyCash address in MagnifyERC721s
  await obligationNotes.setMagnifyCash(magnifyCash.target);
  await lendingKeys.setMagnifyCash(magnifyCash.target);
  // Wait for transactions to be mined so that we can get the block numbers
  const magnifyCashTx = await magnifyCash.deploymentTransaction()?.wait();
  const obligationNotesTx = await obligationNotes
    .deploymentTransaction()
    ?.wait();
  const lendingKeysTx = await lendingKeys.deploymentTransaction()?.wait();

  // Write addresses to deployments.json
  console.log("Step 4: Write deployment info to deployments.json")
  const deployments = {
    magnifyCash: {
      address: magnifyCash.target,
      startBlock: magnifyCashTx?.blockNumber,
    },
    obligationNotes: {
      address: obligationNotes.target,
      startBlock: obligationNotesTx?.blockNumber,
    },
    lendingKeys: {
      address: lendingKeys.target,
      startBlock: lendingKeysTx?.blockNumber,
    },
  };
  await writeFile(
    "../deployments.json",
    JSON.stringify(deployments, undefined, 2),
    "utf8"
  );

  console.log("Step 5: Transfer ownership")
  await magnifyCash.transferOwnership(contractOwner!)
  await lendingKeys.transferOwnership(contractOwner)
  await obligationNotes.transferOwnership(contractOwner)

  console.log(`${"-".repeat(100)}`)
  console.log("FINISH MagnifyCash")
  console.log("MagnifyCash Protocol deployed @", magnifyCash.target);
  console.log("MagnifyCash Lending Keys deployed @", lendingKeys.target);
  console.log("MagnifyCash Obligation Notes deployed @", obligationNotes.target);
  console.log(`${"-".repeat(100)}`)
  console.log("Platform wallet @", platformWallet);
  console.log("MagnifyCash Owner", await magnifyCash.owner());
  console.log("MagnifyCash Lending Keys Owner", await lendingKeys.owner());
  console.log("MagnifyCash Obligation Notes Owner", await obligationNotes.owner());
});
