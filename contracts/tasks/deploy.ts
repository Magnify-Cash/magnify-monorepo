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
  const unlisted: Contract = await hre.run("deploy-token", {
    name: "UNLISTED Stablecoin",
    symbol: "UNLISTED",
  });

  // Mint 10,000 ERC20s to deployer
  await usdc.mint(hre.ethers.parseEther("10000"));
  await dai.mint(hre.ethers.parseEther("10000"));
  await unlisted.mint(hre.ethers.parseEther("10000"));

  // Deploy NFT Collections
  const doodles: Contract = await hre.run("deploy-nft-collection", {
    name: "Doodles",
    symbol: "DOODLE",
    baseuri: "ipfs://QmPMc4tcBsMqLRuCQtPmPe84bpSjrC3Ky7t3JWuHXYB4aS/",
  });
  const punks: Contract = await hre.run("deploy-nft-collection", {
    name: "CryptoPunks",
    symbol: "PUNK",
    baseuri: "https://api.polygonpunks.io/metadata/",
  });
  const unlistedpunks: Contract = await hre.run("deploy-nft-collection", {
    name: "UnlistedPunks",
    symbol: "ρ",
    baseuri: "https://api.polygonpunks.io/metadata/",
  });

  // Mint 10 NFTs to deployer
  await doodles.mint(10);
  await punks.mint(10);
  await unlistedpunks.mint(10);

  // Deploy NFTYFinance's dependencies
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
    obligationNotes.target,
    lendingKeys.target,
    200,
    platformWallet,
    owner.address
  );
  await nftyFinance.waitForDeployment();

  // Set NFTYFinance address in NFTYERC721s
  await obligationNotes.setNftyFinance(nftyFinance.target);
  await lendingKeys.setNftyFinance(nftyFinance.target);

  // Wait for transactions to be mined so that we can get the block numbers
  const nftyFinanceTx = await nftyFinance.deploymentTransaction()?.wait();
  const obligationNotesTx = await obligationNotes
    .deploymentTransaction()
    ?.wait();
  const lendingKeysTx = await lendingKeys.deploymentTransaction()?.wait();
  const doodlesTx = await doodles.deploymentTransaction()?.wait();
  const punksTx = await punks.deploymentTransaction()?.wait();
  const usdcTx = await usdc.deploymentTransaction()?.wait();
  const daiTx = await dai.deploymentTransaction()?.wait();
  const unlistedTx = await unlisted.deploymentTransaction()?.wait();
  const unlistedpunksTx = await punks.deploymentTransaction()?.wait();

  // Write addresses to deployments.json
  const deployments = {
    nftyFinance: {
      address: nftyFinance.target,
      startBlock: nftyFinanceTx?.blockNumber,
    },
    obligationNotes: {
      address: obligationNotes.target,
      startBlock: obligationNotesTx?.blockNumber,
    },
    lendingKeys: {
      address: lendingKeys.target,
      startBlock: lendingKeysTx?.blockNumber,
    },
    punks: {
      address: punks.target,
      startBlock: punksTx?.blockNumber,
    },
    doodles: {
      address: doodles.target,
      startBlock: doodlesTx?.blockNumber,
    },
    usdc: {
      address: usdc.target,
      startBlock: usdcTx?.blockNumber,
    },
    dai: {
      address: dai.target,
      startBlock: daiTx?.blockNumber,
    },
  };
  await writeFile(
    "../deployments.json",
    JSON.stringify(deployments, undefined, 2),
    "utf8"
  );

  // Write token addresses to dapp-v1/public/tokenlists
  const tokenListFile = await readFile("../dapp-v1/public/tokenlists/tokens.json", "utf8");
  const tokenList = JSON.parse(tokenListFile);
  const nftListFile = await readFile("../dapp-v1/public/tokenlists/nfts.json", "utf8");
  const nftList = JSON.parse(nftListFile);

  const usdcItem = tokenList["tokens"].find((token) => token.symbol === "USDC");
  usdcItem.address = usdc.target;
  const daiItem = tokenList["tokens"].find((token) => token.symbol === "DAI");
  daiItem.address = dai.target;
  const punksItem = nftList["nfts"].find((token) => token.symbol === "PUNK");
  punksItem.address = punks.target;
  const doodlesItem = nftList["nfts"].find((token) => token.symbol === "DOODLE");
  doodlesItem.address = doodles.target;

  await writeFile(
    "../dapp-v1/public/tokenlists/tokens.json",
    JSON.stringify(tokenList, undefined, 2)
  );
  await writeFile(
    "../dapp-v1/public/tokenlists/nfts.json",
    JSON.stringify(nftList, undefined, 2)
  );


  // Edit networks.json in subgraph repo
  const networksFile = await readFile("../subgraph/networks.json", "utf8");
  const networks = JSON.parse(networksFile);
  networks["mainnet"] = {
    NFTYFinance: deployments.nftyFinance,
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
