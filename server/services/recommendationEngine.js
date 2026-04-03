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

async function generateRecommendations(userRating, submissions, ratingHistory, problemsetData) {
    const { problems: allProblems, problemStatistics } = problemsetData;

    const statsMap = new Map();
    problemStatistics.forEach((ps) => {
        statsMap.set(`${ps.contestId}-${ps.index}`, ps.solvedCount || 0);
    });

    const solvedSet = new Set();
    const attemptedSet = new Set();
    submissions.forEach((sub) => {
        const key = `${sub.problem.contestId}-${sub.problem.index}`;
        attemptedSet.add(key);
        if (sub.verdict === 'OK') {
            solvedSet.add(key);
        }
    });

    const effectiveRating = userRating || 800;
    const lo = effectiveRating + 100;
    const hi = effectiveRating + 200;

    // ── Step 1: Get last 6 contests from rating history ──
    const recentContests = (ratingHistory || []).slice(-6);
    const recentContestIds = new Set(recentContests.map((c) => c.contestId));

    // ── Step 2: Tally tags from missed problems in those 6 contests ──
    const tagTally = {};

    recentContests.forEach((contest) => {
        const contestProblems = allProblems.filter((p) => p.contestId === contest.contestId);

        contestProblems.forEach((p) => {
            const key = `${p.contestId}-${p.index}`;
            if (!solvedSet.has(key)) {
                (p.tags || []).forEach((tag) => {
                    tagTally[tag] = (tagTally[tag] || 0) + 1;
                });
            }
        });
    });

    // ── Step 3: Also check last 20 submissions for failed attempts ──
    const recentSubs = submissions.slice(0, 20);
    recentSubs.forEach((sub) => {
        if (sub.verdict !== 'OK') {
            (sub.problem.tags || []).forEach((tag) => {
                tagTally[tag] = (tagTally[tag] || 0) + 1;
            });
        }
    });

    // ── Step 4: Top 5 weak tags ──
    const weakTags = Object.entries(tagTally)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }));

    const weakTagNames = new Set(weakTags.map((t) => t.tag));

    // ── Step 5: Find 10 unsolved problems matching weak tags, in [rating+100, rating+200] ──
    const recommendations = allProblems
        .filter((p) => {
            if (!p.rating || p.rating < lo || p.rating > hi) return false;
            const key = `${p.contestId}-${p.index}`;
            if (solvedSet.has(key)) return false;
            return p.tags.some((t) => weakTagNames.has(t));
        })
        .map((p) => ({
            problemID: `${p.contestId}${p.index}`,
            contestId: p.contestId,
            index: p.index,
            name: p.name,
            rating: p.rating,
            tags: p.tags,
            solvedCount: statsMap.get(`${p.contestId}-${p.index}`) || 0,
            link: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
        }))
        .sort((a, b) => b.solvedCount - a.solvedCount)
        .slice(0, 10);

    return {
        recommendations,
        weakTags,
        userRating: effectiveRating,
    };
}

async function generateDailyProblem(userRating, submissions, problemsetData, handle, dateOverride = null) {
    const d = dateOverride ? new Date(dateOverride) : new Date();
    const dateStr = d.toISOString().split('T')[0];

    const effectiveRating = typeof userRating === 'number' ? userRating : 1200;
    const minRating = effectiveRating + 100;
    const maxRating = effectiveRating + 200;

    const { problems, problemStatistics } = problemsetData;
    const solved = new Set(
        (submissions || []).filter((s) => s.verdict === 'OK').map((s) => `${s.problem.contestId}-${s.problem.index}`)
    );

    let validProblems = problems.filter((p) => {
        if (!p.rating) return false;
        if (p.rating < minRating || p.rating > maxRating) return false;
        return !solved.has(`${p.contestId}-${p.index}`);
    });

    if (validProblems.length === 0) {
        validProblems = problems.filter((p) => !solved.has(`${p.contestId}-${p.index}`) && p.rating);
    }

    validProblems.sort((a, b) => `${a.contestId}-${a.index}`.localeCompare(`${b.contestId}-${b.index}`));

    const seedString = `${handle}-${dateStr}`;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
        const char = seedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const index = hash % validProblems.length;

    const selectedProblem = validProblems[index];

    const stats = (problemStatistics || []).find(
        (s) => s.contestId === selectedProblem.contestId && s.index === selectedProblem.index
    );
    if (stats) {
        selectedProblem.solvedCount = stats.solvedCount;
    }

    const startOfDayUTC = new Date(dateStr + 'T00:00:00Z').getTime() / 1000;
    const endOfDayUTC = startOfDayUTC + 86400;

    const isSolvedToday = (submissions || []).some(
        (s) =>
            s.verdict === 'OK' &&
            s.problem.contestId === selectedProblem.contestId &&
            s.problem.index === selectedProblem.index &&
            s.creationTimeSeconds >= startOfDayUTC &&
            s.creationTimeSeconds < endOfDayUTC
    );

    return {
        problem: selectedProblem,
        date: dateStr,
        isSolvedToday,
    };
}

module.exports = { generateRecommendations, generateDailyProblem };
