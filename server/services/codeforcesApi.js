const axios = require('axios');

const CF_API_BASE = 'https://codeforces.com/api';

const cfAxios = axios.create({
  baseURL: CF_API_BASE,
  timeout: 15000,
});

async function callCFApi(endpoint, params = {}) {
  try {
    const response = await cfAxios.get(endpoint, { params });
    if (response.data.status === 'OK') {
      return response.data.result;
    }
    throw new Error(response.data.comment || 'Codeforces API error');
  } catch (error) {
    if (error.response) {
      const msg = error.response.data?.comment || error.response.statusText;
      const err = new Error(`Codeforces API: ${msg}`);
      err.status = error.response.status === 400 ? 404 : error.response.status;
      throw err;
    }
    throw error;
  }
}

module.exports = {
  getUserInfo: (handle) => callCFApi('/user.info', { handles: handle }),
  getUserRating: (handle) => callCFApi('/user.rating', { handle }),
  getUserSubmissions: (handle, count) => {
    const params = { handle };
    if (count) params.count = count;
    return callCFApi('/user.status', params);
  },
  getContestStandings: (contestId, handles, showUnofficial = false) => {
    const params = { contestId, showUnofficial };
    if (handles) params.handles = handles;
    return callCFApi('/contest.standings', params);
  },
};
