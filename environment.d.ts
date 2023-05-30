export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PRIVATE_KEY: string;
      INFURA_API_KEY: string;
      VITE_CHAIN_NAME: string;
      VITE_NFTY_TOKEN_ADDRESS: string;
      VITE_ALCHEMY_API_KEY: string;
    }
  }
}
