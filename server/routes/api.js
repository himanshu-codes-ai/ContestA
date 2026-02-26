const express = require('express');
const router = express.Router();
const cf = require('../services/codeforcesApi');
const { cacheMiddleware } = require('../middleware/cache');

// Get user info
router.get('/user/:handle', cacheMiddleware(), async (req, res) => {
    try {
        const result = await cf.getUserInfo(req.params.handle);
        res.json({ status: 'OK', result: result[0] });
    } catch (error) {
        res.status(error.status || 500).json({ status: 'FAILED', comment: error.message });
    }
});

// Get user rating history
router.get('/user/:handle/rating', cacheMiddleware(), async (req, res) => {
    try {
        const result = await cf.getUserRating(req.params.handle);
        res.json({ status: 'OK', result });
    } catch (error) {
        res.status(error.status || 500).json({ status: 'FAILED', comment: error.message });
    }
});

// Get user submissions
router.get('/user/:handle/submissions', cacheMiddleware(), async (req, res) => {
    try {
        const result = await cf.getUserSubmissions(req.params.handle, req.query.count);
        res.json({ status: 'OK', result });
    } catch (error) {
        res.status(error.status || 500).json({ status: 'FAILED', comment: error.message });
    }
});

// Get contest standings
router.get('/contest/:id/standings', cacheMiddleware(), async (req, res) => {
    try {
        const result = await cf.getContestStandings(
            req.params.id,
            req.query.handles,
            req.query.showUnofficial === 'true'
        );
        res.json({ status: 'OK', result });
    } catch (error) {
        res.status(error.status || 500).json({ status: 'FAILED', comment: error.message });
    }
});

module.exports = router;
