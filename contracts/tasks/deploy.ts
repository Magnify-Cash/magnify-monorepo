import { task } from "hardhat/config";
import { NFTYFinanceV1__factory } from "../../typechain-types";
import { readFile, writeFile } from "fs/promises";
import { Contract } from "ethers";

// Task to deploy NFTYLending contract with its dependencies
task(
  "deploy",
  "Deploy NFTYLending contract with all its dependencies"
).setAction(async (_, hre) => {
  // Deploy ERC20s
  const usdc: Contract = await hre.run("deploy-token", {
    name: "USD Coin",
    symbol: "USDC",
  });
  const dai: Contract = await hre.run("deploy-token", {
    name: "Dai Stablecoin",
    symbol: "DAI",
  });

  // Deploy NFT Collections
  const doodles: Contract = await hre.run("deploy-nft-collection", {
    name: "Doodles",
    symbol: "DOODLE",
    baseuri: "ipfs://QmPMc4tcBsMqLRuCQtPmPe84bpSjrC3Ky7t3JWuHXYB4aS/",
  });
  const punks: Contract = await hre.run("deploy-nft-collection", {
    name: "PolygonPunks",
    symbol: "ρ",
    baseuri: "https://api.polygonpunks.io/metadata/",
  });

  // Deploy NFTYFinance's dependencies
  const promissoryNotes: Contract = await hre.run("deploy-nfty-erc721", {
    name: "NFTY Finance Promissory Notes",
    symbol: "LEND",
    baseuri: "https://api.nfty.finance/metadata/LEND/",
  });
  const obligationNotes: Contract = await hre.run("deploy-nfty-erc721", {
    name: "NFTY Finance Obligation Notes",
    symbol: "BORROW",
    baseuri: "https://api.nfty.finance/metadata/BORROW/",
  });
  const lendingKeys: Contract = await hre.run("deploy-nfty-erc721", {
    name: "NFTY Finance Lending Keys",
    symbol: "KEYS",
    baseuri: "https://api.nfty.finance/metadata/KEYS/",
  });

  // Deploy NFTYFinance
  const NFTYFinanceV1 = (await hre.ethers.getContractFactory(
    "NFTYFinanceV1"
  )) as NFTYFinanceV1__factory;
  const nftyFinance = await NFTYFinanceV1.deploy(
    promissoryNotes.address,
    obligationNotes.address,
    lendingKeys.address,
    200
  );
  await nftyFinance.deployed();

  // Set NFTYFinance address in NFTYERC721s
  await promissoryNotes.setNftyFinance(nftyFinance.address);
  await obligationNotes.setNftyFinance(nftyFinance.address);
  await lendingKeys.setNftyFinance(nftyFinance.address);

  // Write addresses to deployments.json
  const deployments = {
    nftyFinance: {
      address: nftyFinance.address,
      startBlock: nftyFinance.deployTransaction.blockNumber,
    },
    promissoryNotes: {
      address: promissoryNotes.address,
      startBlock: promissoryNotes.deployTransaction.blockNumber,
    },
    obligationNotes: {
      address: obligationNotes.address,
      startBlock: obligationNotes.deployTransaction.blockNumber,
    },
    lendingKeys: {
      address: lendingKeys.address,
      startBlock: lendingKeys.deployTransaction.blockNumber,
    },
    punks: {
      address: punks.address,
      startBlock: punks.deployTransaction.blockNumber,
    },
    doodles: {
      address: doodles.address,
      startBlock: doodles.deployTransaction.blockNumber,
    },
    usdc: {
      address: usdc.address,
      startBlock: usdc.deployTransaction.blockNumber,
    },
    dai: {
      address: dai.address,
      startBlock: dai.deployTransaction.blockNumber,
    },
  };
  await writeFile(
    "../deployments.json",
    JSON.stringify(deployments, undefined, 2),
    "utf8"
  );

  // Edit networks.json in subgraph repo
  const networksFile = await readFile("../subgraph/networks.json", "utf8");
  const networks = JSON.parse(networksFile);
  networks["mainnet"] = {
    NFTYFinance: deployments.nftyFinance,
    PromissoryNotes: deployments.promissoryNotes,
    ObligationNotes: deployments.obligationNotes,
    LendingKeys: deployments.lendingKeys,
  };
  await writeFile(
    "../subgraph/networks.json",
    JSON.stringify(networks, undefined, 2)
  );

  console.log("NFTYFinance deployed @", nftyFinance.address);
});
