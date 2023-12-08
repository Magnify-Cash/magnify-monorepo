import { useWaitForTransaction } from "wagmi";
import { usePrepareTestErc20Mint, useTestErc20Mint } from "@/wagmi-generated";
import { useForm } from "react-hook-form";
import { config } from "../config";
import { ethers } from "ethers";

type MintTokensForm = {
  tokenAddress: string;
};

export const MintTokens = () => {
  if (!config) throw new Error("Invalid config");

  // Form
  const { register, watch } = useForm<MintTokensForm>();
  const selectedToken = config.contracts.tokens.filter(
    (x) => x.address == watch("tokenAddress")
  )[0];

  // WAGMI hooks
  const {
    config: testErc20MintConfig,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareTestErc20Mint({
    chainId: config.chainId,
    // @ts-ignore
    address: watch("tokenAddress"),
    args: [
      selectedToken
        ? ethers.parseUnits(selectedToken.mintAmount.toString(), 18)
        : 0n,
    ],
  });

  const {
    data,
    write,
    error: writeError,
    isError: isWriteError,
  } = useTestErc20Mint(testErc20MintConfig);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <div className="mt-2">
      <select
        className="form-select form-select-lg"
        {...register("tokenAddress")}
      >
        <option value="">Select token to mint</option>
        {config.contracts?.tokens.map((x) => (
          <option value={x.address} key={x.address}>
            {x?.name}
          </option>
        ))}
      </select>
      <button
        className="btn btn-light fw-bold w-100 d-block"
        disabled={!write || isLoading || isPrepareError}
        onClick={() => (write ? write() : null)}
      >
        {isLoading
          ? "Claiming..."
          : selectedToken
          ? `Claim ${selectedToken.mintAmount} Testnet $${selectedToken.symbol}`
          : "Claim Testnet Tokens"}
      </button>

      {isSuccess && (
        <div>
          Successfully claimed your testnet ${selectedToken.symbol}!
          <div>
            <a href={`${config.blockscanUrl}/tx/${data?.hash}`} target="_blank">
              Blockscan
            </a>
          </div>
        </div>
      )}
      {(isPrepareError || isWriteError) && (
        <div>
          Error:{" "}
          {isPrepareError
            ? prepareError?.message
            : isWriteError
            ? writeError?.message
            : null}
        </div>
      )}
    </div>
  );
};
