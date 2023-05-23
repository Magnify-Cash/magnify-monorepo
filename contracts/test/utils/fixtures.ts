import { ethers, upgrades } from "hardhat";
import {
  DIAOracleV2__factory,
  NFTYLending,
  NFTYLending__factory,
  NFTYNotes__factory,
  TestERC1155__factory,
  TestERC20__factory,
  TestERC721__factory,
} from "../../../typechain-types";

export const deployNftyLending = async () => {
  // $NFTY token
  const TestERC20 = (await ethers.getContractFactory(
    "TestERC20"
  )) as TestERC20__factory;
  const nftyToken = await TestERC20.deploy("NFTY Coin", "NFTY");
  await nftyToken.deployed();

  // NFTYNotes
  const NFTYNotes = (await ethers.getContractFactory(
    "NFTYNotes"
  )) as NFTYNotes__factory;
  const promissoryNote = await NFTYNotes.deploy(
    "NFTY Promissory Note",
    "LEND",
    "https://metadata.nfty.finance/LEND/"
  );
  await promissoryNote.deployed();
  const obligationReceipt = await NFTYNotes.deploy(
    "NFTY Obligation Receipt",
    "BORROW",
    "https://metadata.nfty.finance/BORROW/"
  );
  await obligationReceipt.deployed();

  const DIAOracle = (await ethers.getContractFactory(
    "DIAOracleV2"
  )) as DIAOracleV2__factory;
  const diaOracle = await DIAOracle.deploy();
  await diaOracle.deployed();

  // NFTYLending
  const NFTYLendingFactory = (await ethers.getContractFactory(
    "NFTYLending"
  )) as NFTYLending__factory;
  const nftyLending = (await upgrades.deployProxy(NFTYLendingFactory, [
    promissoryNote.address,
    obligationReceipt.address,
    nftyToken.address,
    diaOracle.address,
  ])) as NFTYLending;
  await nftyLending.deployed();

  // Configuration
  await promissoryNote.setNftyLending(nftyLending.address);
  await obligationReceipt.setNftyLending(nftyLending.address);

  const [owner, alice] = await ethers.getSigners();

  return {
    nftyLending,
    promissoryNote,
    obligationReceipt,
    nftyToken,
    diaOracle,
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

export const deployNftyLendingWithTestTokens = async () => {
  const {
    nftyLending,
    promissoryNote,
    obligationReceipt,
    nftyToken,
    diaOracle,
  } = await deployNftyLending();

  const { erc20, erc721, erc1155 } = await deployTestTokens();

  // Set $NFTY prices in oracle
  await diaOracle.setValue(
    "NFTY/USD",
    ethers.utils.parseUnits("10", 18), // 10 USD
    Math.floor(new Date().getTime() / 1000)
  );

  // Set ERC20 prices in oracle
  const erc20Symbol = await erc20.symbol();
  await diaOracle.setValue(
    erc20Symbol + "/USD",
    ethers.utils.parseUnits("10", 18), // 2 USD
    Math.floor(new Date().getTime() / 1000)
  );

  return {
    nftyLending,
    promissoryNote,
    obligationReceipt,
    nftyToken,
    diaOracle,
    erc20,
    erc721,
    erc1155,
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
      true,
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
