const SHA256 = require('crypto-js/sha256');

class Block {

    constructor(transactions, prevHash = '0') {
        this.height = 0;
        this.transactions = transactions;
        this.timestamp = '';
        this.hash = ''
        this.prevHash = prevHash;
        this.nonce = "0x0";
    }

    getDataHash() {
        return SHA256(`${this.height}${this.prevHash}${JSON.stringify(this.data)}`).toString();
    }

    generateHash() {
        return SHA256(`${this.getDataHash()}${this.timestamp}${this.nonce}`).toString();
    }

}

module.exports = Block;