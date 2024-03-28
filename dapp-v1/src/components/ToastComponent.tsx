import React, { useState, useEffect, ReactElement } from "react";

type ToastVariant = "success" | "error" | "warning" | "loading";

export interface ToastProps {
  title: string;
  content: string | ReactElement;
  variant: ToastVariant;
  index: number;
  hide?: boolean;
}

const ToastComponent: React.FC<ToastProps> = ({
  title,
  content,
  variant,
  index,
  hide = false,
}) => {
  let toastContext = "success";
  let toastIcon = "fa-check-circle";
  if (variant === "error") {
    toastContext = "danger";
    toastIcon = "fa-fire";
  } else if (variant === "loading") {
    toastContext = "primary";
    toastIcon = "fa-spinner fa-spin";
  } else if (variant === "warning") {
    toastContext = "warning";
    toastIcon = "fa-diamond-exclamation";
  }
  //Shows or hides the toast depending on the value
  const [show, setShow] = useState(!hide);

  //This hook is used to hide the toast when the hide prop is changed
  useEffect(() => {
    setShow(!hide);
  }, [hide]);

  //This hook is used to hide the toast if the hide prop is true
  useEffect(() => {
    setShow(!hide);
  }, [hide]);

  //This hook is used to hide the toast after a certain amount of time
  //The toast will not hide automatically if the variant is "loading"
  useEffect(() => {
    if (variant !== "loading") {
      const timer = setTimeout(() => {
        setShow(false);
      }, 3000); // Change this value to adjust the time before the toast hides

      return () => {
        clearTimeout(timer);
      };
    }
  }, []);

  return (
    <div
      className={`toast fade ${show ? "show" : "hide"}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      data-bs-autohide="false" //Auto hide is achieved using the useEffect hook
      style={{ width: "400px", backgroundColor: "var(--bs-content-bg)" }}
      key={index}
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
            aria-label="Close"
            onClick={() => {
              setShow(false);
            }}
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
