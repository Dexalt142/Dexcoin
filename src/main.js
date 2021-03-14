const Blockchain = require('./Blockchain');
const Transaction = require('./Transaction');
const EllipticCurve = require('elliptic').ec;
const secp256k1 = new EllipticCurve('secp256k1');
const express = require('express');
const bodyParser = require('body-parser');

let difficulty = 6;
let Dexcoin = new Blockchain(difficulty);

let http = express();
const httpPort = 3500;

http.use(bodyParser.json());

http.get('/api/balance/:address', async (req, res) => {
    res.json({
        status: 200,
        data: {
            balance: Dexcoin.getBalance(req.params.address)
        }
    });
});

http.get('/api/create_wallet', async (req, res) => {
    let newWallet = secp256k1.genKeyPair();
    res.json({
        status: 200,
        data: {
            address: newWallet.getPublic('hex'),
            private_key: newWallet.getPrivate('hex')
        }
    });
});

http.get('/api/pending_transaction', async (req, res) => {
    res.json({
        status: 200,
        data: Dexcoin.unconfirmedTransactions
    });
});

http.get('/api/stats', async (req, res) => {
    res.json({
        status: 200,
        data: {
            height: Dexcoin.getLatestHeight(),
            transactions: Dexcoin.getNumberOfTransactions(),
            pending_transactions: Dexcoin.unconfirmedTransactions.length
        }
    });
});

http.post('/api/transaction/send', async (req, res) => {
    if(!req.body.to || !req.body.amount || !req.body.private_key) {
        res.json({
            status: 400,
            error: 'Bad request'
        });
    }

    let pv = req.body.private_key;
    let key = secp256k1.keyFromPrivate(pv);
    let bal = Dexcoin.getNewBalance(key.getPublic('hex'));

    if(bal >= req.body.amount) {
        let newTransaction = new Transaction(key.getPublic('hex'), req.body.to, req.body.amount);
        newTransaction.signTransaction(key);
        if(Dexcoin.addTransaction(newTransaction)) {
            res.json({
                status: 200,
                data: newTransaction
            });
        } else {
            res.json({
                status: 400,
                error: 'Unable to create transaction'
            });
        }
    } else {
        res.json({
           status: 400,
           error: 'Insufficient balance' 
        });
    }

});

http.get('/api/block/latest', async (req, res) => {
    let block = Dexcoin.getLatestBlock();
    if(block) {
        res.json({
            status: 200,
            data: block
        });
    } else {
        res.json({
            status: 404,
            error: 'Block not found'
        });
    }
});

http.get('/api/block/:hash', async (req, res) => {
    let block = Dexcoin.getBlock(req.params.hash);
    if(block) {
        res.json({
            status: 200,
            data: block
        });
    } else {
        res.json({
            status: 404,
            error: 'Block not found'
        });
    }
});

http.get('/api/block/at/:height', async (req, res) => {
    let block = Dexcoin.getBlockAt(req.params.height);
    if(block) {
        res.json({
            status: 200,
            data: block
        });
    } else {
        res.json({
            status: 404,
            error: 'Block not found'
        });
    }
});

http.get('/api/mining/candidate', async (req, res) => {
    res.json({
        status: 200,
        data: {
            payload: Dexcoin.getMiningCandidate(Dexcoin.getCandidateBlock()),
            difficulty: Dexcoin.difficulty
        }
    });
});

http.post('/api/mining/submit', async (req, res) => {
    if(!req.body.miner_address || !req.body.timestamp || !req.body.nonce) {
        return res.json({
            status: 400,
            error: 'Bad request'
        });
    } 

    let submitStatus = await Dexcoin.addBlock(req.body.miner_address, req.body.timestamp, req.body.nonce);
    if(submitStatus) {
        res.json({
            status: 200,
            data: 'Accepted'
        });
    } else {
        res.json({
            status: 400,
            data: 'Rejected'
        });
    }
});

http.listen(3500, () => {
    console.log(`Dexcoin HTTP server started. Running at http://127.0.0.1:${httpPort}`);
});