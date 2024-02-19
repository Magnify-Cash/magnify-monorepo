import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/LendingKeys/LendingKeys";
import { LendingDesk, User } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  // Skip if this is a mint or burn event, as those are handled by NFTYFinance's event handlers
  if (event.params.from == Address.zero() || event.params.to == Address.zero())
    return;

  // Create User instance if doesn't exist
  if (!User.load(event.params.to.toHex())) {
    const user = new User(event.params.to.toHex());

    user.loansIssuedCount = BigInt.fromI32(0);
    user.loansIssuedResolvedCount = BigInt.fromI32(0);
    user.loansIssuedDefaultedCount = BigInt.fromI32(0);
    user.loansTakenCount = BigInt.fromI32(0);
    user.loansTakenResolvedCount = BigInt.fromI32(0);
    user.loansTakenDefaultedCount = BigInt.fromI32(0);

    user.save();
  }

  // Update lending desk owner
  const lendingDesk = LendingDesk.load(event.params.id.toString());
  if (!lendingDesk) return;

  lendingDesk.owner = event.params.to.toHex();
  lendingDesk.save();
}
