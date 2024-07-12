import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deploymagnifyErc721 } from "../utils/fixtures";
import { expect } from "chai";

describe("Magnify ERC721: Supports interface", () => {
  it("should supports interface ERC721", async () => {
    const { magnifyErc721 } = await loadFixture(deploymagnifyErc721);
    const erc721InterfaceId = "0x80ac58cd";

    expect(await magnifyErc721.supportsInterface(erc721InterfaceId)).to.be.true;
  });

  it("should not support invalid interface", async () => {
    const { magnifyErc721 } = await loadFixture(deploymagnifyErc721);
    const invalidInterfaceId = "0xffffffff";

    expect(await magnifyErc721.supportsInterface(invalidInterfaceId)).to.be.false;
  });
});
