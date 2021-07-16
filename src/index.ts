import 'dotenv/config'
import fs from 'fs'

import { Transaction, Cryptocurrency, TransactionType } from "./models";
import { groupBy, getCryptoPrice } from './utils';

const PATH = process.env.TRANSACTIONS_PATH;

const { transactions } = JSON.parse(fs.readFileSync(PATH, "utf8"));

const reduceTransactions = (accumulator: Cryptocurrency, transaction: Transaction) => {
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

const addCurrentCryptoPriceAndYield = async(portfolio: Cryptocurrency[]) => {

    const tokens = portfolio.map(currency => currency.token);
    const prices = await getCryptoPrice(tokens);

    if(prices) {
        portfolio.map(crypto => {
            const { token, averagePrice } = crypto;  
            const { usd } = prices[token];
            const price = Number(usd);
            crypto.currentPrice = price;
            crypto.yield = (price/averagePrice - 1) * 100;
        });
    }

    return portfolio;
}

(async function (transactions: Transaction[]): Promise<void> {
    const transactionsMap = groupBy(transactions, (transaction: Transaction) => transaction.token);
    
    let portfolio: Cryptocurrency[] = []; 

    transactionsMap.forEach((transactions: Transaction[]) => {

        const result = transactions.reduce(reduceTransactions, { token: transactions[0].token, quantity: 0, totalPaid: 0 } as Cryptocurrency);
        result.averagePrice = Number((result.totalPaid / result.quantity));
        
        portfolio.push(result);
    });

    portfolio = await addCurrentCryptoPriceAndYield(portfolio);
    console.log(portfolio);

}(transactions as Transaction[]));


