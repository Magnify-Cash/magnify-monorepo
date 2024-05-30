/**
 * This is a wrapper around wagmi's useConnect hook that adds some
 * additional functionality.
 */
import { type UseConnectParameters, CreateConnectorFn, Connector } from 'wagmi';
export declare function useConnect({ ...props }?: UseConnectParameters): {
    variables: undefined;
    data: undefined;
    error: null;
    isError: false;
    isIdle: true;
    isPending: false;
    isSuccess: false;
    status: "idle";
    reset: () => void;
    context: unknown;
    failureCount: number;
    failureReason: import("@wagmi/core").ConnectErrorType | null;
    isPaused: boolean;
    submittedAt: number;
    connect: ({ connector, chainId, mutation, }: {
        connector: CreateConnectorFn | Connector;
        chainId?: number | undefined;
        mutation?: UseConnectParameters['mutation'];
    }) => void;
    connectAsync: ({ connector, chainId, mutation, }: {
        connector: CreateConnectorFn | Connector;
        chainId?: number | undefined;
        mutation?: UseConnectParameters['mutation'];
    }) => Promise<import("wagmi/query").ConnectData<import("wagmi").Config>>;
    connectors: readonly Connector[];
} | {
    variables: {
        chainId?: number | undefined;
        connector: CreateConnectorFn | Connector;
    };
    data: undefined;
    error: null;
    isError: false;
    isIdle: false;
    isPending: true;
    isSuccess: false;
    status: "pending";
    reset: () => void;
    context: unknown;
    failureCount: number;
    failureReason: import("@wagmi/core").ConnectErrorType | null;
    isPaused: boolean;
    submittedAt: number;
    connect: ({ connector, chainId, mutation, }: {
        connector: CreateConnectorFn | Connector;
        chainId?: number | undefined;
        mutation?: UseConnectParameters['mutation'];
    }) => void;
    connectAsync: ({ connector, chainId, mutation, }: {
        connector: CreateConnectorFn | Connector;
        chainId?: number | undefined;
        mutation?: UseConnectParameters['mutation'];
    }) => Promise<import("wagmi/query").ConnectData<import("wagmi").Config>>;
    connectors: readonly Connector[];
} | {
    variables: {
        chainId?: number | undefined;
        connector: CreateConnectorFn | Connector;
    };
    data: undefined;
    error: import("@wagmi/core").ConnectErrorType;
    isError: true;
    isIdle: false;
    isPending: false;
    isSuccess: false;
    status: "error";
    reset: () => void;
    context: unknown;
    failureCount: number;
    failureReason: import("@wagmi/core").ConnectErrorType | null;
    isPaused: boolean;
    submittedAt: number;
    connect: ({ connector, chainId, mutation, }: {
        connector: CreateConnectorFn | Connector;
        chainId?: number | undefined;
        mutation?: UseConnectParameters['mutation'];
    }) => void;
    connectAsync: ({ connector, chainId, mutation, }: {
        connector: CreateConnectorFn | Connector;
        chainId?: number | undefined;
        mutation?: UseConnectParameters['mutation'];
    }) => Promise<import("wagmi/query").ConnectData<import("wagmi").Config>>;
    connectors: readonly Connector[];
} | {
    variables: {
        chainId?: number | undefined;
        connector: CreateConnectorFn | Connector;
    };
    data: import("wagmi/query").ConnectData<import("wagmi").Config>;
    error: null;
    isError: false;
    isIdle: false;
    isPending: false;
    isSuccess: true;
    status: "success";
    reset: () => void;
    context: unknown;
    failureCount: number;
    failureReason: import("@wagmi/core").ConnectErrorType | null;
    isPaused: boolean;
    submittedAt: number;
    connect: ({ connector, chainId, mutation, }: {
        connector: CreateConnectorFn | Connector;
        chainId?: number | undefined;
        mutation?: UseConnectParameters['mutation'];
    }) => void;
    connectAsync: ({ connector, chainId, mutation, }: {
        connector: CreateConnectorFn | Connector;
        chainId?: number | undefined;
        mutation?: UseConnectParameters['mutation'];
    }) => Promise<import("wagmi/query").ConnectData<import("wagmi").Config>>;
    connectors: readonly Connector[];
};
