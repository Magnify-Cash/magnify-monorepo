import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/ObligationNotes/ObligationNotes";
import { Loan, User } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  // Skip if this is a mint or burn event, as those are handled by NFTYFinance's event handlers
  if (event.params.from == Address.zero() || event.params.to == Address.zero())
    return;

  const loan = Loan.load(event.params.tokenId.toString());
  if (!loan) return;

  // Create borrower User instance if doesn't exist
  if (!User.load(event.params.to.toHex())) {
    const borrower = new User(event.params.to.toHex());

    borrower.loansIssuedCount = BigInt.fromI32(0);
    borrower.loansIssuedResolvedCount = BigInt.fromI32(0);
    borrower.loansIssuedDefaultedCount = BigInt.fromI32(0);
    borrower.loansTakenCount = BigInt.fromI32(1);
    borrower.loansTakenResolvedCount = BigInt.fromI32(0);
    borrower.loansTakenDefaultedCount = BigInt.fromI32(0);

    borrower.save();
  }

  // Update borrower
  loan.borrower = event.params.to.toHex();
  loan.save();
}
