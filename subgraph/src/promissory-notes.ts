import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/PromissoryNotes/PromissoryNotes";
import { Loan, User } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  // Skip if this is a mint or burn event, as those are handled by NFTYFinance's event handlers
  if (event.params.from == Address.zero() || event.params.to == Address.zero())
    return;

  const loan = Loan.load(event.params.tokenId.toString());
  if (!loan) return;

  // Create lender User instance if doesn't exist
  if (!User.load(event.params.to.toHex())) {
    const lender = new User(event.params.to.toHex());

    lender.loansIssuedCount = BigInt.fromI32(1);
    lender.loansIssuedResolvedCount = BigInt.fromI32(0);
    lender.loansIssuedDefaultedCount = BigInt.fromI32(0);
    lender.loansTakenCount = BigInt.fromI32(0);
    lender.loansTakenResolvedCount = BigInt.fromI32(0);
    lender.loansTakenDefaultedCount = BigInt.fromI32(0);

    lender.save();
  }

  // Update lender
  loan.lender = event.params.to.toHex();
  loan.save();
}
