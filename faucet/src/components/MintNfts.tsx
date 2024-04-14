import { useWaitForTransaction, useChainId } from "wagmi";
import { config } from "@/config";
import { useForm } from "react-hook-form";
import { usePrepareTestErc721Mint, useTestErc721Mint } from "../../../dapp-v1/src/wagmi-generated";

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
    config: testErc721MintConfig,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareTestErc721Mint({
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
    write,
    error: writeError,
    isError: isWriteError,
  } = useTestErc721Mint(testErc721MintConfig);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
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
        disabled={!write || isLoading || isPrepareError || !selectedNft}
        onClick={() => (write ? write() : null)}
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
            <a href={`${chainConfig.blockscanUrl}/tx/${data?.hash}`} target="_blank">
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
