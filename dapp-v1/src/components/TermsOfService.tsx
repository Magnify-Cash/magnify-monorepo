import { useEffect, useState } from "react";

export const TermsOfService = () => {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const hasAccepted = document.cookie
      .split("; ")
      .find((row) => row.startsWith("termsAccepted="));
    if (hasAccepted && hasAccepted.split("=")[1] === "true") {
      setAccepted(true);
    } else {
      const markup = document.getElementById("termsModal");
      if (markup) {
        const modal = window.bootstrap.Modal.getOrCreateInstance(markup);
        modal?.show();
      }
    }
  }, []);

  const handleAccept = () => {
    document.cookie = `termsAccepted=true; max-age=${60 * 60 * 24 * 365}; path=/`; // Cookie expires in 1 year
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div
      className="modal"
      id="termsModal"
      tabIndex={-1}
      data-bs-backdrop="static"
      role="dialog"
      aria-labelledby="termsModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="termsModalLabel">
              Magnify.Cash
            </h5>
          </div>
          <div className="modal-body">
            <p>By clicking Accept you accept the Terms and Conditions</p>
            <p>
              Please accept the{" "}
              <a target="_blank" href="#" rel="noreferrer">
                Terms of Service
              </a>{" "}
              to continue using this website.
            </p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={handleAccept}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
