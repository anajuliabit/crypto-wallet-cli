declare global {
    namespace NodeJS {
      interface ProcessEnv {
        PORT?: string;
        TRANSACTIONS_PATH: string;
        API_URL: string
      }
    }
}
  
export {}