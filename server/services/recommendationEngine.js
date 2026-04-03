/**
 * Rule-Based Problem Recommendation Engine
 * 
 * Three heuristics, zero AI/ML:
 *  1. Sweet Spot Filter  — problems in [rating+100, rating+300]
 *  2. Tag-Based Weakness  — 3 tags with lowest accuracy ratio
 *  3. Upsolve Priority    — first unsolved from last 3 contests (≥40% solve rate)
 */

// ──────────────────────────────────────────────
// 1. Sweet Spot Filter
// ──────────────────────────────────────────────
function getSweetSpotProblems(allProblems, statsMap, userRating, solvedSet) {
    const lo = userRating + 100;
    const hi = userRating + 300;

    return allProblems
        .filter((p) => {
            if (!p.rating || p.rating < lo || p.rating > hi) return false;
            const key = `${p.contestId}-${p.index}`;
            return !solvedSet.has(key);
        })
        .map((p) => {
            const key = `${p.contestId}-${p.index}`;
            return {
                problemID: `${p.contestId}${p.index}`,
                contestId: p.contestId,
                index: p.index,
                name: p.name,
                rating: p.rating,
                tags: p.tags || [],
                solvedCount: statsMap.get(key) || 0,
                link: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
            };
        });
}

// ──────────────────────────────────────────────
// 2. Tag-Based Weakness Identification
// ──────────────────────────────────────────────
function getWeakTags(submissions, ratingHistory = []) {
    // Track per-tag: unique problems solved vs unique problems attempted
    const tagStats = {}; // tag -> { solved: Set, attempted: Set }

    // Recent-slice filter: keep subs from last 90 days OR from last 15 contests
    const nowSec = Math.floor(Date.now() / 1000);
    const cutoff90d = nowSec - (90 * 24 * 60 * 60);
    const recentContests = new Set((ratingHistory || []).slice(-15).map(r => r.contestId));

    submissions.forEach((sub) => {
        const ts = sub.creationTimeSeconds || 0;
        const cid = sub.problem.contestId;
        if (!(ts >= cutoff90d || recentContests.has(cid))) return;

        const key = `${cid}-${sub.problem.index}`;
        (sub.problem.tags || []).forEach((tag) => {
            if (!tagStats[tag]) {
                tagStats[tag] = { solved: new Set(), attempted: new Set() };
            }
            tagStats[tag].attempted.add(key);
            if (sub.verdict === 'OK') {
                tagStats[tag].solved.add(key);
            }
        });
    });

    // Compute accuracy ratio, require a small minimum (3) of recent attempts
    const tagAccuracy = Object.entries(tagStats)
        .map(([tag, data]) => ({
            tag,
            solved: data.solved.size,
            attempted: data.attempted.size,
            accuracy: data.attempted.size > 0
                ? Math.round((data.solved.size / data.attempted.size) * 100)
                : 0,
        }))
        .filter((t) => t.attempted >= 3)
        .sort((a, b) => a.accuracy - b.accuracy);

    return tagAccuracy.slice(0, 3);
}

// ──────────────────────────────────────────────
// 3. Upsolve Priority
// ──────────────────────────────────────────────
function getUpsolveSuggestions(ratingHistory, submissions, solvedSet, allProblems, statsMap) {
    const suggestions = [];
    if (!ratingHistory || ratingHistory.length === 0) return suggestions;

    // Last 3 contests
    const recentContests = ratingHistory.slice(-3).reverse();

    // Build attempted set (include failed verdicts)
    const attemptedSet = new Set();
    submissions.forEach((sub) => {
        const key = `${sub.problem.contestId}-${sub.problem.index}`;
        attemptedSet.add(key);
    });

    for (const contest of recentContests) {
        const contestId = contest.contestId;

        // Find problems from this contest, sorted by index
        const contestProblems = allProblems
            .filter((p) => p.contestId === contestId)
            .sort((a, b) => a.index.localeCompare(b.index));

        // 1) Add all problems from contest where user attempted but did not solve (failed verdicts)
        for (const p of contestProblems) {
            const key = `${p.contestId}-${p.index}`;
            if (solvedSet.has(key)) continue; // already solved
            if (!attemptedSet.has(key)) continue; // user didn't try

            const solvedCount = statsMap.get(key) || 0;
            const maxSolved = Math.max(
                ...contestProblems.map((cp) => statsMap.get(`${cp.contestId}-${cp.index}`) || 0)
            );
            const solveRate = maxSolved > 0 ? solvedCount / maxSolved : 0;
            // include attempted failed problems regardless of solveRate
            suggestions.push({
                problemID: `${p.contestId}${p.index}`,
                contestId: p.contestId,
                index: p.index,
                name: p.name,
                rating: p.rating || null,
                tags: p.tags || [],
                solvedCount,
                solveRate: Math.round(solveRate * 100),
                contestName: contest.contestName,
                link: `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`,
            });
        }

        // 2) +1 Challenge: pick one sequential problem after user's solved problems that they did not attempt
        const solvedIndices = contestProblems
            .map((p) => p.index)
            .filter((idx) => solvedSet.has(`${contestId}-${idx}`));
        if (solvedIndices.length > 0) {
            // find the highest solved position in contestProblems order
            let lastSolvedPos = -1;
            for (let i = 0; i < contestProblems.length; i++) {
                if (solvedSet.has(`${contestId}-${contestProblems[i].index}`)) lastSolvedPos = i;
            }
            // find next problem after lastSolvedPos that the user hasn't attempted
            for (let j = lastSolvedPos + 1; j < contestProblems.length; j++) {
                const p = contestProblems[j];
                const key = `${p.contestId}-${p.index}`;
                if (!attemptedSet.has(key) && !solvedSet.has(key)) {
                    const solvedCount = statsMap.get(key) || 0;
                    suggestions.push({
                        problemID: `${p.contestId}${p.index}`,
                        contestId: p.contestId,
                        index: p.index,
                        name: p.name,
                        rating: p.rating || null,
                        tags: p.tags || [],
                        solvedCount,
                        solveRate: 0,
                        contestName: contest.contestName,
                        link: `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`,
                        challenge: true,
                    });
                    break; // only one +1 challenge per contest
                }
            }
        }
    }
    return suggestions;
}

// ──────────────────────────────────────────────
// 4. Main — Generate Recommendations
// ──────────────────────────────────────────────
async function generateRecommendations(userRating, submissions, ratingHistory, problemsetData) {
    const { problems: allProblems, problemStatistics } = problemsetData;

    // Build a map of problem key -> solvedCount
    const statsMap = new Map();
    problemStatistics.forEach((ps) => {
        const key = `${ps.contestId}-${ps.index}`;
        statsMap.set(key, ps.solvedCount || 0);
    });

    // Build set of solved problem keys
    const solvedSet = new Set();
    submissions.forEach((sub) => {
        if (sub.verdict === 'OK') {
            solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
        }
    });

    // Handle unrated users: default to 800
    const effectiveRating = userRating || 800;

    // Heuristic 1: Sweet spot problems
    const sweetSpot = getSweetSpotProblems(allProblems, statsMap, effectiveRating, solvedSet);

    // Heuristic 2: Weak tags (use recent submissions/ratingHistory)
    const weakTags = getWeakTags(submissions, ratingHistory);
    const weakTagNames = new Set(weakTags.map((t) => t.tag));

    // Heuristic 3: Upsolve suggestions
    const upsolveSuggestions = getUpsolveSuggestions(ratingHistory, submissions, solvedSet, allProblems, statsMap);

    // ── Combine & score ──
    const seen = new Set();
    const recommendations = [];

    // Priority 1: Upsolve problems (top priority)
    for (const p of upsolveSuggestions) {
        const id = `${p.contestId}-${p.index}`;
        if (seen.has(id)) continue;
        seen.add(id);
        // Build friendly reason/why fields
        const solvedPercent = p.solveRate || 0;
        const baseReason = p.challenge ? `+1 Challenge from "${p.contestName}"` : `Unsolved from "${p.contestName}"`;
        const reason = solvedPercent > 0 ? `${baseReason} — ${solvedPercent}% of participants solved it` : baseReason;
        const why = p.challenge
            ? `One sequential problem after your last solved problem in this contest.`
            : `You attempted this problem in the contest but did not solve it (TLE/WA/etc.). Reattempting will close gaps.`;

        recommendations.push({
            ...p,
            source: 'upsolve',
            reason,
            why,
        });
    }

    // Priority 2: Sweet spot problems matching weak tags
    const weaknessMatches = sweetSpot
        .filter((p) => {
            const id = `${p.contestId}-${p.index}`;
            if (seen.has(id)) return false;
            const isTagMatch = p.tags.some((t) => weakTagNames.has(t));
            const cidNum = Number(p.contestId);
            const isRecentRound = !Number.isNaN(cidNum) ? cidNum >= 1800 : true;
            return isTagMatch && isRecentRound;
        })
        .sort((a, b) => b.solvedCount - a.solvedCount);

    for (const p of weaknessMatches) {
        if (recommendations.length >= 5) break;
        const id = `${p.contestId}-${p.index}`;
        seen.add(id);
        const matchedTag = p.tags.find((t) => weakTagNames.has(t));
        const tagInfo = weakTags.find((wt) => wt.tag === matchedTag);
        const acc = tagInfo ? tagInfo.accuracy : '?';
        const attempts = tagInfo ? tagInfo.attempted : '?';
        const reason = `Targets your weak tag: ${matchedTag}`;
        const why = `Recent accuracy ${acc}% over ${attempts} recent attempts for ${matchedTag}. Focused practice improves this.`;
        recommendations.push({
            ...p,
            source: 'weakness',
            reason,
            why,
        });
    }

    // Priority 3: Fill remaining with sweet-spot problems sorted by solvedCount
    const remaining = sweetSpot
        .filter((p) => !seen.has(`${p.contestId}-${p.index}`))
        .sort((a, b) => b.solvedCount - a.solvedCount);

    for (const p of remaining) {
        if (recommendations.length >= 5) break;
        const id = `${p.contestId}-${p.index}`;
        seen.add(id);
        const reason = `Classic problem in your growth zone (${effectiveRating + 100}–${effectiveRating + 300} rated)`;
        const why = `Fits your rating progression; solving helps bridge to the next tier.`;
        recommendations.push({
            ...p,
            source: 'sweet_spot',
            reason,
            why,
        });
    }

    return {
        recommendations: recommendations.slice(0, 5),
        weakTags,
        userRating: effectiveRating,
    };
}

module.exports = { generateRecommendations, getWeakTags };
