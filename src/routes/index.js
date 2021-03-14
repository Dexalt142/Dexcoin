const express = require('express');
const router = express.Router();

router.get('/balance/:address', async (req, res) => {
    res.json({
        status: 200,
        data: req.params.address
    });
});

module.exports = router;