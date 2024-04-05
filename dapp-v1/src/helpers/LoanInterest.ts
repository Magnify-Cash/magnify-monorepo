import { fromWei } from "./utils";

export const calculateLoanInterest = (
  loanConfig,
  amountInput,
  durationInput,
  decimals,
) => {
  //Handle case if loanConfig is not available
  if (!loanConfig || typeof loanConfig !== "object") {
    return 0;
  }
  const minAmount = Number(fromWei(loanConfig.minAmount, decimals));
  const maxAmount = Number(fromWei(loanConfig.maxAmount, decimals));
  const minDuration = Number(loanConfig.minDuration);
  const maxDuration = Number(loanConfig.maxDuration);
  const minInterest = Number(loanConfig.minInterest);
  const maxInterest = Number(loanConfig.maxInterest);

  const amount = amountInput ? Number(amountInput) : minAmount;
  const duration = durationInput ? Number(durationInput * 24) : minDuration;
  const interestRange = Number(maxInterest - minInterest);

  let interest: number;

  if (
    minInterest === maxInterest ||
    (maxAmount === minAmount && maxDuration === minDuration)
  ) {
    interest = minInterest;
  } else if (minDuration === maxDuration) {
    const amountFactor = Number(amount - minAmount) / Number(maxAmount - minAmount);
    interest = minInterest + amountFactor * interestRange;
  } else if (minAmount === maxAmount) {
    const durationFactor =
      Number(duration - minDuration) / Number(maxDuration - minDuration);
    interest = minInterest + durationFactor * interestRange;
  } else {
    const amountFactor = Number(amount - minAmount) / Number(maxAmount - minAmount);
    const durationFactor =
      Number(duration - minDuration) / Number(maxDuration - minDuration);

    //Taking average of amountFactor and durationFactor giving both equal weightage
    const factor = (amountFactor + durationFactor) / 2;
    interest = minInterest + factor * interestRange;
  }

  return Number(interest) / 100;
};

export const calculateLoanOriginationFee = (amount: number) => {
  const feePercentage = 2; //fee is 2%
  const result = (amount * feePercentage) / 100;
  return Number(result.toFixed(2));
};

export const calculateGrossAmount = (amount) => {
  const fee = calculateLoanOriginationFee(Number(amount));
  const result = Number(amount) - fee;
  return Number(result.toFixed(2));
};
