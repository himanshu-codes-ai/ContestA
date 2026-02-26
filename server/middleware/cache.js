const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

function cacheMiddleware(keyFn) {
    return (req, res, next) => {
        const key = typeof keyFn === 'function' ? keyFn(req) : req.originalUrl;
        const cached = cache.get(key);
        if (cached) {
            return res.json(cached);
        }
        res._originalJson = res.json.bind(res);
        res.json = (data) => {
            if (res.statusCode === 200) {
                cache.set(key, data);
            }
            return res._originalJson(data);
        };
        next();
    };
}

module.exports = { cache, cacheMiddleware };
