import {
  assert,
  beforeAll,
  describe,
  logStore,
  test,
} from "matchstick-as/assembly/index";
import {
  TestLoanConfig,
  createLendingDeskLoanConfigsSetEvent,
  initializeLendingDesk,
} from "./utils";
import { handleLendingDeskLoanConfigsSet } from "../src/nfty-finance";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { LoanConfig, NftCollection } from "../generated/schema";

const nftyFinance = Address.fromString(
  "0x63fea6E447F120B8Faf85B53cdaD8348e645D80E"
);

const lendingDeskId = 12;
const owner = Address.fromString("0xFABB0ac9d68B0B445fB7357272Ff202C5651694a");
const erc20 = Address.fromString("0x71bE63f3384f5fb98995898A86B02Fb2426c5788");

const loanConfigs: Array<TestLoanConfig> = [
  {
    nftCollection: Address.fromString(
      "0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e"
    ),
    nftCollectionIsErc1155: false,
    minAmount: BigInt.fromU64(10 * 10 ** 18),
    maxAmount: BigInt.fromU64(100 * 10 ** 18),
    minDuration: BigInt.fromU64(12),
    maxDuration: BigInt.fromU64(24 * 5),
    minInterest: BigInt.fromU64(300),
    maxInterest: BigInt.fromU64(15000),
  },
  {
    nftCollection: Address.fromString(
      "0xED5AF388653567Af2F388E6224dC7C4b3241C544"
    ),
    nftCollectionIsErc1155: true,
    minAmount: BigInt.fromU64(20 * 10 ** 18),
    maxAmount: BigInt.fromU64(60 * 10 ** 18),
    minDuration: BigInt.fromU64(24 * 2),
    maxDuration: BigInt.fromU64(24 * 10),
    minInterest: BigInt.fromU64(500),
    maxInterest: BigInt.fromU64(10000),
  },
];

describe("LendingDeskLoanConfigsSet", () => {
  beforeAll(() => {
    initializeLendingDesk(nftyFinance, lendingDeskId, owner, erc20);
  });

  test("Should create LoanConfig and NftCollection entities on LendingDeskLoanConfigsSet", () => {
    // Handle event
    const event = createLendingDeskLoanConfigsSetEvent(
      nftyFinance,
      lendingDeskId,
      loanConfigs
    );
    handleLendingDeskLoanConfigsSet(event);

    loanConfigs.forEach((config) => {
      const loanConfigId =
        lendingDeskId.toString() + "-" + config.nftCollection.toHex();

      // Assert LoanConfig got created
      const loanConfig = LoanConfig.load(loanConfigId);
      assert.assertNotNull(loanConfig);
      if (!loanConfig) return;

      // Assert contents of LoanConfig
      assert.stringEquals(loanConfig.id, loanConfigId);
      assert.stringEquals(loanConfig.lendingDesk, lendingDeskId.toString());
      assert.stringEquals(
        loanConfig.nftCollection,
        config.nftCollection.toHex()
      );
      assert.bigIntEquals(loanConfig.minAmount, config.minAmount);
      assert.bigIntEquals(loanConfig.maxAmount, config.maxAmount);
      assert.bigIntEquals(loanConfig.minInterest, config.minInterest);
      assert.bigIntEquals(loanConfig.maxInterest, config.maxInterest);
      assert.bigIntEquals(loanConfig.minDuration, config.minDuration);
      assert.bigIntEquals(loanConfig.maxDuration, config.maxDuration);

      // Assert NftCollection got created
      const nftCollection = NftCollection.load(config.nftCollection.toHex());
      assert.assertNotNull(nftCollection);
      if (!nftCollection) return;

      // Assert contents of NftCollection
      assert.stringEquals(nftCollection.id, config.nftCollection.toHex());
      assert.booleanEquals(
        nftCollection.isErc1155,
        config.nftCollectionIsErc1155
      );
    });

    // logStore();
  });
});
