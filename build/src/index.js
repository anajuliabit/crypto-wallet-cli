import fs from 'fs';
import { TransactionType } from "./types";
var path = process.env.TRANSACTIONS_PATH;
console.log('path', path);
if (path) {
    var data = fs.readFileSync(path, "utf8");
    console.log(data);
}
function calculateTransaction(transactions) {
    var reduceTransactions = function (accumulator, transaction) {
        var type = transaction.type, quantity = transaction.quantity, totalPaid = transaction.totalPaid;
        if (type === TransactionType.BUY) {
            accumulator.quantity += quantity;
            accumulator.totalPaid += totalPaid;
            return accumulator;
        }
        accumulator.quantity -= quantity;
        accumulator.totalPaid -= totalPaid;
        return accumulator;
    };
    var result = transactions.reduce(reduceTransactions, { quantity: 0, totalPaid: 0 });
    return result;
}
// console.log(transactions);
// calculateTransaction(JSON.parse(transactions) as Array<Transaction>);
