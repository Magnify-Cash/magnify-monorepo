import { toWei } from "./utils";

const calculateLoanInterest = (
  loanConfig,
  amountInput,
  durationInput,
  decimals?
) => {
  const minAmount = BigInt(loanConfig.minAmount);
  const maxAmount = BigInt(loanConfig.maxAmount);
  const minDuration = BigInt(loanConfig.minDuration);
  const maxDuration = BigInt(loanConfig.maxDuration);
  const minInterest = BigInt(loanConfig.minInterest);
  const maxInterest = BigInt(loanConfig.maxInterest);

  const amount = amountInput ? toWei(amountInput, decimals) : minAmount;
  const duration = BigInt(durationInput ? durationInput * 24 : minDuration);
  const interestRange = maxInterest - minInterest;

  let interest = minInterest;

  if (minInterest === maxInterest) {
    return Number(interest) / 100;
  }
  if (maxAmount === minAmount && maxDuration === minDuration) {
    return Number(interest) / 100;
  }
  if (minDuration === maxDuration) {
    const amountFactor = (amount - minAmount) / (maxAmount - minAmount);
    interest = minInterest + amountFactor * interestRange;
  } else if (minAmount === maxAmount) {
    const durationFactor =
      (duration - minDuration) / (maxDuration - minDuration);
    interest = minInterest + durationFactor * interestRange;
  } else {
    //Taking average of amountFactor and durationFactor giving both equal weightage
    //Diving by BigInt(2) after multiplying by interestRange because of integer division
    //Otherwise (amountFactor + durationFactor)/2 will produce 0
  }
  const amountFactor = (amount - minAmount) / (maxAmount - minAmount);
  const durationFactor = (duration - minDuration) / (maxDuration - minDuration);

  interest =
    minInterest + ((amountFactor + durationFactor) * interestRange) / BigInt(2);

  return Number(interest) / 100;
};

export default calculateLoanInterest;
