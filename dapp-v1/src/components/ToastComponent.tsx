import React, { useState, useEffect } from "react";

type ToastVariant = "success" | "error" | "loading";

export interface ToastProps {
  title: string;
  content: string;
  variant: ToastVariant;
}

const ToastComponent: React.FC<ToastProps> = ({ title, content, variant }) => {
  let toastContext = "success";
  let toastIcon = "fa-check-circle";
  if (variant === "error") {
    toastContext = "danger";
    toastIcon = "fa-fire";
  } else if (variant === "loading") {
    toastContext = "primary";
    toastIcon = "fa-spinner fa-spin";
  }
  //Shows or hides the toast depending on the value
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000); // Change this value to adjust the time before the toast hides

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className={`toast fade ${show ? "show" : "hide"}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{ width: "400px", backgroundColor: "var(--bs-content-bg)" }}
    >
      <div className="toast-body p-3">
        <div className="d-flex align-items-center">
          <div
            className={`d-flex align-items-center justify-content-center rounded text-${toastContext}-emphasis bg-${toastContext}-subtle fs-5 flex-shrink-0 align-self-start`}
            style={{ width: "36px", height: "36px" }}
          >
            <i className={`fa-solid ${toastIcon}`}></i>
          </div>
          <div className="mx-3">
            <div className="h5 mb-1">{title}</div>
            <p
              className="text-body-secondary mb-0"
              style={{ fontSize: "12px" }}
            >
              {content}
            </p>
          </div>
          <button
            type="button"
            className="btn-close ms-auto"
            data-bs-dismiss="toast"
            aria-label="Close"
          ></button>
        </div>
      </div>
      <div
        className={`bg-${toastContext} w-100 mt-1 rounded-bottom`}
        style={{ height: "10px" }}
      ></div>
    </div>
  );
};

export default ToastComponent;
