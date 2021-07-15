import 'dotenv/config'
import fs from 'fs'

import { Transaction, TokenResult, TransactionType } from "./models";
import { groupBy, getCryptoPrice } from './utils';

// getCryptoPrice('ETH');

const PATH = process.env.TRANSACTIONS_PATH;

const { transactions } = JSON.parse(fs.readFileSync(PATH, "utf8"));

const reduceTransactions = (accumulator: TokenResult, transaction: Transaction) => {
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

(function (transactions: Transaction[]): void {
    const transactionsMap = groupBy(transactions, (transaction: Transaction) => transaction.token);

    transactionsMap.forEach((transactions: Transaction[]) => {

        const result = transactions.reduce(reduceTransactions, { token: transactions[0].token, quantity: 0, totalPaid: 0 } as TokenResult);
        result.averagePrice = (result.totalPaid / result.quantity).toPrecision(4);

        console.log(result);
    });

}(transactions as Transaction[]));


