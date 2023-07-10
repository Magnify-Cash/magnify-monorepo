import { assert, beforeAll, test } from "matchstick-as/assembly/index";
import {
  createLendingDeskLoanConfigsSetEvent,
  initializeLendingDesk,
} from "../utils";
import { handleLendingDeskLoanConfigsSet } from "../../src/nfty-finance";
import { ethereum } from "@graphprotocol/graph-ts";
import { LoanConfig, NftCollection } from "../../generated/schema";
import {
  erc20Address,
  lendingDeskId,
  loanConfigs,
  lendingDeskOwner,
} from "../consts";

beforeAll(() => {
  initializeLendingDesk(lendingDeskId, lendingDeskOwner, erc20Address, []);
});

test("Should create LoanConfig and NftCollection entities on LendingDeskLoanConfigsSet", () => {
  // Handle event
  handleLendingDeskLoanConfigsSet(
    createLendingDeskLoanConfigsSetEvent(lendingDeskId, loanConfigs)
  );

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
    assert.stringEquals(loanConfig.nftCollection, config.nftCollection.toHex());
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

    // Assert derived fields
    assert.arrayEquals(
      nftCollection.loanConfigs.map<ethereum.Value>((x) =>
        ethereum.Value.fromString(x)
      ),
      [ethereum.Value.fromString(loanConfigId)]
    );
  });
});
