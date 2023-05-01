import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import "@openzeppelin/hardhat-upgrades";
import { task } from "hardhat/config";
import { NFTYLending__factory } from "../../typechain-types";
import { readFile, writeFile } from "fs/promises";
import { Contract } from "ethers";

// Task to deploy NFTYLending contract with its dependencies
task(
  "deploy",
  "Deploy NFTYLending contract with all its dependencies"
).setAction(async (_, hre) => {
  // Deploy ERC20s
  const nftyToken: Contract = await hre.run("deploy-token", {
    name: "NFTY Token",
    symbol: "NFTY",
  });
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

  // Deploy Oracle and NFTYNotes
  const oracle: Contract = await hre.run("deploy-oracle");
  const promissoryNote: Contract = await hre.run("deploy-nfty-notes", {
    name: "NFTY Finance Promissory Note",
    symbol: "LEND",
    baseuri: "https://api.nfty.finance/metadata/LEND/",
  });
  const obligationReceipt: Contract = await hre.run("deploy-nfty-notes", {
    name: "NFTY Finance Obligation Receipt",
    symbol: "BORROW",
    baseuri: "https://api.nfty.finance/metadata/BORROW/",
  });

  // Deploy NFTYLending
  const NFTYLending = (await hre.ethers.getContractFactory(
    "NFTYLending"
  )) as NFTYLending__factory;
  const nftyLending = await hre.upgrades.deployProxy(NFTYLending, [
    [
      {
        addr: usdc.address,
        minBasket: hre.ethers.utils.parseUnits("10", 18),
        minPayment: hre.ethers.utils.parseUnits("1", 18),
      },
      {
        addr: dai.address,
        minBasket: hre.ethers.utils.parseUnits("10", 18),
        minPayment: hre.ethers.utils.parseUnits("1", 18),
      },
    ],
    [
      {
        addr: doodles.address,
        img: "https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztls02RlWQ",
      },
      {
        addr: punks.address,
        img: "https://i.seadn.io/gcs/files/498c0d117d7f1c95993804b7712721c7.png",
      },
    ],
    promissoryNote.address,
    obligationReceipt.address,
    nftyToken.address,
    oracle.address,
  ]);
  await nftyLending.deployed();

  // Set noteAdmin for the nftyNotes contracts
  await hre.run("set-note-admin", {
    admin: nftyLending.address,
    notes: promissoryNote.address,
  });
  await hre.run("set-note-admin", {
    admin: nftyLending.address,
    notes: obligationReceipt.address,
  });

  // Set Oracle prices for the tokens
  await hre.run("set-oracle-price", {
    symbol: "NFTY",
    addr: nftyLending.address,
    price: 0.1,
  });
  await hre.run("set-oracle-price", {
    symbol: "USDC",
    addr: nftyLending.address,
    price: 1,
  });
  await hre.run("set-oracle-price", {
    symbol: "DAI",
    addr: nftyLending.address,
    price: 1,
  });

  // Write addresses to deployments.json
  const deployments = {
    nftyLending: {
      address: nftyLending.address,
      startBlock: nftyLending.deployTransaction.blockNumber,
    },
    promissoryNote: {
      address: promissoryNote.address,
      startBlock: promissoryNote.deployTransaction.blockNumber,
    },
    obligationReceipt: {
      address: obligationReceipt.address,
      startBlock: obligationReceipt.deployTransaction.blockNumber,
    },
    oracle: {
      address: oracle.address,
      startBlock: oracle.deployTransaction.blockNumber,
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
    nftyToken: {
      address: nftyToken.address,
      startBlock: nftyToken.deployTransaction.blockNumber,
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
    NFTYLending: deployments.nftyLending,
    PromissoryNote: deployments.promissoryNote,
    ObligationReceipt: deployments.obligationReceipt,
    Doodles: deployments.doodles,
    PolygonPunks: deployments.punks,
  };
  await writeFile(
    "../subgraph/networks.json",
    JSON.stringify(networks, undefined, 2)
  );

  console.log("NFTYLending deployed @", nftyLending.address);
});
