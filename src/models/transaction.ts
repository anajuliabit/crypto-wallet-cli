export enum TransactionType {
    BUY = "BUY",
    SELL = "SELL"
}

export type Transaction = {
    coin: string;
    quantity: number;
    orderPrice: number;
    totalPaid: number;
    fees?: number;
    type: TransactionType;
    date?: Date;
  };
  