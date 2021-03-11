const SHA256 = require('crypto-js/sha256');
const elliptic = require('elliptic').ec;
const secp256k1 = new elliptic('secp256k1');

class Transaction {

    constructor(from, to, amount) {
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.timestamp = new Date().getTime();
        this.hash = this.generateHash();
    }

    generateHash() {
        return SHA256(`${this.from}${this.to}${this.amount}${this.timestamp}`).toString();
    }

    signTransaction(key) {
        if(key.getPublic('hex') !== this.from) {
            return false;
        }

        const signature = key.sign(this.hash, 'base64');
        this.signature = signature.toDER('hex');

        return true;
    }

    isValid() {
        if(this.from === null) {
            return true;
        }

        if(!this.signature || this.signature.length === 0) {
            return false;
        }

        const publicKey = secp256k1.keyFromPublic(this.from, 'hex');
        return publicKey.verify(this.generateHash(), this.signature);
    }

}

module.exports = Transaction;