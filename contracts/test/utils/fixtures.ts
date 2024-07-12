import { ethers } from "hardhat";
import { LoanConfig } from "./consts";
import { getEvent } from "./utils";

export const deployMagnifyCash = async () => {
  const [owner, alice] = await ethers.getSigners();

  // Obligation Notes
  const ObligationNotes = await ethers.getContractFactory(
    "MagnifyObligationNotesV1"
  );
  const obligationNotes = await ObligationNotes.deploy(
    "Magnify Obligation Notes",
    "BORROW",
    "https://metadata.magnify.cash/BORROW/",
    owner.address
  );
  await obligationNotes.waitForDeployment();

  // Lending Keys
  const LendingKeys = await ethers.getContractFactory("MagnifyLendingKeysV1");
  const lendingKeys = await LendingKeys.deploy(
    "Magnify Lending Keys",
    "KEYS",
    "https://metadata.magnify.cash/KEYS/",
    owner.address
  );
  await lendingKeys.waitForDeployment();

  const MagnifyCash = await ethers.getContractFactory("MagnifyCashV1");

  const loanOriginationFee = 200n;
  const platformWallet = ethers.Wallet.createRandom().address;

  const magnifyCash = await MagnifyCash.deploy(
    obligationNotes.target,
    lendingKeys.target,
    loanOriginationFee,
    platformWallet,
    owner.address
  );
  await magnifyCash.waitForDeployment();

  // Configuration
  await obligationNotes.setMagnifyCash(magnifyCash.target);
  await lendingKeys.setMagnifyCash(magnifyCash.target);

  return {
    magnifyCash,
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

export const deployMagnifyCashWithTestTokens = async () => {
  const { ...items } = await deployMagnifyCash();
  const { ...testTokens } = await deployTestTokens();

  return {
    ...items,
    ...testTokens,
  };
};

export const initializeLendingDesk = async () => {
  const {
    magnifyCash,
    obligationNotes,
    erc20,
    erc721,
    erc1155,
    lendingKeys,
    platformWallet,
  } = await deployMagnifyCashWithTestTokens();

  const [owner, lender, borrower, alice] = await ethers.getSigners();

  const initialBalance = BigInt(1000 * 10 ** 18);

  // Get ERC20 and approve
  await erc20.connect(lender).mint(initialBalance);
  await erc20.connect(lender).approve(magnifyCash.getAddress(), initialBalance);

  // Create liquidity shop
  const tx = await magnifyCash
    .connect(lender)
    .initializeNewLendingDesk(erc20.getAddress(), initialBalance, []);

  // Get liquidity shop from event
  const event = await getEvent(tx, "NewLendingDeskInitialized");
  const lendingDeskId = event?.lendingDeskId;
  const lendingDesk = await magnifyCash.lendingDesks(lendingDeskId);

  return {
    owner,
    lender,
    alice,
    borrower,
    magnifyCash,
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
  const { magnifyCash, lender, lendingDeskId, erc721, ...rest } =
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

  await magnifyCash
    .connect(lender)
    .setLendingDeskLoanConfigs(lendingDeskId, [loanConfig]);
  return { magnifyCash, lender, lendingDeskId, loanConfig, erc721, ...rest };
};

export const initializeLoan = async () => {
  const loanDuration = 30;
  const loanAmount = ethers.parseUnits("20", 18);
  const nftId = 0;
  const maxInterestAllowed = 10000000n;

  const { borrower, erc20, erc721, magnifyCash, lendingDeskId, ...rest } =
    await initializeLendingDeskAndAddLoanConfig();

  // Give borrower some ERC20 and NFTs
  await erc20.connect(borrower).mint(10000);
  await erc721.connect(borrower).mint(1);

  // Approve Magnify Cash to transfer tokens
  await erc20.connect(borrower).approve(magnifyCash.target, 10000);
  await erc721.connect(borrower).approve(magnifyCash.target, nftId);

  const tx = await magnifyCash
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
  const loan = await magnifyCash.loans(loanId);

  return {
    borrower,
    erc20,
    erc721,
    magnifyCash,
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

export const deploymagnifyErc721 = async () => {
  const name = "Magnify ERC721";
  const symbol = "MAG";
  const baseUri = "https://metadata.magnify-erc721.local";

  const [owner, alice, magnifyCash] = await ethers.getSigners();

  const MagnifyERC721V1 = await ethers.getContractFactory("MagnifyERC721V1");
  const magnifyErc721 = await MagnifyERC721V1.deploy(
    name,
    symbol,
    baseUri,
    owner.address
  );
  await magnifyErc721.waitForDeployment();

  return {
    name,
    symbol,
    baseUri,
    magnifyErc721,
    owner,
    alice,
    magnifyCash,
  };
};

export const deploymagnifyErc721AndSetMagnifyCash = async () => {
  const { magnifyErc721, owner, magnifyCash, ...rest } = await deploymagnifyErc721();

  await magnifyErc721.connect(owner).setMagnifyCash(magnifyCash.address);

  return {
    magnifyErc721,
    owner,
    magnifyCash,
    ...rest,
  };
};

export const deploymagnifyErc721AndMint = async () => {
  const { magnifyErc721, alice, magnifyCash, ...rest } =
    await deploymagnifyErc721AndSetMagnifyCash();

  const tokenId = 1;
  await magnifyErc721.connect(magnifyCash).mint(alice.address, tokenId);

  return { magnifyErc721, alice, magnifyCash, tokenId, ...rest };
};
