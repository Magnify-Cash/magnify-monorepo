import { ethers } from "hardhat";
import {
  NFTYERC721V1__factory,
  NFTYFinanceV1,
  NFTYFinanceV1__factory,
  NFTYLendingKeysV1__factory,
  NFTYObligationNotesV1__factory,
  NFTYPromissoryNotesV1__factory,
  TestERC1155__factory,
  TestERC20__factory,
  TestERC721__factory,
} from "../../../typechain-types";
import { LoanConfig } from "./consts";
import { BigNumber } from "ethers";

export const deployNftyFinance = async () => {
  // Promissory Notes
  const PromissoryNotes = (await ethers.getContractFactory(
    "NFTYPromissoryNotesV1"
  )) as NFTYPromissoryNotesV1__factory;
  const promissoryNotes = await PromissoryNotes.deploy(
    "NFTY Promissory Notes",
    "LEND",
    "https://metadata.nfty.finance/LEND/"
  );
  await promissoryNotes.deployed();

  // Obligation Notes
  const ObligationNotes = (await ethers.getContractFactory(
    "NFTYObligationNotesV1"
  )) as NFTYObligationNotesV1__factory;
  const obligationNotes = await ObligationNotes.deploy(
    "NFTY Obligation Notes",
    "BORROW",
    "https://metadata.nfty.finance/BORROW/"
  );
  await obligationNotes.deployed();

  // Lending Keys
  const LendingKeys = (await ethers.getContractFactory(
    "NFTYLendingKeysV1"
  )) as NFTYLendingKeysV1__factory;
  const lendingKeys = await LendingKeys.deploy(
    "NFTY Lending Keys",
    "KEYS",
    "https://metadata.nfty.finance/KEYS/"
  );
  await lendingKeys.deployed();

  const NFTYFinance = (await ethers.getContractFactory(
    "NFTYFinanceV1"
  )) as NFTYFinanceV1__factory;

  const loanOriginationFee = 200;

  const nftyFinance = (await NFTYFinance.deploy(
    promissoryNotes.address,
    obligationNotes.address,
    lendingKeys.address,
    loanOriginationFee
  )) as NFTYFinanceV1;
  await nftyFinance.deployed();

  // Configuration
  await promissoryNotes.setNftyFinance(nftyFinance.address);
  await obligationNotes.setNftyFinance(nftyFinance.address);
  await lendingKeys.setNftyFinance(nftyFinance.address);

  const [owner, alice] = await ethers.getSigners();

  return {
    nftyFinance,
    promissoryNotes,
    obligationNotes,
    lendingKeys,
    loanOriginationFee,
    owner,
    alice,
  };
};

export const deployTestTokens = async () => {
  const TestERC20 = (await ethers.getContractFactory(
    "TestERC20"
  )) as TestERC20__factory;
  const erc20 = await TestERC20.deploy("USD Coin", "USDC");
  await erc20.deployed();

  const TestERC721 = (await ethers.getContractFactory(
    "TestERC721"
  )) as TestERC721__factory;
  const erc721 = await TestERC721.deploy(
    "Doodles",
    "DOODLE",
    "ipfs://QmPMc4tcBsMqLRuCQtPmPe84bpSjrC3Ky7t3JWuHXYB4aS/"
  );
  await erc721.deployed();

  const TestERC1155 = (await ethers.getContractFactory(
    "TestERC1155"
  )) as TestERC1155__factory;
  const erc1155 = await TestERC1155.deploy(
    "https://api.polygonpunks.io/metadata/"
  );
  await erc1155.deployed();

  return { erc20, erc721, erc1155 };
};

export const deployNftyFinanceWithTestTokens = async () => {
  const {
    nftyFinance,
    promissoryNotes,
    obligationNotes,
    lendingKeys,
    loanOriginationFee,
    alice,
  } = await deployNftyFinance();

  const { erc20, erc721, erc1155 } = await deployTestTokens();

  return {
    nftyFinance,
    promissoryNotes,
    obligationNotes,
    lendingKeys,
    loanOriginationFee,
    erc20,
    erc721,
    erc1155,
    alice,
  };
};

export const initializeLendingDesk = async () => {
  const {
    nftyFinance,
    promissoryNotes,
    obligationNotes,
    erc20,
    erc721,
    erc1155,
    lendingKeys,
  } = await deployNftyFinanceWithTestTokens();

  const [owner, lender, borrower, alice] = await ethers.getSigners();

  const initialBalance = BigInt(1000 * 10 ** 18);

  // Get ERC20 and approve
  await erc20.connect(lender).mint(initialBalance);
  await erc20.connect(lender).approve(nftyFinance.address, initialBalance);

  // Create liquidity shop
  const tx = await nftyFinance
    .connect(lender)
    .initializeNewLendingDesk(erc20.address, initialBalance, []);

  // Get liquidity shop from event
  const { events } = await tx.wait();
  const event = events?.find(
    (event) => event.event == "NewLendingDeskInitialized"
  )?.args;
  const lendingDeskId = event?.lendingDeskId;
  const lendingDesk = await nftyFinance.lendingDesks(lendingDeskId);

  return {
    owner,
    lender,
    alice,
    borrower,
    nftyFinance,
    promissoryNotes,
    obligationNotes,
    erc20,
    erc721,
    erc1155,
    lendingDesk,
    lendingDeskId,
    lendingKeys,
    initialBalance,
  };
};

export const initializeLendingDeskAndAddLoanConfig = async () => {
  const { nftyFinance, lender, lendingDeskId, erc721, ...rest } =
    await initializeLendingDesk();

  const loanConfig: LoanConfig = {
    nftCollection: erc721.address,
    nftCollectionIsErc1155: false,
    minAmount: ethers.utils.parseUnits("10", 18),
    maxAmount: ethers.utils.parseUnits("100", 18),
    minDuration: BigNumber.from(24),
    maxDuration: BigNumber.from(240),
    minInterest: BigNumber.from(200),
    maxInterest: BigNumber.from(1500),
  };

  await nftyFinance
    .connect(lender)
    .setLendingDeskLoanConfigs(lendingDeskId, [loanConfig]);
  return { nftyFinance, lender, lendingDeskId, loanConfig, erc721, ...rest };
};

export const initializeLoan = async () => {
  const loanDuration = 30;
  const loanAmount = ethers.utils.parseUnits("20", 18);
  const nftId = 0;

  const { borrower, erc20, erc721, nftyFinance, lendingDeskId, ...rest } =
    await initializeLendingDeskAndAddLoanConfig();

  // Give borrower some ERC20 and NFTs
  await erc20.connect(borrower).mint(10000);
  await erc721.connect(borrower).mint(1);

  // Approve NFTYLending to transfer tokens
  await erc20.connect(borrower).approve(nftyFinance.address, 10000);
  await erc721.connect(borrower).approve(nftyFinance.address, nftId);

  const tx = await nftyFinance
    .connect(borrower)
    .initializeNewLoan(
      lendingDeskId,
      erc721.address,
      nftId,
      loanDuration,
      loanAmount
    );

  // Get details from event
  const { events } = await tx.wait();
  const event = events?.find(
    (event) => event.event == "NewLoanInitialized"
  )?.args;
  const loanId = event?.loanId;
  const interest = event?.interest;
  const platformFee = event?.platformFee;

  // Get loan
  const loan = await nftyFinance.loans(loanId);

  return {
    borrower,
    erc20,
    erc721,
    nftyFinance,
    lendingDeskId,
    nftId,
    loanDuration,
    loanAmount,
    interest,
    platformFee,
    loan,
    loanId,
    ...rest,
  };
};

export const calculateRepaymentAmount = async (
  loanStartTime: number,
  loanAmount: BigNumber,
  interest: number
) => {
  const secondsInYear = 31536000;
  const secondsInHour = 3600;
  const secondsSinceLoanStart = Math.floor(Date.now() / 1000) - loanStartTime;

  const totalAmountDue = loanAmount.add(
    loanAmount
      .mul(interest)
      .mul(secondsSinceLoanStart)
      .div(secondsInYear * secondsInHour * 10000)
  );

  return totalAmountDue;
};

export const deployNftyErc721 = async () => {
  const name = "NFTY ERC721";
  const symbol = "NFTY";
  const baseUri = "https://metadata.nfty-erc721.local";

  const [owner, alice, nftyFinance] = await ethers.getSigners();

  const NFTYERC721V1 = (await ethers.getContractFactory(
    "NFTYERC721V1"
  )) as NFTYERC721V1__factory;
  const nftyErc721 = await NFTYERC721V1.deploy(name, symbol, baseUri);
  await nftyErc721.deployed();

  return {
    name,
    symbol,
    baseUri,
    nftyErc721,
    owner,
    alice,
    nftyFinance,
  };
};

export const deployNftyErc721AndSetNftyFinance = async () => {
  const { nftyErc721, owner, nftyFinance, ...rest } = await deployNftyErc721();

  await nftyErc721.connect(owner).setNftyFinance(nftyFinance.address);

  return {
    nftyErc721,
    owner,
    nftyFinance,
    ...rest,
  };
};

export const deployNftyErc721AndMint = async () => {
  const { nftyErc721, alice, nftyFinance, ...rest } =
    await deployNftyErc721AndSetNftyFinance();

  const tokenId = 1;
  await nftyErc721.connect(nftyFinance).mint(alice.address, tokenId);

  return { nftyErc721, alice, nftyFinance, tokenId, ...rest };
};
