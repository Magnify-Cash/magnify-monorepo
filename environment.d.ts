export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PRIVATE_KEY: string;
      INFURA_API_KEY: string;
      VITE_CHAIN_NAME: string;
    }
  }
}
