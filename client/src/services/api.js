import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 15000,
});

export async function fetchUser(handle) {
    const res = await api.get(`/user/${handle}`);
    return res.data.result;
}

export async function fetchRating(handle) {
    const res = await api.get(`/user/${handle}/rating`);
    return res.data.result;
}

export async function fetchSubmissions(handle) {
    const res = await api.get(`/user/${handle}/submissions`);
    return res.data.result;
}

export async function fetchContestStandings(contestId, handles) {
    const params = {};
    if (handles) params.handles = handles;
    const res = await api.get(`/contest/${contestId}/standings`, { params });
    return res.data.result;
}

export async function fetchRecommendations(handle) {
    const res = await api.get(`/user/${handle}/recommendations`);
    return res.data.result;
}

export async function fetchDailyProblem(handle) {
    const res = await api.get(`/daily-problem/${handle}`);
    return res.data.result;
}

export async function fetchDailyProblemHistory(handle, month) {
    const params = {};
    if (month) params.month = month;
    const res = await api.get(`/daily-problem/${handle}/history`, { params });
    return res.data.result;
}

export default api;
