import 'dotenv/config'
import fs from 'fs'
import { Command } from 'commander';
import Table from 'cli-table';
import chalk from 'chalk';

import { Transaction, Cryptocurrency, TransactionType } from "./models";
import { groupBy, getCryptoPrice } from './utils';

const cli = new Command();
cli.version('0.0.1').option('-p, --path <path>', 'Path to transactions file').parse(process.argv);

const { path } = cli.opts();
const { transactions } = JSON.parse(fs.readFileSync(path, "utf8"));

let currentValue: number;

async function output() {
    const table = new Table({ head: [
        'Coin', 
        'Quantity',
        'Average price',
        'Current price',
        'Total paid',
        'Profit %',
        'Wallet %',
      ]});
    
    const portfolio = await getPortfolio(transactions as Transaction[]);

    portfolio.forEach(crypto => {
        table.push(Object.values(crypto))
    });
    
    const totalCost: number = portfolio.reduce((acc, crypto) => acc + crypto.totalPaid, 0); 
    const profit: number =  ((currentValue/totalCost - 1) * 100);
    const profitFormat = Number((profit < 1 ? profit * - 1 : profit).toFixed(2));

    console.log('Total cost:', chalk.blue(totalCost, '$'));
    console.log('Current value $:', chalk.blue(currentValue, '$'));
    console.log('Profit:', profit - 1 ? chalk.redBright(profitFormat, '%') : chalk.green(profitFormat, '%'))
    console.log(table.toString());
}

async function getPortfolio(transactions: Transaction[]): Promise<Cryptocurrency[]> {
    const transactionsMap = groupBy(transactions, (transaction: Transaction) => transaction.coin);

    let portfolio: Cryptocurrency[] = []; 

    transactionsMap.forEach((transactions: Transaction[]) => {
        const result = transactions.reduce(reduceTransactions, { coin: transactions[0].coin.toLocaleUpperCase(), quantity: 0, totalPaid: 0 } as Cryptocurrency);
        result.averagePrice = Number((result.totalPaid / result.quantity));
        
        portfolio.push(result);
    });

    return await addInformations(portfolio);
}


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

const addInformations = async(portfolio: Cryptocurrency[]): Promise<Cryptocurrency[]> => {

    const tokens = portfolio.map(currency => currency.coin);
    const prices = await getCryptoPrice(tokens);

    portfolio.map(crypto => {
        const { coin, averagePrice } = crypto;  
        const { usd } = prices![coin.toLocaleLowerCase()];
        const price = Number(usd);
        
        crypto.currentPrice = price;
        crypto.profit = (price/averagePrice - 1) * 100;

    });

    currentValue= portfolio.reduce((acc, crypto) => acc += crypto.quantity * crypto.currentPrice, 0);
    
    portfolio.map(crypto => {
        crypto.walletPercentage = (crypto.totalPaid / currentValue) * 100 ;
    })

    return portfolio;
}

output();

