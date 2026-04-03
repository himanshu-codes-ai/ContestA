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

// Get problem recommendations
const { generateRecommendations, generateDailyProblem } = require('../services/recommendationEngine');
const { getUpsolveTiers } = require('../services/upsolveEngine');
const NodeCache = require('node-cache');
const historyCache = new NodeCache({ stdTTL: 3600 });

router.get('/user/:handle/recommendations', cacheMiddleware(), async (req, res) => {
    try {
        const handle = req.params.handle;

        // Fetch all required data in parallel
        const [userInfo, submissions, ratingHistory, problemsetData] = await Promise.all([
            cf.getUserInfo(handle),
            cf.getUserSubmissions(handle),
            cf.getUserRating(handle),
            cf.getProblemset(),
        ]);

        const userRating = userInfo[0]?.rating || null;

        const result = await generateRecommendations(
            userRating,
            submissions,
            ratingHistory,
            problemsetData
        );

        res.json({ status: 'OK', result });
    } catch (error) {
        res.status(error.status || 500).json({ status: 'FAILED', comment: error.message });
    }
});

// Get Daily Problem
router.get('/daily-problem/:handle', cacheMiddleware(), async (req, res) => {
    try {
        const handle = req.params.handle;
        const [userInfo, submissions, problemsetData] = await Promise.all([
            cf.getUserInfo(handle),
            cf.getUserSubmissions(handle),
            cf.getProblemset(),
        ]);
        const userRating = userInfo[0]?.rating || null;
        const result = await generateDailyProblem(userRating, submissions, problemsetData, handle);
        res.json({ status: 'OK', result });
    } catch (error) {
        res.status(error.status || 500).json({ status: 'FAILED', comment: error.message });
    }
});

// Get Upsolving Tracker (two-tier: Triage + Challenge)
router.get('/user/:handle/upsolve', cacheMiddleware(), async (req, res) => {
    try {
        const handle = req.params.handle;
        const [userInfo, submissions, ratingHistory, problemsetData] = await Promise.all([
            cf.getUserInfo(handle),
            cf.getUserSubmissions(handle),
            cf.getUserRating(handle),
            cf.getProblemset(),
        ]);
        const userRating = userInfo[0]?.rating || null;
        const result = getUpsolveTiers(userRating, submissions, ratingHistory, problemsetData.problems);
        res.json({ status: 'OK', result });
    } catch (error) {
        res.status(error.status || 500).json({ status: 'FAILED', comment: error.message });
    }
});

// Get Daily Problem History (30 Days)
router.get('/daily-problem/:handle/history', async (req, res) => {
    try {
        const handle = req.params.handle;
        const monthYear = req.query.month || new Date().toISOString().slice(0, 7);
        const cacheKey = `history_${handle}_${monthYear}`;
        
        let cached = historyCache.get(cacheKey);
        if (cached) {
            return res.json({ status: 'OK', result: cached });
        }
        
        const [userInfo, submissions, problemsetData] = await Promise.all([
            cf.getUserInfo(handle),
            cf.getUserSubmissions(handle),
            cf.getProblemset(),
        ]);
        const userRating = userInfo[0]?.rating || null;
        
        const history = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date(today.getTime() - (i * 86400000));
            const dateStr = d.toISOString().split('T')[0];
            const dayResult = await generateDailyProblem(userRating, submissions, problemsetData, handle, dateStr);
            history.push({
                date: dateStr,
                isSolved: dayResult.isSolvedToday,
                problemId: `${dayResult.problem.contestId}-${dayResult.problem.index}`,
                rating: dayResult.problem.rating
            });
        }
        
        historyCache.set(cacheKey, history);
        res.json({ status: 'OK', result: history });
    } catch (error) {
        res.status(error.status || 500).json({ status: 'FAILED', comment: error.message });
    }
});

module.exports = router;
