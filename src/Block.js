const SHA256 = require('crypto-js/sha256');

class Block {

    constructor(transactions, prevHash = '0') {
        this.transactions = transactions;
        this.timestamp = '';
        this.hash = ''
        this.prevHash = prevHash;
        this.nonce = "0x0";
    }

    generateHash() {
        return SHA256(`${this.timestamp}${this.transactions}${this.prevHash}${this.nonce}`).toString();
    }

    mineBlock(difficulty) {
        let zeros = new Array(difficulty + 1).join('0');
        while(this.hash.substring(0, difficulty) !== zeros) {
            this.nonce = `0x${(parseInt(this.nonce, 16) + 1).toString(16)}`;
            this.timestamp = new Date();
            this.hash = this.generateHash();
        }

        return true;
    }

}

module.exports = Block;