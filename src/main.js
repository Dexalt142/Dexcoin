const Blockchain = require('./Blockchain');
const Inquirer = require('inquirer');

let difficulty = 5;
let Dexcoin = new Blockchain(difficulty);

const createTransaction = () => {
    let amount = Math.round(Math.random() * 100);
    Dexcoin.createTransaction('John', 'Doe', amount);
    console.log("From   : John");
    console.log("To     : Doe");
    console.log(`Amount : ${amount}`);
    console.log("New transaction saved\n");
};

const viewPendingTransactions = () => {
    if(Dexcoin.pendingTransactions.length > 0) {
        Dexcoin.pendingTransactions.map(tx => {
            console.log("--------------------------------------------------------------------------------");
            console.log(`From      : ${tx.from}`);
            console.log(`To        : ${tx.to}`);
            console.log(`Amount    : ${tx.amount}`);
            console.log(`Timestamp : ${tx.timestamp}`);
            console.log("--------------------------------------------------------------------------------\n");
        });
    } else {
        console.log("No transaction.\n");
    }
};

const viewBlocks = () => {
    if(Dexcoin.blocks.length > 0 ){
        Dexcoin.blocks.map(block => {
            console.log("----------------------------------------------------------------------------------------------------");
            console.log(`Transactions  : ${block.transactions.length}`);
            console.log(`Hash          : ${block.hash}`);
            console.log(`Previous Hash : ${block.prevHash}`);
            console.log(`Nonce         : ${block.nonce}`);
            console.log(`Timestamp     : ${block.timestamp}`);
            console.log("----------------------------------------------------------------------------------------------------\n");
        });
    } else {
        console.log("No block.\n");
    }
};

const mineBlock = () => {
    let startTime = new Date();
    let endTime = null;
    let timeElapsed = null;
    let currentBlock = null;

    console.log(`Processing ${Dexcoin.pendingTransactions.length} transactions.`);
    console.log('Mining block, please wait.');

    currentBlock = Dexcoin.createBlock();
    endTime = new Date();
    timeElapsed = (endTime - startTime) / 1000;

    console.log("----------------------------------------------------------------------------------------------------");
    console.log(`Hash          : ${currentBlock.hash}`);
    console.log(`Nonce         : ${currentBlock.nonce}`);
    console.log(`Timestamp     : ${currentBlock.timestamp}`);
    console.log("----------------------------------------------------------------------------------------------------");

    console.log(`Block found. Time elapsed: ${timeElapsed} second(s).\n`);
};

const mainMenu = () => {
    Inquirer.prompt([
        {
            type: 'list',
            name: 'main_menu',
            message: 'Select one of these options',
            loop: true,
            choices: [
                'Create transaction',
                'View pending transactions',
                'View blocks',
                'Mine block',
                'Clear console',
                'Exit'
            ]
        }
    ]).then(answer => {
        if(answer.main_menu === 'Create transaction') {
            createTransaction();
        } else if(answer.main_menu === 'View pending transactions') {
            viewPendingTransactions();
        } else if(answer.main_menu === 'View blocks') {
            viewBlocks();
        } else if(answer.main_menu === 'Mine block') {
            mineBlock();
        } else if(answer.main_menu === 'Clear console') {
            console.clear();
        } else if(answer.main_menu === 'Exit') {
            process.exit();
        }
        
        mainMenu();
    });
};

console.clear();
mainMenu();