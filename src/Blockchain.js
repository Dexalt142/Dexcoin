const Block = require('./Block');
const Transaction = require('./Transaction');

class Blockchain {

    constructor(difficulty) {
        this.blocks = [];
        this.pendingTransactions = [];
        this.difficulty = difficulty;
    }

    getLatestBlock() {
        return this.blocks[this.blocks.length - 1];
    }

    isGenesisBlock() {
        return this.getLatestBlock() == null;
    }

    createBlock() {
        let block = new Block(this.pendingTransactions);
        if(!this.isGenesisBlock()) {
            block.prevHash = this.getLatestBlock().hash;
        }

        if(block.mineBlock(this.difficulty)) {
            this.blocks.push(block);
            this.pendingTransactions = [];

            return block;
        }
    }

    createTransaction(from, to, amount) {
        let transaction = new Transaction(from, to, amount);
        this.pendingTransactions.push(transaction);
    }

}

module.exports = Blockchain;