export const formatAddress = (address: string) => {
  //Checks if address is a valid wallet address
  if (!address.startsWith("0x")) {
    console.log("Address does not start with 0x");
    return "";
  }
  return `${address.slice(0, 6)}...${address.slice(-8)}`;
};
