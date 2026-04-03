/**
 * Rule-Based Problem Recommendation Engine
 * 
 * Three heuristics, zero AI/ML:
 *  1. Sweet Spot Filter  — problems in [rating+100, rating+300], recent rounds only (contestId > 1800)
 *  2. Tag-Based Weakness  — 3 tags with lowest accuracy from recent data (last 90 days / 15 contests)
 *  3. Upsolve Priority    — all failed problems + "+1 Challenge" from recent contests
 */

const RECENT_CONTEST_ID_THRESHOLD = 1800;
const RECENT_DAYS_WINDOW = 90;
const RECENT_CONTESTS_WINDOW = 15;

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function getRecentSubmissions(submissions) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RECENT_DAYS_WINDOW);
    const cutoffTime = Math.floor(cutoffDate.getTime() / 1000);

    const uniqueContestIds = [...new Set(submissions.map((s) => s.contestId))];
    const recentContestIds = new Set(uniqueContestIds.slice(-RECENT_CONTESTS_WINDOW));

    return submissions.filter((sub) => {
        const isRecentByDate = sub.creationTimeSeconds >= cutoffTime;
        const isRecentByContest = recentContestIds.has(sub.contestId);
        return isRecentByDate || isRecentByContest;
    });
}

function getRecentProblems(allProblems) {
    return allProblems.filter((p) => p.contestId > RECENT_CONTEST_ID_THRESHOLD);
}

function getProblemIndexOrder(index) {
    const letterMatch = index.match(/^([A-Z]+)(\d*)$/);
    if (letterMatch) {
        const letters = letterMatch[1];
        const num = letterMatch[2] ? parseInt(letterMatch[2], 10) : 0;
        let val = 0;
        for (let i = 0; i < letters.length; i++) {
            val = val * 26 + (letters.charCodeAt(i) - 64);
        }
        return val + num / 100;
    }
    return parseInt(index, 10) || 0;
}

// ──────────────────────────────────────────────
// 1. Sweet Spot Filter (recent rounds only)
// ──────────────────────────────────────────────
function getSweetSpotProblems(allProblems, statsMap, userRating, solvedSet) {
    const lo = userRating + 100;
    const hi = userRating + 300;

    const recentProblems = getRecentProblems(allProblems);

    return recentProblems
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
// 2. Tag-Based Weakness Identification (recent data only)
// ──────────────────────────────────────────────
function getWeakTags(allSubmissions) {
    const recentSubmissions = getRecentSubmissions(allSubmissions);

    const tagStats = {};

    recentSubmissions.forEach((sub) => {
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
// 3. Upsolve Priority (failed problems + +1 Challenge)
// ──────────────────────────────────────────────
function getUpsolveSuggestions(submissions, allProblems, statsMap, solvedSet) {
    const suggestions = [];
    if (!submissions || submissions.length === 0) return suggestions;

    const recentSubmissions = getRecentSubmissions(submissions);

    // Gather unique recent contest IDs from submissions
    const recentContestIds = [...new Set(recentSubmissions.map((s) => s.contestId))];

    // Build per-contest maps from submissions
    const contestSubmissions = {};
    recentSubmissions.forEach((sub) => {
        const cid = sub.contestId;
        if (!contestSubmissions[cid]) contestSubmissions[cid] = [];
        contestSubmissions[cid].push(sub);
    });

    const failedVerdicts = new Set(['WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED',
        'RUNTIME_ERROR', 'OUTPUT_LIMIT_EXCEEDED', 'PRESENTATION_ERROR', 'COMPILATION_ERROR']);

    for (const contestId of recentContestIds) {
        const subs = contestSubmissions[contestId];

        // All problems the user made submissions to in this contest
        const attemptedKeys = new Set(subs.map((s) => `${s.problem.contestId}-${s.problem.index}`));
        const solvedKeys = new Set(subs.filter((s) => s.verdict === 'OK').map((s) => `${s.problem.contestId}-${s.problem.index}`));

        // Failed problems: attempted but verdict was not OK
        const failedKeys = new Set(subs.filter((s) => failedVerdicts.has(s.verdict)).map((s) => `${s.problem.contestId}-${s.problem.index}`));

        // Find contest problems from allProblems
        const contestProblems = allProblems
            .filter((p) => p.contestId === contestId)
            .sort((a, b) => getProblemIndexOrder(a.index) - getProblemIndexOrder(b.index));

        if (contestProblems.length === 0) continue;

        const maxSolved = Math.max(
            ...contestProblems.map((cp) => statsMap.get(`${cp.contestId}-${cp.index}`) || 0)
        );

        // Add all failed problems as upsolve suggestions
        for (const p of contestProblems) {
            const key = `${p.contestId}-${p.index}`;
            if (!failedKeys.has(key)) continue;

            const solvedCount = statsMap.get(key) || 0;
            const solveRate = maxSolved > 0 ? solvedCount / maxSolved : 0;

            suggestions.push({
                problemID: `${p.contestId}${p.index}`,
                contestId: p.contestId,
                index: p.index,
                name: p.name,
                rating: p.rating || null,
                tags: p.tags || [],
                solvedCount,
                solveRate: Math.round(solveRate * 100),
                contestId: p.contestId,
                link: `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`,
                upsolveType: 'failed',
            });
        }

        // +1 Challenge: for each solved problem, add the next sequential unsolved/unattempted problem
        const solvedIndices = contestProblems
            .filter((p) => solvedKeys.has(`${p.contestId}-${p.index}`))
            .map((p) => getProblemIndexOrder(p.index));

        for (const solvedOrder of solvedIndices) {
            // Find the next problem after this solved one that the user did NOT attempt
            const nextProblem = contestProblems.find((p) => {
                const order = getProblemIndexOrder(p.index);
                const key = `${p.contestId}-${p.index}`;
                return order > solvedOrder && !attemptedKeys.has(key);
            });

            if (nextProblem) {
                const key = `${nextProblem.contestId}-${nextProblem.index}`;
                const solvedCount = statsMap.get(key) || 0;
                const solveRate = maxSolved > 0 ? solvedCount / maxSolved : 0;

                suggestions.push({
                    problemID: `${nextProblem.contestId}${nextProblem.index}`,
                    contestId: nextProblem.contestId,
                    index: nextProblem.index,
                    name: nextProblem.name,
                    rating: nextProblem.rating || null,
                    tags: nextProblem.tags || [],
                    solvedCount,
                    solveRate: Math.round(solveRate * 100),
                    link: `https://codeforces.com/contest/${nextProblem.contestId}/problem/${nextProblem.index}`,
                    upsolveType: 'challenge',
                });
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

    const statsMap = new Map();
    problemStatistics.forEach((ps) => {
        const key = `${ps.contestId}-${ps.index}`;
        statsMap.set(key, ps.solvedCount || 0);
    });

    const solvedSet = new Set();
    submissions.forEach((sub) => {
        if (sub.verdict === 'OK') {
            solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
        }
    });

    const effectiveRating = userRating || 800;

    const sweetSpot = getSweetSpotProblems(allProblems, statsMap, effectiveRating, solvedSet);

    const weakTags = getWeakTags(submissions);
    const weakTagNames = new Set(weakTags.map((t) => t.tag));

    const upsolveSuggestions = getUpsolveSuggestions(submissions, allProblems, statsMap, solvedSet);

    const seen = new Set();
    const recommendations = [];

    for (const p of upsolveSuggestions) {
        const id = `${p.contestId}-${p.index}`;
        if (seen.has(id)) continue;
        seen.add(id);
        const reason = p.upsolveType === 'challenge'
            ? `+1 Challenge: next problem after one you solved`
            : `Failed in contest ${p.contestId} — ${p.solveRate}% of participants solved it`;
        recommendations.push({
            ...p,
            source: 'upsolve',
            reason,
        });
    }

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
            reason: `Recent problem in your growth zone (${effectiveRating + 100}–${effectiveRating + 300} rated)`,
        });
    }

    return {
        recommendations: recommendations.slice(0, 5),
        weakTags,
        userRating: effectiveRating,
    };
}

module.exports = { generateRecommendations, getWeakTags };
