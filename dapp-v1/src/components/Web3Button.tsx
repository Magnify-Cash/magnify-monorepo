type Web3Button = {
  loading?: boolean;
  isConnected?: boolean;
  error?: any | null;
  onClick?: Function;
  className: string;
  children?: React.ReactNode;
};
export const Web3Button = ({
  onClick,
  error,
  loading,
  className,
  isConnected,
  children,
}: Web3Button) => {
  if (isConnected === false) {
    return (
      <button className={className} disabled={true}>
        Connect Wallet
      </button>
    );
  }
  if (error) {
    return (
      <button className={className} disabled={true}>
        {error.reason}
      </button>
    );
  }
  if (loading) {
    return (
      <button className={className} disabled={true}>
        Loading...
      </button>
    );
  }
  return (
    <button
      className={className}
      disabled={loading || !!error}
      onClick={() => onClick?.()}
    >
      {children}
    </button>
  );
};
