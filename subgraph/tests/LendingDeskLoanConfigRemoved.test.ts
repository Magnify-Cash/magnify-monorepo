import { assert, beforeAll, test } from "matchstick-as/assembly/index";
import {
  createLendingDeskLoanConfigRemovedEvent,
  initializeLendingDesk,
} from "./utils";
import { handleLendingDeskLoanConfigRemoved } from "../src/nfty-finance";
import { ethereum } from "@graphprotocol/graph-ts";
import { NftCollection } from "../generated/schema";
import {
  erc20Address,
  lendingDeskId,
  loanConfigs,
  lendingDeskOwner,
} from "./consts";

beforeAll(() => {
  initializeLendingDesk(
    lendingDeskId,
    lendingDeskOwner,
    erc20Address,
    loanConfigs
  );
});

test("Should remove LoanConfig on LendingDeskLoanConfigRemoved", () => {
  // Assert LoanConfigs exist
  assert.entityCount("LoanConfig", 2);

  loanConfigs.forEach((loanConfig) => {
    const loanConfigId =
      lendingDeskId.toString() + "-" + loanConfig.nftCollection.toHex();

    handleLendingDeskLoanConfigRemoved(
      createLendingDeskLoanConfigRemovedEvent(
        lendingDeskId,
        loanConfig.nftCollection
      )
    );

    // Assert LoanConfig got delete
    assert.notInStore("LoanConfig", loanConfigId);

    // Assert derived fields for NftCollection entity
    const nftCollection = NftCollection.load(loanConfig.nftCollection.toHex());
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
