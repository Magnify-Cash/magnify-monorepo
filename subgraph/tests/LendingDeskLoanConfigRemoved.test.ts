import {
  assert,
  beforeAll,
  describe,
  test,
} from "matchstick-as/assembly/index";
import {
  TestLoanConfig,
  createLendingDeskLoanConfigRemovedEvent,
  initializeLendingDesk,
} from "./utils";
import { handleLendingDeskLoanConfigRemoved } from "../src/nfty-finance";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { NftCollection } from "../generated/schema";

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
    initializeLendingDesk(
      nftyFinance,
      lendingDeskId,
      owner,
      erc20,
      loanConfigs
    );
  });

  test("Should remove LoanConfig on LendingDeskLoanConfigRemoved", () => {
    // Assert LoanConfigs exist
    assert.entityCount("LoanConfig", 2);

    loanConfigs.forEach((loanConfig) => {
      const loanConfigId =
        lendingDeskId.toString() + "-" + loanConfig.nftCollection.toHex();

      const event = createLendingDeskLoanConfigRemovedEvent(
        nftyFinance,
        lendingDeskId,
        loanConfig.nftCollection
      );
      handleLendingDeskLoanConfigRemoved(event);

      // Assert LoanConfig got delete
      assert.notInStore("LoanConfig", loanConfigId);

      // Assert derived fields for NftCollection entity
      const nftCollection = NftCollection.load(
        loanConfig.nftCollection.toHex()
      );
      assert.assertNotNull(nftCollection);
      if (!nftCollection) return;

      assert.arrayEquals(
        nftCollection.loanConfigs.map<ethereum.Value>((x) =>
          ethereum.Value.fromString(x)
        ),
        []
      );
    });
  });
});
