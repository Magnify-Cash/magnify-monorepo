import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployNftyErc721 } from "../utils/fixtures";
import { expect } from "chai";

describe("NFTY ERC721: Supports interface", () => {
  it("should supports interface ERC721", async () => {
    const { nftyErc721 } = await loadFixture(deployNftyErc721);
    const erc721InterfaceId = "0x80ac58cd";

    expect(await nftyErc721.supportsInterface(erc721InterfaceId)).to.be.true;
  });

  it("should not support invalid interface", async () => {
    const { nftyErc721 } = await loadFixture(deployNftyErc721);
    const invalidInterfaceId = "0xffffffff";

    expect(await nftyErc721.supportsInterface(invalidInterfaceId)).to.be.false;
  });
});
