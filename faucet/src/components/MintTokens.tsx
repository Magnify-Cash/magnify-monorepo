import { useWaitForTransactionReceipt, useChainId } from "wagmi";
import { useSimulateTestErc20Mint, useWriteTestErc20Mint } from "../../../dapp-v1/src/wagmi-generated";
import { useForm } from "react-hook-form";
import { config } from "../config";
import { ethers } from "ethers";

type MintTokensForm = {
  tokenAddress: string;
};

export const MintTokens = () => {
  const chainId = useChainId();
  const chainConfig = config[chainId];
  if (!chainConfig) throw new Error("Invalid config");

  // Form
  const { register, watch } = useForm<MintTokensForm>();
  const selectedToken = chainConfig.contracts.tokens.filter(
    (x) => x.address == watch("tokenAddress")
  )[0];

  // WAGMI hooks
  const {
    data: testErc20MintConfig,
    error: prepareError,
    isError: isPrepareError,
  } = useSimulateTestErc20Mint({
    chainId: chainConfig.chainId,
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
    writeContract,
    error: writeError,
    isError: isWriteError,
  } = useWriteTestErc20Mint();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  return (
    <div className="mt-2">
      <select
        className="form-select form-select-lg"
        {...register("tokenAddress")}
      >
        <option value="">Select token to mint</option>
        {chainConfig.contracts?.tokens.map((x) => (
          <option value={x.address} key={x.address}>
            {x?.name}
          </option>
        ))}
      </select>
      <button
        className="btn btn-light fw-bold w-100 d-block"
        disabled={!writeContract || isLoading || isPrepareError}
        onClick={() => (writeContract ? writeContract(testErc20MintConfig!.request) : null)}
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
            <a href={`${chainConfig.blockscanUrl}/tx/${data}`} target="_blank">
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
