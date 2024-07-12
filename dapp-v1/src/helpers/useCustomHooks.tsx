import { config } from "@/wagmi";
import { magnifyCashV1Abi, magnifyCashV1Address } from "@/wagmi-generated";
import { watchContractEvent } from "@wagmi/core";
import { useEffect } from "react";
import { useChainId } from "wagmi";

/**
 * Custom Hook to watch for contract events.
 *
 * @param {Object} params - The parameters for watching contract events.
 * @param {string} params.eventName - The name of the contract event to watch.
 * @param {Function} params.onLogs - Callback function to handle the event logs.
 */
const useCustomWatchContractEvent = ({ eventName, onLogs }) => {
  // Retrieve the current chain ID using the useChainId hook from wagmi.
  const chainId = useChainId();

  useEffect(() => {
    // Start watching the specified contract event using the watchContractEvent function from @wagmi/core.
    // This function requires the contract configuration, including the address, ABI, event name, and a callback function.
    const unwatch = watchContractEvent(config, {
      address: magnifyCashV1Address[chainId],
      abi: magnifyCashV1Abi,
      eventName, // Name of the event to watch.
      onLogs, // Callback function to handle the event logs.
    });

    // Return a cleanup function that will be called when the component unmounts or when the dependencies of the effect change.
    // This function calls the unwatch function to stop watching the contract event.
    return () => {
      unwatch();
    };
  }, [eventName, chainId]); // Effect dependencies: the effect will rerun whenever eventName or chainId changes.
};

export { useCustomWatchContractEvent };
