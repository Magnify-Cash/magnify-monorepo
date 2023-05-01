import { Address } from "@graphprotocol/graph-ts";
import {
  PromissoryNote,
  Transfer,
} from "../generated/PromissoryNote/PromissoryNote";
import { Loan } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  // Skip if this is a mint or burn event, as those are handled by NFTYLending's event handlers
  if (event.params.from == Address.zero() || event.params.to == Address.zero())
    return;

  // Get loanId from tokenId
  const promissoryNoteContract = PromissoryNote.bind(event.address);
  const noteDetails = promissoryNoteContract.notes(event.params.tokenId);
  const loanId = noteDetails.getNoteId().toString();

  // Update lender
  const loan = new Loan(loanId);
  loan.lender = event.params.to;
  loan.save();
}
