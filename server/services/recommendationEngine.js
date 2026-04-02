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
function getWeakTags(submissions) {
    // Track per-tag: unique problems solved vs unique problems attempted
    const tagStats = {}; // tag -> { solved: Set, attempted: Set }

    submissions.forEach((sub) => {
        const key = `${sub.problem.contestId}-${sub.problem.index}`;
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

    // Compute accuracy ratio, filter min 5 attempts, sort ascending
    const tagAccuracy = Object.entries(tagStats)
        .map(([tag, data]) => ({
            tag,
            solved: data.solved.size,
            attempted: data.attempted.size,
            accuracy: data.attempted.size > 0
                ? Math.round((data.solved.size / data.attempted.size) * 100)
                : 0,
        }))
        .filter((t) => t.attempted >= 5)
        .sort((a, b) => a.accuracy - b.accuracy);

    return tagAccuracy.slice(0, 3);
}

// ──────────────────────────────────────────────
// 3. Upsolve Priority
// ──────────────────────────────────────────────
function getUpsolveSuggestions(ratingHistory, solvedSet, allProblems, statsMap) {
    const suggestions = [];
    if (!ratingHistory || ratingHistory.length === 0) return suggestions;

    // Last 3 contests
    const recentContests = ratingHistory.slice(-3).reverse();

    for (const contest of recentContests) {
        const contestId = contest.contestId;

        // Find problems from this contest, sorted by index
        const contestProblems = allProblems
            .filter((p) => p.contestId === contestId)
            .sort((a, b) => a.index.localeCompare(b.index));

        // Find the first unsolved problem
        for (const p of contestProblems) {
            const key = `${p.contestId}-${p.index}`;
            if (solvedSet.has(key)) continue;

            const solvedCount = statsMap.get(key) || 0;

            // Estimate if ≥40% solved: use solvedCount relative to a baseline
            // Since we don't have exact participant count per contest in the problemset API,
            // we use the max solvedCount among contest problems as a proxy for participants
            const maxSolved = Math.max(
                ...contestProblems.map((cp) => statsMap.get(`${cp.contestId}-${cp.index}`) || 0)
            );
            const solveRate = maxSolved > 0 ? solvedCount / maxSolved : 0;

            if (solveRate >= 0.4) {
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
                break; // Only first unsolved per contest
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

    // Heuristic 2: Weak tags
    const weakTags = getWeakTags(submissions);
    const weakTagNames = new Set(weakTags.map((t) => t.tag));

    // Heuristic 3: Upsolve suggestions
    const upsolveSuggestions = getUpsolveSuggestions(ratingHistory, solvedSet, allProblems, statsMap);

    // ── Combine & score ──
    const seen = new Set();
    const recommendations = [];

    // Priority 1: Upsolve problems (top priority)
    for (const p of upsolveSuggestions) {
        const id = `${p.contestId}-${p.index}`;
        if (seen.has(id)) continue;
        seen.add(id);
        recommendations.push({
            ...p,
            source: 'upsolve',
            reason: `Unsolved from "${p.contestName}" — ${p.solveRate}% of participants solved it`,
        });
    }

    // Priority 2: Sweet spot problems matching weak tags
    const weaknessMatches = sweetSpot
        .filter((p) => {
            const id = `${p.contestId}-${p.index}`;
            if (seen.has(id)) return false;
            return p.tags.some((t) => weakTagNames.has(t));
        })
        .sort((a, b) => b.solvedCount - a.solvedCount);

    for (const p of weaknessMatches) {
        if (recommendations.length >= 5) break;
        const id = `${p.contestId}-${p.index}`;
        seen.add(id);
        const matchedTag = p.tags.find((t) => weakTagNames.has(t));
        const tagInfo = weakTags.find((wt) => wt.tag === matchedTag);
        recommendations.push({
            ...p,
            source: 'weakness',
            reason: `Improves your ${tagInfo ? tagInfo.accuracy : '?'}% accuracy in ${matchedTag}`,
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
        recommendations.push({
            ...p,
            source: 'sweet_spot',
            reason: `Classic problem in your growth zone (${effectiveRating + 100}–${effectiveRating + 300} rated)`,
        });
    }

    return {
        recommendations: recommendations.slice(0, 5),
        weakTags,
        userRating: effectiveRating,
    };
}

module.exports = { generateRecommendations, getWeakTags };
