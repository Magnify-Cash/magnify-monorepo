interface LendingDeskProps extends CollectionProps {
  name: string;
  currrencyType: string;
}

interface CollectionProps {
  id: string;
  collectionName: string;
  offer: string;
  duration: string;
  interestRate: string;
}

export const LendingDeskDetails: React.FC<LendingDeskProps> = (props) => {
  return (
    <div className="card border-0 shadow rounded-4 mb-4">
      <div className="card-body p-4">
        <h5 className="fw-medium text-body-secondary mb-4">
          Lending Desk Details
        </h5>
        <div className="pb-2 mb-2 border-bottom">
          <div className="text-body-secondary">Name</div>
          <div className="mt-1 fs-5">{props.name}</div>
        </div>
        <div className="pb-2 mb-2 border-bottom">
          <div className="text-body-secondary">Currency Type</div>
          <div className="mt-1 fs-5 d-flex align-items-center">
            <img
              src="theme/images/image-8.svg" //TODO use respective image
              height="24"
              className="d-block rounded-circle flex-shrink-0 me-2"
              alt="Image"
            />
            <div className="text-truncate">{props.currrencyType}</div>
          </div>
        </div>
        <Collection {...props} />
      </div>
    </div>
  );
};

const Collection: React.FC<CollectionProps> = (props) => {
  return (
    <div className="pb-2 mb-2">
      <div className="d-flex align-items-center">
        <div className="text-body-secondary text-truncate">
          Collection {props.id}
        </div>
        <div className="flex-shrink-0 ms-auto">
          <span className="text-body-secondary me-2">
            <a
              href="#"
              className="text-reset text-decoration-none"
              aria-lable="Edit"
            >
              <i className="fa-regular fa-edit"></i>
            </a>
          </span>
          <span className="text-danger-emphasis">
            <a
              href="#"
              className="text-reset text-decoration-none"
              aria-lable="Delete"
            >
              <i className="fa-regular fa-trash-can"></i>
            </a>
          </span>
        </div>
      </div>
      <div className="mt-2 fs-5 d-flex align-items-center">
        <img
          src="theme/images/image-4.png"
          height="24"
          className="d-block rounded-circle flex-shrink-0 me-2"
          alt="Image"
        />
        <div className="text-truncate fw-medium">{props.collectionName}</div>
      </div>
      <div className="mt-2 d-flex align-items-center">
        <span className="flex-shrink-0 specific-w-25">
          <i className="fa-light fa-hand-holding-dollar text-success-emphasis"></i>
        </span>
        <div className="text-truncate">
          <strong>Offer:</strong> {props.offer}
        </div>
      </div>
      <div className="mt-1 d-flex align-items-center">
        <span className="flex-shrink-0 specific-w-25">
          <i className="fa-light fa-calendar-clock text-info-emphasis"></i>
        </span>
        <div className="text-truncate">
          <strong>Duration:</strong> {props.duration}
        </div>
      </div>
      <div className="mt-1 d-flex align-items-center">
        <span className="flex-shrink-0 specific-w-25">
          <i className="fa-light fa-badge-percent text-primary-emphasis"></i>
        </span>
        <div className="text-truncate">
          <strong>Interest Rate:</strong> {props.interestRate}%
        </div>
      </div>
    </div>
  );
};
