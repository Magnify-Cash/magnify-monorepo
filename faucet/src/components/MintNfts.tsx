import * as React from "react";
import { useWaitForTransaction } from "wagmi";
import { config } from "../config";
import { useForm } from "react-hook-form";
import {
  usePrepareTestNftCollectionMint,
  useTestNftCollectionMint,
} from "../../../wagmi-generated";
import { BigNumber } from "ethers";

type MintNftsForm = {
  nftAddress: string;
};

export const MintNfts = () => {
  if (!config) throw new Error("Invalid config");

  // Form
  const { register, watch } = useForm<MintNftsForm>();
  const selectedNft = config.contracts.nftCollections.filter(
    (x) => x.address == watch("nftAddress")
  )[0];

  // WAGMI hooks
  const {
    config: testNftCollectionMintConfig,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareTestNftCollectionMint({
    chainId: config.chainId,
    // @ts-ignore
    address: watch("nftAddress"),
    args: [BigNumber.from(selectedNft ? selectedNft.mintAmount : 0)],
    overrides: {
      gasLimit: BigNumber.from(3000000),
    },
  });

  const {
    data,
    write,
    error: writeError,
    isError: isWriteError,
  } = useTestNftCollectionMint(testNftCollectionMintConfig);

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
        {config.contracts?.nftCollections.map((x) => (
          <option value={x.address}>{x?.name}</option>
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
