import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 20000,
});

// ── Global request queue: serialize all API calls to avoid CF rate limits ──
let queue = Promise.resolve();

function enqueue(fn) {
    const result = queue.then(fn, fn);
    queue = result.then(() => {}, () => {});
    return result;
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function queuedGet(url, config) {
    return enqueue(async () => {
        const res = await api.get(url, config);
        await delay(600);
        return res;
    });
}

export async function fetchUser(handle) {
    const res = await queuedGet(`/user/${handle}`);
    return res.data.result;
}

export async function fetchRating(handle) {
    const res = await queuedGet(`/user/${handle}/rating`);
    return res.data.result;
}

export async function fetchSubmissions(handle) {
    const res = await queuedGet(`/user/${handle}/submissions`);
    return res.data.result;
}

export async function fetchContestStandings(contestId, handles) {
    const params = {};
    if (handles) params.handles = handles;
    const res = await queuedGet(`/contest/${contestId}/standings`, { params });
    return res.data.result;
}

export async function fetchRecommendations(handle) {
    const res = await queuedGet(`/user/${handle}/recommendations`);
    return res.data.result;
}

export async function fetchDailyProblem(handle) {
    const res = await queuedGet(`/daily-problem/${handle}`);
    return res.data.result;
}

export async function fetchDailyProblemHistory(handle, month) {
    const params = {};
    if (month) params.month = month;
    const res = await queuedGet(`/daily-problem/${handle}/history`, { params });
    return res.data.result;
}

export async function fetchUpsolve(handle) {
    const res = await queuedGet(`/user/${handle}/upsolve`);
    return res.data.result;
}

export default api;
