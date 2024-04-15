const LoadingIndicator: React.FC = () => {
  return (
    <div className="d-flex align-items-center py-2">
      <div>Loading...</div>
      <div className="loading-indicator ps-2">
        <div className="spinner-border text-primary" role="status" />
      </div>
    </div>
  );
};

export default LoadingIndicator;

interface SpinnerProps {
  show?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Spinner: React.FC<SpinnerProps> = ({ size = "md", show = false }) => {
  let style;

  switch (size) {
    case "sm":
      style = { width: "1rem", height: "1rem", borderWidth: "0.1rem" };
      break;
    case "md":
      style = { width: "1.5rem", height: "1.5rem", borderWidth: "0.2rem" };
      break;
    case "lg":
      style = { width: "2rem", height: "2rem", borderWidth: "0.2rem" };
      break;
    default:
      style = { width: "1.5rem", height: "1.5rem", borderWidth: "0.2rem" };
  }

  style.display = show ? "inline-block" : "none";

  return (
    <div className="spinner-border text-body-tertiary" role="status" style={style}>
      <span className="visually-hidden">Loading...</span>
    </div>
  );
};
