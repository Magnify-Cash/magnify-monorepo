import { store, Address } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/Doodles/ERC721";
import { Nft } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  // Get NFT entity ID by concatenating contract address and tokenID
  const nftId = event.address.toHex() + "-" + event.params.tokenId.toString();

  // Delete the instance if the NFT is burnt
  if (event.params.to == Address.zero()) store.remove("Nft", nftId);
  // Upsert the instance otherwise
  else {
    const nft = new Nft(nftId);
    nft.owner = event.params.to;
    nft.nftCollection = event.address.toHex();
    nft.tokenId = event.params.tokenId;
    nft.save();
  }
}
