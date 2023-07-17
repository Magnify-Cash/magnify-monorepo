import { ethers } from "hardhat";
import {
  NFTYFinanceV1,
  NFTYFinanceV1__factory,
  NFTYLendingKeysV1__factory,
  NFTYObligationNotesV1__factory,
  NFTYPromissoryNotesV1__factory,
  TestERC1155__factory,
  TestERC20__factory,
  TestERC721__factory,
} from "../../../typechain-types";

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

export const createLoan = async () => {
  const {
    borrower,
    erc20,
    erc721,
    nftyToken,
    nftyLending,
    liquidityShopId,
    ...rest
  } = await createLiquidityShop();

  const nftId = 0;
  const loanDuration = 30;
  const loanAmount = 1000;

  // Give borrower some NFTY, ERC20, and NFTs
  await erc20.connect(borrower).mint(10000);
  await nftyToken.connect(borrower).mint(10000);
  await erc721.connect(borrower).mint(1);

  // Approve NFTYLending to transfer tokens
  await erc20.connect(borrower).approve(nftyLending.address, 10000);
  await nftyToken.connect(borrower).approve(nftyLending.address, 10000);
  await erc721.connect(borrower).approve(nftyLending.address, nftId);

  const tx = await nftyLending.connect(borrower).createLoan({
    shopId: liquidityShopId,
    nftCollateralId: nftId,
    loanDuration,
    amount: loanAmount,
  });

  // Get loan from event
  const { events } = await tx.wait();
  const event = events?.find((event) => event.event == "OfferAccepted")?.args;
  const loanId = event?.loanId;
  const nftyNotesId = event?.nftyNotesId;
  const loan = await nftyLending.loans(loanId);

  return {
    borrower,
    erc20,
    erc721,
    nftyToken,
    nftyLending,
    liquidityShopId,
    loan,
    loanId,
    nftyNotesId,
    ...rest,
  };
};
