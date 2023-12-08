import { task } from "hardhat/config";
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

  // Mint 10,000 ERC20s to deployer
  await usdc.mint(hre.ethers.parseEther("10000"));
  await dai.mint(hre.ethers.parseEther("10000"));

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

  // Mint 10 NFTs to deployer
  await doodles.mint(10);
  await punks.mint(10);

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

  const platformWallet = hre.ethers.Wallet.createRandom().address;

  // Deploy NFTYFinance
  const [owner] = await hre.ethers.getSigners();

  const NFTYFinanceV1 = await hre.ethers.getContractFactory("NFTYFinanceV1");
  const nftyFinance = await NFTYFinanceV1.deploy(
    promissoryNotes.target,
    obligationNotes.target,
    lendingKeys.target,
    200,
    platformWallet,
    owner.address
  );
  await nftyFinance.waitForDeployment();

  // Set NFTYFinance address in NFTYERC721s
  await promissoryNotes.setNftyFinance(nftyFinance.target);
  await obligationNotes.setNftyFinance(nftyFinance.target);
  await lendingKeys.setNftyFinance(nftyFinance.target);

  // Write addresses to deployments.json
  const deployments = {
    nftyFinance: {
      address: nftyFinance.target,
      startBlock: nftyFinance.deploymentTransaction()?.blockNumber,
    },
    promissoryNotes: {
      address: promissoryNotes.target,
      startBlock: promissoryNotes.deploymentTransaction()?.blockNumber,
    },
    obligationNotes: {
      address: obligationNotes.target,
      startBlock: obligationNotes.deploymentTransaction()?.blockNumber,
    },
    lendingKeys: {
      address: lendingKeys.target,
      startBlock: lendingKeys.deploymentTransaction()?.blockNumber,
    },
    punks: {
      address: punks.target,
      startBlock: punks.deploymentTransaction()?.blockNumber,
    },
    doodles: {
      address: doodles.target,
      startBlock: doodles.deploymentTransaction()?.blockNumber,
    },
    usdc: {
      address: usdc.target,
      startBlock: usdc.deploymentTransaction()?.blockNumber,
    },
    dai: {
      address: dai.target,
      startBlock: dai.deploymentTransaction()?.blockNumber,
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

  console.log("NFTYFinance deployed @", nftyFinance.target);
  console.log("Platform wallet:", platformWallet);
});
