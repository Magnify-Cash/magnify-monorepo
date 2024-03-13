import { ethers } from "hardhat";
import { LoanConfig } from "./consts";
import { getEvent } from "./utils";

export const deployNftyFinance = async () => {
  const [owner, alice] = await ethers.getSigners();

  // Obligation Notes
  const ObligationNotes = await ethers.getContractFactory(
    "NFTYObligationNotesV1"
  );
  const obligationNotes = await ObligationNotes.deploy(
    "NFTY Obligation Notes",
    "BORROW",
    "https://metadata.nfty.finance/BORROW/",
    owner.address
  );
  await obligationNotes.waitForDeployment();

  // Lending Keys
  const LendingKeys = await ethers.getContractFactory("NFTYLendingKeysV1");
  const lendingKeys = await LendingKeys.deploy(
    "NFTY Lending Keys",
    "KEYS",
    "https://metadata.nfty.finance/KEYS/",
    owner.address
  );
  await lendingKeys.waitForDeployment();

  const NFTYFinance = await ethers.getContractFactory("NFTYFinanceV1");

  const loanOriginationFee = 200n;
  const platformWallet = ethers.Wallet.createRandom().address;

  const nftyFinance = await NFTYFinance.deploy(
    obligationNotes.target,
    lendingKeys.target,
    loanOriginationFee,
    platformWallet,
    owner.address
  );
  await nftyFinance.waitForDeployment();

  // Configuration
  await obligationNotes.setNftyFinance(nftyFinance.target);
  await lendingKeys.setNftyFinance(nftyFinance.target);

  return {
    nftyFinance,
    obligationNotes,
    lendingKeys,
    loanOriginationFee,
    owner,
    alice,
    platformWallet,
  };
};

export const deployTestTokens = async () => {
  const TestERC20 = await ethers.getContractFactory("TestERC20");
  const erc20 = await TestERC20.deploy("USD Coin", "USDC");
  await erc20.waitForDeployment();

  const TestERC721 = await ethers.getContractFactory("TestERC721");
  const erc721 = await TestERC721.deploy(
    "Doodles",
    "DOODLE",
    "ipfs://QmPMc4tcBsMqLRuCQtPmPe84bpSjrC3Ky7t3JWuHXYB4aS/"
  );
  await erc721.waitForDeployment();

  const TestERC1155 = await ethers.getContractFactory("TestERC1155");
  const erc1155 = await TestERC1155.deploy(
    "https://api.polygonpunks.io/metadata/"
  );
  await erc1155.waitForDeployment();

  return { erc20, erc721, erc1155 };
};

export const deployNftyFinanceWithTestTokens = async () => {
  const { ...items } = await deployNftyFinance();
  const { ...testTokens } = await deployTestTokens();

  return {
    ...items,
    ...testTokens,
  };
};

export const initializeLendingDesk = async () => {
  const {
    nftyFinance,
    obligationNotes,
    erc20,
    erc721,
    erc1155,
    lendingKeys,
    platformWallet,
  } = await deployNftyFinanceWithTestTokens();

  const [owner, lender, borrower, alice] = await ethers.getSigners();

  const initialBalance = BigInt(1000 * 10 ** 18);

  // Get ERC20 and approve
  await erc20.connect(lender).mint(initialBalance);
  await erc20.connect(lender).approve(nftyFinance.getAddress(), initialBalance);

  // Create liquidity shop
  const tx = await nftyFinance
    .connect(lender)
    .initializeNewLendingDesk(erc20.getAddress(), initialBalance, []);

  // Get liquidity shop from event
  const event = await getEvent(tx, "NewLendingDeskInitialized");
  const lendingDeskId = event?.lendingDeskId;
  const lendingDesk = await nftyFinance.lendingDesks(lendingDeskId);

  return {
    owner,
    lender,
    alice,
    borrower,
    nftyFinance,
    obligationNotes,
    erc20,
    erc721,
    erc1155,
    lendingDesk,
    lendingDeskId,
    lendingKeys,
    initialBalance,
    platformWallet,
  };
};

export const initializeLendingDeskAndAddLoanConfig = async () => {
  const { nftyFinance, lender, lendingDeskId, erc721, ...rest } =
    await initializeLendingDesk();

  const loanConfig: LoanConfig = {
    nftCollection: await erc721.getAddress(),
    nftCollectionIsErc1155: false,
    minAmount: ethers.parseUnits("10", 18),
    maxAmount: ethers.parseUnits("100", 18),
    minDuration: 24n,
    maxDuration: 240n,
    minInterest: 200n,
    maxInterest: 1500n,
  };

  await nftyFinance
    .connect(lender)
    .setLendingDeskLoanConfigs(lendingDeskId, [loanConfig]);
  return { nftyFinance, lender, lendingDeskId, loanConfig, erc721, ...rest };
};

export const initializeLoan = async () => {
  const loanDuration = 30;
  const loanAmount = ethers.parseUnits("20", 18);
  const nftId = 0;
  const maxInterestAllowed = 10000000n;

  const { borrower, erc20, erc721, nftyFinance, lendingDeskId, ...rest } =
    await initializeLendingDeskAndAddLoanConfig();

  // Give borrower some ERC20 and NFTs
  await erc20.connect(borrower).mint(10000);
  await erc721.connect(borrower).mint(1);

  // Approve NFTYLending to transfer tokens
  await erc20.connect(borrower).approve(nftyFinance.target, 10000);
  await erc721.connect(borrower).approve(nftyFinance.target, nftId);

  const tx = await nftyFinance
    .connect(borrower)
    .initializeNewLoan(
      lendingDeskId,
      erc721.target,
      nftId,
      loanDuration,
      loanAmount,
      maxInterestAllowed
    );

  // Get details from event
  const event = await getEvent(tx, "NewLoanInitialized");
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
  loanAmount: bigint,
  interest: number
) => {
  const secondsInYear = 31536000n;
  const secondsInHour = 3600n;
  const secondsSinceLoanStart = BigInt(
    Math.floor(Date.now() / 1000) - loanStartTime
  );

  const totalAmountDue =
    loanAmount +
    (loanAmount * BigInt(interest) * secondsSinceLoanStart) /
      (secondsInYear * secondsInHour * 10000n);
  return totalAmountDue;
};

export const deployNftyErc721 = async () => {
  const name = "NFTY ERC721";
  const symbol = "NFTY";
  const baseUri = "https://metadata.nfty-erc721.local";

  const [owner, alice, nftyFinance] = await ethers.getSigners();

  const NFTYERC721V1 = await ethers.getContractFactory("NFTYERC721V1");
  const nftyErc721 = await NFTYERC721V1.deploy(
    name,
    symbol,
    baseUri,
    owner.address
  );
  await nftyErc721.waitForDeployment();

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
