/**
 * Get the tag distribution from submissions (only accepted).
 */
export function getTagDistribution(submissions) {
    const tags = {};
    const seen = new Set();

    submissions.forEach((sub) => {
        if (sub.verdict !== 'OK') return;
        const key = `${sub.problem.contestId}-${sub.problem.index}`;
        if (seen.has(key)) return;
        seen.add(key);

        sub.problem.tags.forEach((tag) => {
            tags[tag] = (tags[tag] || 0) + 1;
        });
    });

    return Object.entries(tags)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
}

/**
 * Get the problem rating distribution from accepted submissions.
 */
export function getRatingDistribution(submissions) {
    const ratings = {};
    const seen = new Set();

    submissions.forEach((sub) => {
        if (sub.verdict !== 'OK') return;
        const key = `${sub.problem.contestId}-${sub.problem.index}`;
        if (seen.has(key)) return;
        seen.add(key);

        const r = sub.problem.rating;
        if (r) {
            const bucket = Math.floor(r / 100) * 100;
            ratings[bucket] = (ratings[bucket] || 0) + 1;
        }
    });

    return Object.entries(ratings)
        .map(([rating, count]) => ({ rating: Number(rating), count }))
        .sort((a, b) => a.rating - b.rating);
}

/**
 * Get daily submission counts for heatmap.
 */
export function getHeatmapData(submissions) {
    const counts = {};

    submissions.forEach((sub) => {
        const date = new Date(sub.creationTimeSeconds * 1000)
            .toISOString()
            .split('T')[0];
        counts[date] = (counts[date] || 0) + 1;
    });

    return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

/**
 * Get unsolved problems from recent contests.
 */
export function getUnsolvedProblems(submissions, ratingHistory) {
    const solved = new Set();
    const attempted = new Map();

    submissions.forEach((sub) => {
        const key = `${sub.problem.contestId}-${sub.problem.index}`;
        if (sub.verdict === 'OK') {
            solved.add(key);
        } else {
            if (!attempted.has(key)) {
                attempted.set(key, sub.problem);
            }
        }
    });

    // Get recent contest IDs from rating history
    const recentContests = new Set(
        (ratingHistory || []).slice(-20).map((r) => r.contestId)
    );

    const unsolved = [];
    const seen = new Set();

    submissions.forEach((sub) => {
        const key = `${sub.problem.contestId}-${sub.problem.index}`;
        if (solved.has(key) || seen.has(key)) return;
        if (!recentContests.has(sub.problem.contestId)) return;
        seen.add(key);

        unsolved.push({
            ...sub.problem,
            contestId: sub.problem.contestId,
            link: `https://codeforces.com/contest/${sub.problem.contestId}/problem/${sub.problem.index}`,
        });
    });

    return unsolved;
}

/**
 * Get overall stats from submissions.
 */
export function getOverallStats(submissions) {
    const solved = new Set();
    let totalAttempts = 0;
    let accepted = 0;

    submissions.forEach((sub) => {
        totalAttempts++;
        if (sub.verdict === 'OK') {
            const key = `${sub.problem.contestId}-${sub.problem.index}`;
            solved.add(key);
            accepted++;
        }
    });

    return {
        totalSolved: solved.size,
        totalAttempts,
        acceptedSubmissions: accepted,
        acceptRate: totalAttempts > 0 ? ((accepted / totalAttempts) * 100).toFixed(1) : 0,
    };
}

/**
 * Get verdict distribution.
 */
export function getVerdictDistribution(submissions) {
    const verdicts = {};
    submissions.forEach((sub) => {
        const v = sub.verdict || 'UNKNOWN';
        verdicts[v] = (verdicts[v] || 0) + 1;
    });

    return Object.entries(verdicts)
        .map(([name, value]) => ({ name: formatVerdict(name), value }))
        .sort((a, b) => b.value - a.value);
}

function formatVerdict(v) {
    const map = {
        OK: 'Accepted',
        WRONG_ANSWER: 'Wrong Answer',
        TIME_LIMIT_EXCEEDED: 'TLE',
        MEMORY_LIMIT_EXCEEDED: 'MLE',
        RUNTIME_ERROR: 'Runtime Error',
        COMPILATION_ERROR: 'CE',
        SKIPPED: 'Skipped',
        CHALLENGED: 'Hacked',
    };
    return map[v] || v;
}

/**
 * Get Codeforces rank and color from rating.
 */
export function getRankInfo(rating) {
    if (!rating) return { rank: 'Unrated', className: 'rating-newbie', color: '#808080' };
    if (rating < 1200) return { rank: 'Newbie', className: 'rating-newbie', color: '#808080' };
    if (rating < 1400) return { rank: 'Pupil', className: 'rating-pupil', color: '#008000' };
    if (rating < 1600) return { rank: 'Specialist', className: 'rating-specialist', color: '#03a89e' };
    if (rating < 1900) return { rank: 'Expert', className: 'rating-expert', color: '#0000ff' };
    if (rating < 2100) return { rank: 'Candidate Master', className: 'rating-candidate-master', color: '#aa00aa' };
    if (rating < 2300) return { rank: 'Master', className: 'rating-master', color: '#ff8c00' };
    if (rating < 2400) return { rank: 'International Master', className: 'rating-international-master', color: '#ff8c00' };
    if (rating < 2600) return { rank: 'Grandmaster', className: 'rating-grandmaster', color: '#ff0000' };
    if (rating < 3000) return { rank: 'International Grandmaster', className: 'rating-international-grandmaster', color: '#ff0000' };
    return { rank: 'Legendary Grandmaster', className: 'rating-legendary-grandmaster', color: '#ff0000' };
}

/**
 * Format a Unix timestamp.
 */
export function formatDate(ts) {
    return new Date(ts * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Get heatmap stats.
 */
export function getHeatmapStats(heatmapData) {
    if (!heatmapData.length) return { longestStreak: 0, totalActiveDays: 0, busiestDay: null, maxCount: 0 };

    const totalActiveDays = heatmapData.length;
    const maxEntry = heatmapData.reduce((max, d) => (d.count > max.count ? d : max), heatmapData[0]);

    // Compute longest streak
    const dateSet = new Set(heatmapData.map((d) => d.date));
    const sortedDates = [...dateSet].sort();
    let longestStreak = 0;
    let currentStreak = 0;
    let prevDate = null;

    sortedDates.forEach((date) => {
        if (prevDate) {
            const prev = new Date(prevDate);
            const curr = new Date(date);
            const diff = (curr - prev) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
        } else {
            currentStreak = 1;
        }
        longestStreak = Math.max(longestStreak, currentStreak);
        prevDate = date;
    });

    return {
        longestStreak,
        totalActiveDays,
        busiestDay: maxEntry.date,
        maxCount: maxEntry.count,
    };
}

/**
 * Compare two users.
 */
export function compareUsers(subs1, subs2, ratings1, ratings2) {
    const tags1 = getTagDistribution(subs1);
    const tags2 = getTagDistribution(subs2);
    const stats1 = getOverallStats(subs1);
    const stats2 = getOverallStats(subs2);
    const ratingDist1 = getRatingDistribution(subs1);
    const ratingDist2 = getRatingDistribution(subs2);

    // Common contests
    const contestMap1 = new Map();
    ratings1.forEach((r) => contestMap1.set(r.contestId, r));
    const commonContests = [];
    ratings2.forEach((r) => {
        if (contestMap1.has(r.contestId)) {
            const r1 = contestMap1.get(r.contestId);
            commonContests.push({
                contestId: r.contestId,
                contestName: r.contestName,
                rank1: r1.rank,
                rank2: r.rank,
                change1: r1.newRating - r1.oldRating,
                change2: r.newRating - r.oldRating,
            });
        }
    });
    commonContests.reverse();

    // Merge all tags for radar
    const allTags = new Set([...tags1.map(t => t.name), ...tags2.map(t => t.name)]);
    const tagMap1 = Object.fromEntries(tags1.map(t => [t.name, t.value]));
    const tagMap2 = Object.fromEntries(tags2.map(t => [t.name, t.value]));
    const radarData = [...allTags].slice(0, 10).map(tag => ({
        tag,
        user1: tagMap1[tag] || 0,
        user2: tagMap2[tag] || 0,
    }));

    // Merge rating distributions
    const allRatings = new Set([
        ...ratingDist1.map(r => r.rating),
        ...ratingDist2.map(r => r.rating),
    ]);
    const rdMap1 = Object.fromEntries(ratingDist1.map(r => [r.rating, r.count]));
    const rdMap2 = Object.fromEntries(ratingDist2.map(r => [r.rating, r.count]));
    const mergedRatingDist = [...allRatings].sort((a, b) => a - b).map(r => ({
        rating: r,
        user1: rdMap1[r] || 0,
        user2: rdMap2[r] || 0,
    }));

    return {
        stats1,
        stats2,
        radarData,
        commonContests,
        mergedRatingDist,
    };
}



