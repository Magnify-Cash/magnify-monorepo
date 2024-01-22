import ToastComponent, { ToastProps } from "@/components/ToastComponent";

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

export { CreateToast };
