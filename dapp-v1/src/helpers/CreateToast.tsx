import ToastComponent, { type ToastProps } from "@/components/ToastComponent";
import { ToastContext } from "@/pages/Base";
import { type ReactElement, useContext } from "react";

const CreateToast = (
  title: string,
  content: string | ReactElement,
  variant: ToastProps["variant"],
  index: number,
  key: string
) => {
  return (
    <ToastComponent title={title} content={content} variant={variant} index={index} key={key} />
  );
};

//Custom hook to use ToastContext
const useToastContext = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }

  return context;
};
export { CreateToast, useToastContext };
