import { ethers, upgrades } from "hardhat";
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
  } = await deployNftyLending();

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

export const createLiquidityShop = async () => {
  const {
    nftyLending,
    promissoryNote,
    obligationReceipt,
    nftyToken,
    diaOracle,
    erc20,
    erc721,
  } = await deployNftyLendingWithTestTokens();

  const [owner, lender, borrower, alice] = await ethers.getSigners();

  const liquidityAmount = 10000;
  const name = "My Shop";
  const interestA = 10;
  const interestB = 20;
  const interestC = 30;
  const maxOffer = 1000;

  // Get ERC20 and approve
  await erc20.connect(lender).mint(liquidityAmount);
  await erc20.connect(lender).approve(nftyLending.address, liquidityAmount);

  // Create liquidity shop
  const tx = await nftyLending
    .connect(lender)
    .createLiquidityShop(
      name,
      erc20.address,
      erc721.address,
      false,
      liquidityAmount,
      interestA,
      interestB,
      interestC,
      maxOffer,
      true
    );

  // Get liquidity shop from event
  const { events } = await tx.wait();
  const event = events?.find(
    (event) => event.event == "LiquidityShopCreated"
  )?.args;
  const liquidityShopId = event?.id;
  const liquidityShop = await nftyLending.liquidityShops(liquidityShopId);

  return {
    owner,
    lender,
    alice,
    borrower,
    nftyLending,
    promissoryNote,
    obligationReceipt,
    nftyToken,
    diaOracle,
    erc20,
    erc721,
    liquidityShop,
    liquidityShopId,
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
