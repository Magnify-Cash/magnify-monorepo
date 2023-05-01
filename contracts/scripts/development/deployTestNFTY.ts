import {
  NFTYLending__factory,
  NFTYNotes__factory,
  ERC20TestToken__factory,
  ERC721TestToken__factory,
  ERC721TestToken,
} from "../../../typechain-types";
import { INFTYLending } from "../../../typechain-types/contracts/loans/NFTYLending";
import { defineDeployer } from "../helper";
import {
  MINIMUM_BASKET_SIZE,
  MINIMUM_PAYMENT_AMOUNT,
  PROMISSORY_NOTE,
  OBLIGATION_RECEIPT,
  TOKEN_NAME,
  TOKEN_SYMBOL,
  TOKEN_SUPPLY,
} from "./defaults";
import { Wallet } from "ethers";
import { ethers, upgrades } from "hardhat";

/** BaseURI for metadata testing, the first one works with ipfs, the second one is just a json and the third one a mix between json and ipfs */
const NFT_BASE_URIs = [
  "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/",
  "https://my-json-server.typicode.com/abcoathup/samplenft/tokens/",
  "https://ipfs.io/ipfs/QmdtARLUPQeqXrVcNzQuRqr9UCFoFvn76X9cdTczt4vqfw/",
];

const NFT_IMAGES = [
  "https://ik.imagekit.io/bayc/assets/bayc-footer.png",
  "https://img.seadn.io/files/ee29834c76764b35886807884a2f4ff8.png",
  "https://pbs.twimg.com/profile_images/1514324107881431045/vsF28_QV_400x400.jpg",
];

async function deployPromissoryAndObligationNote(deployer: Wallet) {
  const nftyNotesFactory = (await ethers.getContractFactory(
    "NFTYNotes"
  )) as NFTYNotes__factory;
  const obligationNFTYNotes = await nftyNotesFactory
    .connect(deployer)
    .deploy(
      OBLIGATION_RECEIPT.name,
      OBLIGATION_RECEIPT.symbol,
      OBLIGATION_RECEIPT.baseUri
    );
  const obligationReceipt = await obligationNFTYNotes.deployed();
  console.log(
    "Successfully deployed Obligation receipt contract at",
    obligationReceipt.address
  );

  const promissoryNFTYNotes = await nftyNotesFactory
    .connect(deployer)
    .deploy(
      PROMISSORY_NOTE.name,
      PROMISSORY_NOTE.symbol,
      PROMISSORY_NOTE.baseUri
    );
  const promissoryNote = await promissoryNFTYNotes.deployed();
  console.log(
    "Successfully deployed Promissory note contract at",
    promissoryNote.address
  );

  return { promissoryNote, obligationReceipt };
}

async function deployERC20AndNftyToken(deployer: Wallet) {
  const testTokenFactory = (await ethers.getContractFactory(
    "ERC20TestToken"
  )) as ERC20TestToken__factory;
  const erc20 = await testTokenFactory
    .connect(deployer)
    .deploy(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_SUPPLY);
  const erc20Contract = await erc20.deployed();

  console.log(
    "Successfully deployed Test ERC20 Token contract at",
    erc20Contract.address
  );

  const nftyToken = await testTokenFactory
    .connect(deployer)
    .deploy("NFTY Token", "NFTY", TOKEN_SUPPLY);
  const nftyTokenContract = await nftyToken.deployed();
  console.log(
    "Successfully deployed Nfty Token contract at",
    nftyTokenContract.address
  );

  return { erc20Contract, nftyTokenContract };
}

async function deployErc721(deployer: Wallet) {
  const erc721Factory = (await ethers.getContractFactory(
    "ERC721TestToken"
  )) as ERC721TestToken__factory;
  const erc721Contracts: ERC721TestToken[] = [];

  for (const baseuri of NFT_BASE_URIs) {
    const erc721 = await erc721Factory.connect(deployer).deploy();
    const erc721Contract = await erc721.deployed();
    await erc721Contract.setBaseURI(baseuri);
    console.log(
      "Successfully deployed Test ERC721 Token contract at",
      erc721Contract.address
    );
    erc721Contracts.push(erc721Contract);
  }

  return { erc721Contracts };
}

async function deployOracle(deployer: Wallet) {
  const diaOracleFactory = await ethers.getContractFactory("DIAOracleV2");
  const diaOracle = await diaOracleFactory.connect(deployer).deploy();
  await diaOracle.deployed();
  console.log("Successfully deployed Oracle contract at", diaOracle.address);
  return diaOracle;
}

async function main() {
  let deployerPK = await defineDeployer();
  const deployer = new ethers.Wallet(deployerPK, ethers.provider);
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const { promissoryNote, obligationReceipt } =
    await deployPromissoryAndObligationNote(deployer);
  const { erc20Contract, nftyTokenContract } = await deployERC20AndNftyToken(
    deployer
  );
  const { erc721Contracts } = await deployErc721(deployer);
  const erc721s: INFTYLending.WhitelistedNftStruct[] = [];
  erc721Contracts.forEach((erc721, index) => {
    erc721s.push({ addr: erc721.address, img: NFT_IMAGES[index] });
  });

  const oracle = await deployOracle(deployer);

  const NFTYLendingFactory = (await ethers.getContractFactory(
    "NFTYLending"
  )) as NFTYLending__factory;
  const NFTYLending = await upgrades.deployProxy(
    NFTYLendingFactory.connect(deployer),
    [
      [
        {
          addr: erc20Contract.address,
          minBasket: MINIMUM_BASKET_SIZE,
          minPayment: MINIMUM_PAYMENT_AMOUNT,
        },
      ],
      erc721s,
      promissoryNote.address,
      obligationReceipt.address,
      nftyTokenContract.address,
      oracle.address,
    ]
  );
  //Set loan coordinator for both promissory note and obligation receipt
  await promissoryNote.setNoteAdmin(NFTYLending.address);
  await obligationReceipt.setNoteAdmin(NFTYLending.address);

  const contract = await NFTYLending.deployed();
  console.log("Successfully deployed NFTYLending contract");
  console.log(" Proxy contract address:", contract.address);
  console.log(
    " Proxy Admin contract address:",
    await upgrades.erc1967.getAdminAddress(contract.address)
  );
  console.log(
    " Implementation contract address:",
    await upgrades.erc1967.getImplementationAddress(contract.address)
  );
  console.log(" Deployer (owner) account:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
