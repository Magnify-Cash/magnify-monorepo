import { toWei } from "./utils";

export const calculateLoanInterest = (
  loanConfig,
  amountInput,
  durationInput,
  decimals?,
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
    const durationFactor = (duration - minDuration) / (maxDuration - minDuration);
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

export const calculateLoanOriginationFee = (amount) => {
  const feePercentage = 2; //fee is 2%
  const result = (amount * feePercentage) / 100;
  return Number(result.toFixed(2));
};

export const calculateGrossAmount = (amount) => {
  const fee = calculateLoanOriginationFee(amount);
  const result = amount - fee;
  return Number(result.toFixed(2));
};
