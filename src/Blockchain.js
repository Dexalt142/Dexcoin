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
            this.unconfirmedTransactions = [new Transaction('0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                '045bfa30a15f7808194885ae5ea0f9dbde0b217c20f4a651c09aea192b1a5c537e92861ace98418780f33cd4c48cef261536b444a8c5d551370e8c3fe8edef64d0',
                32)];
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
        let block = new Block([], "0");
        block.hash = '0000000000000000000000000000000000000000000000000000000000000000';

        return block;
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

    getNumberOfTransactions() {
        let transactions = 0;

        for(const block of this.blocks) {
            transactions += block.transactions.length;
        }

        return transactions;
    }

    addTransaction(transaction) {
        if(!transaction.isValid()) {
            return false;
        }

        this.unconfirmedTransactions.push(transaction);
        this.saveBlockchainFile();

        return true;
    }

    getCandidateBlock() {
        if (this.unconfirmedTransactions.length < 1) {
            return null;
        }

        let blockCandidate = new Block(this.unconfirmedTransactions);
        blockCandidate.height = this.getLatestHeight() + 1;
        blockCandidate.prevHash = this.getLatestBlockHash();

        return blockCandidate;
    }

    getMiningCandidate(candidate) {
        return candidate.getDataHash();
    }

    addBlock(minerAddress, timestamp, nonce) {
        let candidate = this.getCandidateBlock();

        if(candidate) {
            candidate.timestamp = timestamp;
            candidate.nonce = nonce;
            candidate.hash = candidate.generateHash();

            let zeros = new Array(this.difficulty + 1).join('0');
            if(candidate.hash.substring(0, this.difficulty) === zeros) {
                this.blocks.push(candidate);

                this.unconfirmedTransactions = [new Transaction('045bfa30a15f7808194885ae5ea0f9dbde0b217c20f4a651c09aea192b1a5c537e92861ace98418780f33cd4c48cef261536b444a8c5d551370e8c3fe8edef64d0', minerAddress, this.miningReward)];
                this.saveBlockchainFile();

                return true;
            }
        }

        return false;
    }

    getBlock(hash) {
        let block = null;

        for(const b of this.blocks) {
            if(b.hash === hash) {
                block = b;
                break;
            }
        }

        return block;
    }

    getBlockAt(height) {
        if(this.blocks[height]) {
            return this.blocks[height];
        }

        return null;
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

    getNewBalance(address) {
        let balance = this.getBalance(address);

        for(const transaction of this.unconfirmedTransactions) {
            if(transaction.from === address) {
                balance -= transaction.amount;
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