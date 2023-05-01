import { Address } from "@graphprotocol/graph-ts";
import {
  ObligationReceipt,
  Transfer,
} from "../generated/ObligationReceipt/ObligationReceipt";
import { Loan } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  // Skip if this is a mint or burn event, as those are handled by NFTYLending's event handlers
  if (event.params.from == Address.zero() || event.params.to == Address.zero())
    return;

  // Get loanId from tokenId
  const obligationReceiptContract = ObligationReceipt.bind(event.address);
  const noteDetails = obligationReceiptContract.notes(event.params.tokenId);
  const loanId = noteDetails.getNoteId().toString();

  // Update borrower
  const loan = new Loan(loanId);
  loan.borrower = event.params.to;
  loan.save();
}
