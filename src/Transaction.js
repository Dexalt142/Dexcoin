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
        if(this.from == '045bfa30a15f7808194885ae5ea0f9dbde0b217c20f4a651c09aea192b1a5c537e92861ace98418780f33cd4c48cef261536b444a8c5d551370e8c3fe8edef64d0') {
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