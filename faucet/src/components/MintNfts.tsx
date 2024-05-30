import { useWaitForTransactionReceipt, useChainId } from "wagmi";
import { config } from "@/config";
import { useForm } from "react-hook-form";
import { useSimulateTestErc721Mint, useWriteTestErc721Mint } from "../../../dapp-v1/src/wagmi-generated";

type MintNftsForm = {
  nftAddress: string;
};

export const MintNfts = () => {
  const chainId = useChainId();
  const chainConfig = config[chainId];
  if (!chainConfig) throw new Error("Invalid config");

  // Form
  const { register, watch } = useForm<MintNftsForm>();
  const selectedNft = chainConfig.contracts.nftCollections.filter(
    (x) => x.address == watch("nftAddress")
  )[0];

  // WAGMI hooks
  const {
    data: testErc721MintConfig,
    error: prepareError,
    isError: isPrepareError,
  } = useSimulateTestErc721Mint({
    chainId: chainConfig.chainId,
    // @ts-ignore
    address: watch("nftAddress"),
    args: [selectedNft ? BigInt(selectedNft.mintAmount) : 0n],
    overrides: {
      gasLimit: 3000000n,
    },
  });

  const {
    data,
    writeContract,
    error: writeError,
    isError: isWriteError,
  } = useWriteTestErc721Mint();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  return (
    <div className="mt-2">
      <select
        className="form-select form-select-lg"
        {...register("nftAddress")}
      >
        <option value="">Select NFT collection to mint</option>
        {chainConfig.contracts?.nftCollections.map((x) => (
          <option value={x.address} key={x.address}>
            {x?.name}
          </option>
        ))}
      </select>
      <button
        className="btn btn-light fw-bold w-100 d-block"
        disabled={!writeContract || isLoading || isPrepareError || !selectedNft}
        onClick={() => (writeContract ? writeContract(testErc721MintConfig!.request) : null)}
      >
        {isLoading
          ? "Claiming..."
          : selectedNft
          ? `Claim ${selectedNft.mintAmount} Testnet ${selectedNft.name}`
          : "Claim Testnet NFTs"}
      </button>

      {isSuccess && (
        <div>
          Successfully claimed your testnet {selectedNft.name}!
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
