const Block = require('./Block');
const Transaction = require('./Transaction');
const LZString = require('lz-string');
const fs = require('fs');

class Blockchain {

    constructor(difficulty) {
        try {
            this.loadBlockchainFile();
        } catch (e) {
            this.blocks = [this.initializeBlockchain()];
            this.unconfirmedTransactions = [];
            this.difficulty = difficulty;
            this.miningReward = 32;
            this.saveBlockchainFile();
        }
    }

    saveBlockchainFile() {
        let data = LZString.compressToUTF16(JSON.stringify(this));
        fs.writeFileSync('./dexcoin.dex', data);
    }

    loadBlockchainFile() {
        let blockchainFile = fs.readFileSync('./dexcoin.dex');
        let data = JSON.parse(LZString.decompressFromUTF16(blockchainFile.toString()));

        if(data) {
            this.blocks = data.blocks;
            this.unconfirmedTransactions = data.unconfirmedTransactions;
            this.difficulty = data.difficulty;
            this.miningReward = data.miningReward;
        } else {
            throw new Error('Blockchain file invalid');
        }
    }

    initializeBlockchain() {
        return new Block("Dexcoin Genesis Block", "0");
    }

    getLatestBlock() {
        return this.blocks[this.blocks.length - 1];
    }

    getLatestBlockHash() {
        return this.getLatestBlock().hash;
    }

    getLatestHeight() {
        return this.getLatestBlock().height;
    }

    addTransaction(transaction) {
        if(!transaction.isValid()) {
            return false;
        }

        this.unconfirmedTransactions.push(transaction);
        this.saveBlockchainFile();

        return true;
    }

    confirmTransaction(minerAddress) {
        if(this.unconfirmedTransactions.length < 1) {
            return false;
        }

        let newBlock = new Block(this.unconfirmedTransactions);
        newBlock.height = this.getLatestHeight() + 1;
        newBlock.prevHash = this.getLatestBlockHash();

        newBlock.mineBlock(this.difficulty);
        this.blocks.push(newBlock);

        this.unconfirmedTransactions = [new Transaction(null, minerAddress, this.miningReward)];
        this.saveBlockchainFile();

        return true;
    }

    getBalance(address) {
        let balance = 0;

        for(const block of this.blocks) {
            for(const transaction of block.transactions) {
                if(transaction.from === address) {
                    balance -= transaction.amount;
                }

                if(transaction.to === address) {
                    balance += transaction.amount;
                }
            }
        }

        return balance;
    }

    getTransaction(hash) {
        for(const block of this.blocks) {
            for(const tx of block.transactions) {
                if(tx.hash === hash) {
                    return tx;
                }
            }
        }

        return null;
    }

    isChainValid() {
        for(let i = 1; i < this.blocks.length; i++) {
            let currentBlock = this.blocks[i];
            let previousBlock = this.blocks[i-1];

            if(!currentBlock.hasValidTransaction()) {
                return false;
            }

            if(currentBlock.hash !== currentBlock.generateHash()) {
                return false;
            }

            if(currentBlock.prevHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }

}

module.exports = Blockchain;