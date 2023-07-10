import { Address } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/PromissoryNotes/PromissoryNotes";
import { Loan } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  // Skip if this is a mint or burn event, as those are handled by NFTYFinance's event handlers
  if (event.params.from == Address.zero() || event.params.to == Address.zero())
    return;

  // Update lender
  const loan = Loan.load(event.params.tokenId.toString());
  if (!loan) return;

  loan.lender = event.params.to;
  loan.save();
}
