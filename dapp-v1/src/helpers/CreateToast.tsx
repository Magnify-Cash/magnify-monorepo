import ToastComponent, { ToastProps } from "@/components/ToastComponent";
import { useContext } from "react";
import { ToastContext } from "@/pages/Base";

const CreateToast = (
  title: string,
  content: string,
  variant: ToastProps["variant"],
  index: number
) => {
  return (
    <ToastComponent
      title={title}
      content={content}
      variant={variant}
      key={index}
    />
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
