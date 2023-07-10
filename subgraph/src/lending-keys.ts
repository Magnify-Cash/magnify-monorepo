import { Address } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/LendingKeys/LendingKeys";
import { LendingDesk } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  // Skip if this is a mint or burn event, as those are handled by NFTYFinance's event handlers
  if (event.params.from == Address.zero() || event.params.to == Address.zero())
    return;

  // Update lending desk owner
  const lendingDesk = LendingDesk.load(event.params.tokenId.toString());
  if (!lendingDesk) return;

  lendingDesk.owner = event.params.to;
  lendingDesk.save();
}
