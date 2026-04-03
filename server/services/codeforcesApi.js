const axios = require('axios');
const NodeCache = require('node-cache');

const apiCache = new NodeCache({ stdTTL: 3600 });
const CF_API_BASE = 'https://codeforces.com/api';

const cfAxios = axios.create({
  baseURL: CF_API_BASE,
  timeout: 20000,
});

// ── Request queue: serialize all CF API calls to avoid rate limits ──
let queue = Promise.resolve();

function enqueue(fn) {
  const result = queue.then(fn, fn);
  queue = result.then(() => {}, () => {});
  return result;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callCFApi(endpoint, params = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await cfAxios.get(endpoint, { params });
      if (response.data.status === 'OK') {
        return response.data.result;
      }
      const comment = response.data.comment || 'Codeforces API error';
      if (comment.includes('API limit exceeded')) {
        if (attempt < retries) {
          await sleep(1500 * attempt);
          continue;
        }
      }
      throw new Error(comment);
    } catch (error) {
      if (error.response) {
        const msg = error.response.data?.comment || error.response.statusText;
        if (msg.includes('API limit exceeded') && attempt < retries) {
          await sleep(1500 * attempt);
          continue;
        }
        const err = new Error(`Codeforces API: ${msg}`);
        err.status = error.response.status === 400 ? 404 : error.response.status;
        throw err;
      }
      if (error.message.includes('API limit exceeded') && attempt < retries) {
        await sleep(1500 * attempt);
        continue;
      }
      throw error;
    }
  }
}

module.exports = {
  getUserInfo: (handle) => enqueue(() => callCFApi('/user.info', { handles: handle })),
  getUserRating: (handle) => enqueue(() => callCFApi('/user.rating', { handle })),
  getUserSubmissions: (handle, count) => {
    const params = { handle };
    if (count) params.count = count;
    return enqueue(() => callCFApi('/user.status', params));
  },
  getContestStandings: (contestId, handles, showUnofficial = false) => {
    const params = { contestId, showUnofficial };
    if (handles) params.handles = handles;
    return enqueue(() => callCFApi('/contest.standings', params));
  },
  getProblemset: async () => {
    const CACHE_KEY = 'GLOBAL_CF_PROBLEMSET';
    const cached = apiCache.get(CACHE_KEY);
    if (cached) return cached;

    const result = await enqueue(() => callCFApi('/problemset.problems'));
    apiCache.set(CACHE_KEY, result);
    return result;
  },
};
