// Define the refetchData function. It accepts a function reexecuteQuery as a parameter.
const refetchData = (reexecuteQuery: () => void) => {
  console.log("Refetching data...");
  // Set an interval to call reexecuteQuery continuously.
  // The intervalId is the ID of this interval, which can be used to clear it later.
  const intervalId = setInterval(() => {
    reexecuteQuery();
  }, 500); // 0.5 seconds

  // Set a timeout to clear the interval.
  setTimeout(() => {
    clearInterval(intervalId);
  }, 5000); // 5 seconds
};

export default refetchData;
