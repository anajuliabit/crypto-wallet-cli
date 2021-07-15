declare global {
    namespace NodeJS {
      interface ProcessEnv {
        PORT?: string;
        TRANSACTIONS_PATH: string;
        CMC_API_KEY: string;
        CMC_API_URL: string
      }
    }
}
  
export {}