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

let totalCost: number;

async function createOutput() {
    const table = new Table({ head: [
        'Coin', 
        'Quantity',
        'Total paid',
        'Current value',
        'Average price',
        'Current price',
        'Profit %',
        'Wallet %',
      ]});
    
    const portfolio = await getPortfolio(transactions as Transaction[]);

    portfolio.map(crypto => {
        const { profit } = crypto;
        crypto.coin = chalk.bold(crypto.coin);
        crypto.profit = Number(profit) > 0 ? chalk.green(profit) : chalk.redBright(Number(profit) * -1);
        table.push(Object.values(crypto));
    });
    
    const currentValue = portfolio.reduce((acc, crypto) => acc += crypto.quantity * crypto.currentPrice, 0);
    const profit: number =  ((currentValue/totalCost - 1) * 100);
    const profitFormat = (profit < 1 ? profit * - 1 : profit).toFixed(2);

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
        portfolio.push(result);
    });

    return await calculateCryptoResult(portfolio);
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

const calculateCryptoResult = async(portfolio: Cryptocurrency[]): Promise<Cryptocurrency[]> => {

    const tokens = portfolio.map(currency => currency.coin);
    const prices = await getCryptoPrice(tokens);

    portfolio.map(crypto => {
        const { usd } = prices![crypto.coin.toLocaleLowerCase()];
        const price = Number(usd);

        crypto.totalPaid =  Number(crypto.totalPaid.toFixed(2));
        crypto.currentValue = Number((crypto.quantity * price).toFixed(2))
        crypto.averagePrice = Number((crypto.totalPaid / crypto.quantity).toFixed(2));
        crypto.currentPrice = Number(price.toFixed(2));
        crypto.profit = ((price/crypto.averagePrice - 1) * 100).toFixed(2);

    });

    totalCost = portfolio.reduce((acc, crypto) => acc + crypto.totalPaid, 0); 

    portfolio.map(crypto => {
        crypto.walletPercentage =  Math.round((crypto.totalPaid / totalCost) * 100);
    })

    return portfolio;
}

createOutput();

