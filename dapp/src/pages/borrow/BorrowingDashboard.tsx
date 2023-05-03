import { BorrowingDashboardDocument } from "../../../.graphclient";
import { useQuery } from "urql";
import { useAccount } from "wagmi";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { Loading } from "@/components";
import { ethers } from "ethers";
import { truncateAddress } from "@/helpers/utils";

type Loan = {
  loanId: number;
  nftCollectionName: string;
  lender: string;
  tokenId: BigInt;
  amount: number;
  apr: number;
  dueDate: Date;
  duration: number;
  status: string;
  erc20Decimals: number;
};

const LoanRow = ({
  loanId,
  nftCollectionName,
  lender,
  tokenId,
  amount,
  apr,
  dueDate,
  duration,
  status,
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
            Lender/Token ID
          </div>
          <div>
            <div>{truncateAddress(lender)}</div>
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
      {status === "ACTIVE" ? (
        <div className="col-sm-10 col-md-8 col-lg-4 align-self-center mx-auto">
          <div className="p-10 text-center">
            <Link
              to={`/borrow/make-payment/${loanId}`}
              className="btn btn-success btn-sm ws-150 mw-100"
            >
              Pay Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="col-sm-10 col-md-8 col-lg-4 align-self-center mx-auto">
          <div className="p-10 text-center">Expired</div>
        </div>
      )}
    </div>
  );
};

export const BorrowingDashboard = () => {
  // Wagmi hooks
  const { address } = useAccount();

  // GraphQL fetching and parsing
  const [result] = useQuery({
    query: BorrowingDashboardDocument,
    variables: {
      walletAddress: address,
    },
  });

  if (result.fetching) return <Loading />;

  return (
    <div className="container-xl">
      <div className="px-xxl-50">
        {/* Header start */}
        <div className="content">
          <h1 className="text-strong fw-700 display-6 mt-0">
            Borrowing Dashboard
          </h1>
          <p className="text-muted mb-0">
            A list of your loans from Liquidity Shops.
          </p>
        </div>
        {/* Header end */}

        {/* Content start */}
        {/* active table start */}
        <div className="card p-0">
          <div className="p-10 text-muted text-center border-bottom border-dotted border-top-0 border-start-0 border-end-0">
            ACTIVE
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
                <div className="text-muted">Lender/Token ID</div>
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

          {/* active table start */}
          {result.data?.loans
            .filter((x) => x.status === "ACTIVE")
            .map((x) => (
              <LoanRow
                {...{
                  lender: x.lender,
                  nftCollectionName: x.liquidityShop.nftCollection.name,
                  tokenId: x.nftyNotesId,
                  amount: x.amount,
                  // TODO: this is static, fix this
                  apr: 10,
                  dueDate: dayjs
                    .unix(x.startTime)
                    .add(x.duration, "days")
                    .toDate(),
                  duration: x.duration,
                  status: x.status,
                  erc20Decimals: x.liquidityShop.erc20.decimals,
                  loanId: parseInt(x.id),
                }}
              />
            ))}
          <div className="p-10 text-muted text-center">
            Total {result.data?.loans.length || 0} Active Loans
          </div>
        </div>
        {/* active table end */}

        {/* inactive table */}
        <div className="card p-0">
          <div className="p-10 text-muted text-center border-bottom border-dotted border-top-0 border-start-0 border-end-0">
            EXPIRED
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
                <div className="text-muted">Lender/Token ID</div>
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

          {/* inactive table start */}
          {result.data?.loans
            .filter((x) => x.status !== "ACTIVE")
            .map((x) => (
              <LoanRow
                {...{
                  lender: x.lender,
                  nftCollectionName: x.liquidityShop.nftCollection.name,
                  tokenId: x.nftyNotesId,
                  amount: x.amount,
                  // TODO: this is static, fix this
                  apr: 10,
                  dueDate: dayjs
                    .unix(x.startTime)
                    .add(x.duration, "days")
                    .toDate(),
                  duration: x.duration,
                  status: x.status,
                  erc20Decimals: x.liquidityShop.erc20.decimals,
                  loanId: parseInt(x.id),
                }}
              />
            ))}
          <div className="p-10 text-muted text-center">
            Total {result.data?.loans.length || 0} Inactive Loans
          </div>
          {/* inactive table end */}
        </div>
        {/* Content end */}
      </div>
    </div>
  );
};
