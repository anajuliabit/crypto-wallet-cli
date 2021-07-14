import 'dotenv/config'
import fs from 'fs'

import { Transaction, TokenResult, TransactionType } from "./models";

const PATH = process.env.TRANSACTIONS_PATH;

const { transactions } = JSON.parse(fs.readFileSync(PATH, "utf8"));

(function (transactions: Array<Transaction>): TokenResult {

    const reduceTransactions = (accumulator: TokenResult, transaction: Transaction): TokenResult => {
        const { type, quantity, totalPaid } = transaction;
        if(type === TransactionType.BUY) {
            accumulator.quantity += quantity; 
            accumulator.totalPaid += totalPaid;
            return accumulator;
        }
        
        accumulator.quantity -= quantity;
        accumulator.totalPaid -= totalPaid;
        return accumulator;
    }
    return transactions.reduce(reduceTransactions, { quantity: 0, totalPaid: 0 } as TokenResult);
}(transactions as Array<Transaction>));

