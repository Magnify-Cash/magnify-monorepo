import { ContractTransactionResponse, EventLog, Log, Result } from "ethers";

const isEventLog = (log: Log | EventLog): log is EventLog =>
  log instanceof EventLog;

export const getEvent = async (
  tx: ContractTransactionResponse,
  eventName: string
): Promise<Result | undefined> => {
  const receipt = await tx.wait();
  const event = receipt?.logs
    ?.filter(isEventLog)
    .find((event) => event.eventName == eventName)?.args;

  return event;
};

export const getEventNames = async (
  tx: ContractTransactionResponse
): Promise<string[]> => {
  const receipt = await tx.wait();
  const eventNames =
    receipt?.logs?.filter(isEventLog)?.map((x) => x.eventName) || [];
  return eventNames;
};
