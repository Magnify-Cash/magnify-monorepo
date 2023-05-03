import { LendingDashboardDocument } from "../../../.graphclient";
import { useQuery } from "urql";
import { useAccount, useNetwork } from "wagmi";
import dayjs from "dayjs";
import { BigNumber, ethers } from "ethers";
import { truncateAddress } from "@/helpers/utils";
import { getProtocolChain } from "@/helpers/ProtocolDefaults";
import { toast } from "@/helpers/Toast";
import {
  usePrepareNftyLendingLiquidateOverdueLoan,
  useNftyLendingLiquidateOverdueLoan,
} from "../../../../wagmi-generated";

type Loan = {
  nftCollectionName: string;
  borrower: string;
  tokenId: BigInt;
  amount: number;
  apr: number;
  duration: number;
  dueDate: Date;
  erc20Decimals: number;
};

const PendingLoanRow = ({
  nftCollectionName,
  borrower,
  tokenId,
  amount,
  apr,
  dueDate,
  duration,
  erc20Decimals,
}: Loan) => {
  return (
    <div className="row border-bottom">
      <div className="col-6 col-lg-2 align-self-lg-center">
        <div className="p-10 text-lg-center">
          <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
            Collection
          </div>
          <div>{nftCollectionName}</div>
        </div>
      </div>
      <div className="col-6 col-lg-2 align-self-lg-center">
        <div className="p-10 text-lg-center">
          <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
            Borrower/Token ID
          </div>
          <div>
            <div>{truncateAddress(borrower)}</div>
            <div className="text-muted fs-base-n2 text-truncate">
              {tokenId.toString()}
            </div>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2 align-self-lg-center">
        <div className="p-10 text-lg-center">
          <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
            Amount/APR
          </div>
          <div>
            <div>${ethers.utils.formatUnits(amount, erc20Decimals)}</div>
            <div className="text-muted fs-base-n2">APR: {apr}%</div>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2 align-self-lg-center">
        <div className="p-10 text-lg-center">
          <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
            Due/Duration
          </div>
          <div>
            <div>{dueDate.toLocaleDateString()}</div>
            <div className="text-muted fs-base-n2">
              Duration: {duration} Days
            </div>
          </div>
        </div>
      </div>
      <div className="col-sm-10 col-md-8 col-lg-4 align-self-center mx-auto">
        <div className="p-10 d-flex align-items-center">
          <button className="btn btn-success btn-sm w-50 me-5">Accept</button>
          <button className="btn btn-danger btn-sm w-50 me-5">Decline</button>
        </div>
      </div>
    </div>
  );
};

const ActiveLoanRow = ({
  nftCollectionName,
  borrower,
  tokenId,
  amount,
  apr,
  dueDate,
  duration,
  erc20Decimals,
}: Loan) => {
  const { chain } = useNetwork();

  // Liquidate Hook ************************************************************************
  const { config: liquidateConfig, error: liquidateError } =
    usePrepareNftyLendingLiquidateOverdueLoan({
      chainId: getProtocolChain(chain?.id),
      args: [
        BigNumber.from(tokenId), // Loan ID
      ],
    });
  const { write: liquidateWrite, isLoading: liquidateLoading } =
    useNftyLendingLiquidateOverdueLoan({
      ...liquidateConfig,
      onSettled(data, error) {
        toast({
          title: "Liquidate Overdue Loan",
          content: error ? error?.message : data?.hash,
          alertType: error ? "alert-danger" : "alert-success",
        });
      },
  });

  return (
    <div className="row border-bottom">
      <div className="col-6 col-lg-2 align-self-lg-center">
        <div className="p-10 text-lg-center">
          <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
            Collection
          </div>
          <div>{nftCollectionName}</div>
        </div>
      </div>
      <div className="col-6 col-lg-2 align-self-lg-center">
        <div className="p-10 text-lg-center">
          <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
            Borrower/Token ID
          </div>
          <div>
            <div>{truncateAddress(borrower)}</div>
            <div className="text-muted fs-base-n2 text-truncate">
              {tokenId.toString()}
            </div>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2 align-self-lg-center">
        <div className="p-10 text-lg-center">
          <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
            Amount/APR
          </div>
          <div>
            <div>${ethers.utils.formatUnits(amount, erc20Decimals)}</div>
            <div className="text-muted fs-base-n2">APR: {apr}%</div>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2 align-self-lg-center">
        <div className="p-10 text-lg-center">
          <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
            Due/Duration
          </div>
          <div>
            <div>{dueDate.toLocaleDateString()}</div>
            <div className="text-muted fs-base-n2">
              Duration: {duration} Days
            </div>
          </div>
        </div>
      </div>
        <div className="col-sm-10 col-md-8 col-lg-4 align-self-center mx-auto">
          <div className="p-10 d-flex align-items-center">
            <button
              onClick={() => liquidateWrite?.()}
              disabled={dueDate.getTime() > new Date().getTime()}
              className="btn btn-warning btn-sm w-50 mx-auto">
              Liquidate
            </button>
          </div>
        </div>
    </div>
  );
};

export const LendingDashboard = () => {
  // Wagmi hooks
  const { address } = useAccount();

  // GraphQL fetching and parsing
  const [result] = useQuery({
    query: LendingDashboardDocument,
    variables: {
      walletAddress: address,
    },
  });

  // TODO: Placeholder list of pending loans for now
  const pendingLoans: Loan[] = [];

  return (
    <div className="container-xl">
      <div className="px-xxl-50">
        {/* Header start */}
        <div className="content">
          <h1 className="text-strong fw-700 display-6 mt-0">
            Lending Dashboard
          </h1>
          <p className="text-muted mb-0">
            A list to manage the statuses of your Liquidity Shop loans.
          </p>
        </div>
        {/* Header end */}

        {/* Content start */}
        <div className="card p-0">
          <div className="p-10 text-muted text-center border-bottom border-dotted border-top-0 border-start-0 border-end-0">
            LOANS FOR APPROVAL
          </div>

          {/* Table header start */}
          <div className="row border-bottom fs-base-n2 d-none d-lg-flex">
            <div className="col-6 col-lg-2">
              <div className="p-10 text-lg-center">
                <div className="text-muted">Collection</div>
              </div>
            </div>
            <div className="col-6 col-lg-2">
              <div className="p-10 text-lg-center">
                <div className="text-muted">Borrower/Token ID</div>
              </div>
            </div>
            <div className="col-6 col-lg-2">
              <div className="p-10 text-lg-center">
                <div className="text-muted">Amount/APR</div>
              </div>
            </div>
            <div className="col-6 col-lg-2">
              <div className="p-10 text-lg-center">
                <div className="text-muted">Due/Duration</div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="p-10 text-lg-center">
                <div className="text-muted">Actions</div>
              </div>
            </div>
          </div>
          {/* Table header end */}

          {pendingLoans.map((x) => (
            <ActiveLoanRow {...x} />
          ))}

          <div className="p-10 text-muted text-center">
            Total {pendingLoans.length} Approvals
          </div>
        </div>

        {/* 2nd table */}
        <div className="card p-0">
          <div className="p-10 text-muted text-center border-bottom border-dotted border-top-0 border-start-0 border-end-0">
            ACTIVE LOANS (AS LENDER)
          </div>

          {/* Table header start */}
          <div className="row border-bottom fs-base-n2 d-none d-lg-flex">
            <div className="col-6 col-lg-2">
              <div className="p-10 text-lg-center">
                <div className="text-muted">Collection</div>
              </div>
            </div>
            <div className="col-6 col-lg-2">
              <div className="p-10 text-lg-center">
                <div className="text-muted">Borrower/Token ID</div>
              </div>
            </div>
            <div className="col-6 col-lg-2">
              <div className="p-10 text-lg-center">
                <div className="text-muted">Amount/APR</div>
              </div>
            </div>
            <div className="col-6 col-lg-2">
              <div className="p-10 text-lg-center">
                <div className="text-muted">Due/Duration</div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="p-10 text-lg-center">
                <div className="text-muted">Actions</div>
              </div>
            </div>
          </div>
          {/* Table header end */}

          {result.data?.loans.map((x) => (
            <ActiveLoanRow
              {...{
                nftCollectionName: x.liquidityShop.nftCollection.name,
                amount: x.amount,
                duration: x.duration,
                borrower: x.borrower,
                tokenId: x.nftyNotesId,
                // TODO: static value for now, fix this
                apr: 10,
                dueDate: dayjs
                  .unix(x.startTime)
                  .add(x.duration, "days")
                  .toDate(),
                erc20Decimals: x.liquidityShop.erc20.decimals,
              }}
            />
          ))}

          <div className="p-10 text-muted text-center">
            Total {result.data?.loans.length} Active Loans
          </div>
        </div>

        {/* Content end */}
      </div>
    </div>
  );
};
