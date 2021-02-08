class Transaction {

    constructor(from, to, amount) {
        this.timestamp = new Date();
        this.from = from;
        this.to = to;
        this.amount = amount;
    }

}

module.exports = Transaction;