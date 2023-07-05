import { beforeAll } from "matchstick-as";
import { intialOwnershipTransfer } from "./utils";
import { Address } from "@graphprotocol/graph-ts";

const nftyFinance = Address.fromString(
  "0x63fea6E447F120B8Faf85B53cdaD8348e645D80E"
);

describe("Paused", () => {
  beforeAll(() => {
    intialOwnershipTransfer(nftyFinance);
  });

  test("Uppdates ");
});
