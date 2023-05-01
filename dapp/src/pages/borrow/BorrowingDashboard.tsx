import { BorrowingDashboardDocument } from "../../../.graphclient";
import { useQuery } from "urql";
import { useAccount } from "wagmi";
import dayjs from "dayjs";
import { Loading } from "@/components";

type ActiveLoan = {
  nftCollectionName: string;
  lender: string;
  tokenId: BigInt;
  amount: number;
  apr: number;
  dueDate: Date;
  duration: number;
};

const ActiveLoanRow = ({
  nftCollectionName,
  lender,
  tokenId,
  amount,
  apr,
  dueDate,
  duration,
}: ActiveLoan) => {
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
            <div>{lender}</div>
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
            <div>${amount}</div>
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
        <div className="p-10 text-center">
          <button className="btn btn-success btn-sm ws-150 mw-100">
            Pay Now
          </button>
        </div>
      </div>
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

          {result.data?.loans.map((x) => (
            <ActiveLoanRow
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
              }}
            />
          ))}
          <div className="p-10 text-muted text-center">
            Total {result.data?.loans.length} Active Loans
          </div>
        </div>
        {/* active table end */}

        {/* pending table start */}
        <div className="card p-0">
          <div className="p-10 text-muted text-center border-bottom border-dotted border-top-0 border-start-0 border-end-0">
            PENDING
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
                <div className="text-muted">Token ID</div>
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

          {/* Row start */}
          <div className="row border-bottom">
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Collection
                </div>
                <div>Bored Apes Yacht Club</div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Token ID
                </div>
                <div>Token ID</div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Amount/APR
                </div>
                <div>
                  <div>$999.99</div>
                  <div className="text-muted fs-base-n2">APR: 15%</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Due/Duration
                </div>
                <div>
                  <div>July 1, 2022</div>
                  <div className="text-muted fs-base-n2">Duration: 10 Days</div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 align-self-center">
              <div className="p-10 text-center">
                <div className="btn btn-warning ws-200 mw-100 px-5 mx-auto pe-none">
                  <i className="fa-solid fa-hourglass me-5"></i>
                  Pending
                </div>
              </div>
            </div>
          </div>
          {/* Row end */}

          {/* Row start */}
          <div className="row border-bottom">
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Collection
                </div>
                <div>Bored Apes Yacht Club</div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Token ID
                </div>
                <div>Token ID</div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Amount/APR
                </div>
                <div>
                  <div>$999.99</div>
                  <div className="text-muted fs-base-n2">APR: 15%</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Due/Duration
                </div>
                <div>
                  <div>July 1, 2022</div>
                  <div className="text-muted fs-base-n2">Duration: 10 Days</div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 align-self-center">
              <div className="p-10 text-center">
                <div className="btn btn-warning ws-200 mw-100 px-5 mx-auto pe-none">
                  <i className="fa-solid fa-hourglass me-5"></i>
                  Pending
                </div>
              </div>
            </div>
          </div>
          {/* Row end */}

          {/* Row start */}
          <div className="row border-bottom">
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Collection
                </div>
                <div>Bored Apes Yacht Club</div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Token ID
                </div>
                <div>Token ID</div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Amount/APR
                </div>
                <div>
                  <div>$999.99</div>
                  <div className="text-muted fs-base-n2">APR: 15%</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Due/Duration
                </div>
                <div>
                  <div>July 1, 2022</div>
                  <div className="text-muted fs-base-n2">Duration: 10 Days</div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 align-self-center">
              <div className="p-10 text-center">
                <div className="btn btn-danger ws-200 mw-100 px-5 mx-auto pe-none">
                  <i className="fa-solid fa-times me-5"></i>
                  Declined
                </div>
              </div>
            </div>
          </div>
          {/* Row end */}

          {/* Row start */}
          <div className="row border-bottom">
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Collection
                </div>
                <div>Bored Apes Yacht Club</div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Token ID
                </div>
                <div>Token ID</div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Amount/APR
                </div>
                <div>
                  <div>$999.99</div>
                  <div className="text-muted fs-base-n2">APR: 15%</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Due/Duration
                </div>
                <div>
                  <div>July 1, 2022</div>
                  <div className="text-muted fs-base-n2">Duration: 10 Days</div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 align-self-center">
              <div className="p-10 text-center">
                <div className="btn btn-warning ws-200 mw-100 px-5 mx-auto pe-none">
                  <i className="fa-solid fa-hourglass me-5"></i>
                  Pending
                </div>
              </div>
            </div>
          </div>
          {/* Row end */}

          {/* Row start */}
          <div className="row border-bottom">
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Collection
                </div>
                <div>Bored Apes Yacht Club</div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Token ID
                </div>
                <div>Token ID</div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Amount/APR
                </div>
                <div>
                  <div>$999.99</div>
                  <div className="text-muted fs-base-n2">APR: 15%</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Due/Duration
                </div>
                <div>
                  <div>July 1, 2022</div>
                  <div className="text-muted fs-base-n2">Duration: 10 Days</div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 align-self-center">
              <div className="p-10 text-center">
                <div className="btn btn-success ws-200 mw-100 px-5 mx-auto pe-none">
                  <i className="fa-solid fa-check me-5"></i>
                  Confirmed
                </div>
              </div>
            </div>
          </div>
          {/* Row end */}
          <div className="p-10 text-muted text-center">Total 5 Approvals</div>
        </div>
        {/* pending table end */}

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

          {/* Row start */}
          <div className="row border-bottom">
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Collection
                </div>
                <div>Bored Apes Yacht Club</div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Lender/Token ID
                </div>
                <div>
                  <div>Lender</div>
                  <div className="text-muted fs-base-n2 text-truncate">
                    Token ID
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
                  <div>$999.99</div>
                  <div className="text-muted fs-base-n2">APR: 15%</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Due/Duration
                </div>
                <div>
                  <div>July 1, 2022</div>
                  <div className="text-muted fs-base-n2">Duration: 10 Days</div>
                </div>
              </div>
            </div>
            <div className="col-sm-10 col-md-8 col-lg-4 align-self-center mx-auto">
              <div className="p-10 text-center">Expired</div>
            </div>
          </div>
          {/* Row end */}

          {/* Row start */}
          <div className="row border-bottom">
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Collection
                </div>
                <div>Bored Apes Yacht Club</div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Lender/Token ID
                </div>
                <div>
                  <div>Lender</div>
                  <div className="text-muted fs-base-n2 text-truncate">
                    Token ID
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
                  <div>$999.99</div>
                  <div className="text-muted fs-base-n2">APR: 15%</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Due/Duration
                </div>
                <div>
                  <div>July 1, 2022</div>
                  <div className="text-muted fs-base-n2">Duration: 10 Days</div>
                </div>
              </div>
            </div>
            <div className="col-sm-10 col-md-8 col-lg-4 align-self-center mx-auto">
              <div className="p-10 text-center">Expired</div>
            </div>
          </div>
          {/* Row end */}

          {/* Row start */}
          <div className="row border-bottom">
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Collection
                </div>
                <div>Bored Apes Yacht Club</div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Lender/Token ID
                </div>
                <div>
                  <div>Lender</div>
                  <div className="text-muted fs-base-n2 text-truncate">
                    Token ID
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
                  <div>$999.99</div>
                  <div className="text-muted fs-base-n2">APR: 15%</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-2 align-self-lg-center">
              <div className="p-10 text-lg-center">
                <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
                  Due/Duration
                </div>
                <div>
                  <div>July 1, 2022</div>
                  <div className="text-muted fs-base-n2">Duration: 10 Days</div>
                </div>
              </div>
            </div>
            <div className="col-sm-10 col-md-8 col-lg-4 align-self-center mx-auto">
              <div className="p-10 text-center">Expired</div>
            </div>
          </div>
          {/* Row end */}

          <div className="p-10 text-muted text-center">
            Total 3 Expired Loans
          </div>
        </div>
        {/* Content end */}
      </div>
    </div>
  );
};
