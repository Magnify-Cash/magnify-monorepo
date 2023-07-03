import { Address } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/ObligationNotes/ObligationNotes";
import { Loan } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  // Skip if this is a mint or burn event, as those are handled by NFTYLending's event handlers
  if (event.params.from == Address.zero() || event.params.to == Address.zero())
    return;

  // Update borrower
  const loan = new Loan(event.params.tokenId.toString());
  loan.borrower = event.params.to;
  loan.save();
}
