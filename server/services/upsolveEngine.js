const VERDICT_LABELS = {
    WRONG_ANSWER: 'WA',
    TIME_LIMIT_EXCEEDED: 'TLE',
    MEMORY_LIMIT_EXCEEDED: 'MLE',
    RUNTIME_ERROR: 'RE',
    COMPILATION_ERROR: 'CE',
    CHALLENGED: 'Hacked',
    SKIPPED: 'Skipped',
};

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

function getUpsolveTiers(userRating, submissions, ratingHistory, allProblems) {
    const effectiveRating = userRating || 1500;
    const lo = effectiveRating + 100;
    const hi = effectiveRating + 300;

    const recentContests = (ratingHistory || []).slice(-5);
    if (recentContests.length === 0) return { userRating: effectiveRating, contests: [] };

    const solvedSet = new Set();
    const failedMap = new Map();

    submissions.forEach((sub) => {
        const key = `${sub.problem.contestId}-${sub.problem.index}`;
        if (sub.verdict === 'OK') {
            solvedSet.add(key);
        } else {
            if (!failedMap.has(key)) {
                failedMap.set(key, sub);
            }
        }
    });

    const contests = [];

    for (const contest of recentContests) {
        const contestId = contest.contestId;
        const contestProblems = allProblems
            .filter((p) => p.contestId === contestId)
            .sort((a, b) => getProblemIndexOrder(a.index) - getProblemIndexOrder(b.index));

        const triage = [];
        const seenTriage = new Set();

        for (const sub of submissions) {
            if (sub.problem.contestId !== contestId) continue;
            if (sub.verdict === 'OK') continue;
            const key = `${sub.problem.contestId}-${sub.problem.index}`;
            if (seenTriage.has(key)) continue;
            seenTriage.add(key);

            triage.push({
                problemID: `${sub.problem.contestId}${sub.problem.index}`,
                contestId: sub.problem.contestId,
                index: sub.problem.index,
                name: sub.problem.name,
                rating: sub.problem.rating || null,
                tags: sub.problem.tags || [],
                verdict: sub.verdict,
                verdictLabel: VERDICT_LABELS[sub.verdict] || sub.verdict,
                link: `https://codeforces.com/contest/${sub.problem.contestId}/problem/${sub.problem.index}`,
            });
        }

        triage.sort((a, b) => getProblemIndexOrder(a.index) - getProblemIndexOrder(b.index));

        let challenge = null;
        if (contestProblems.length > 0) {
            const solvedInContest = contestProblems.filter((p) =>
                solvedSet.has(`${p.contestId}-${p.index}`)
            );

            if (solvedInContest.length > 0) {
                solvedInContest.sort((a, b) => getProblemIndexOrder(b.index) - getProblemIndexOrder(a.index));
                const highestSolved = solvedInContest[0];
                const highestPos = contestProblems.indexOf(highestSolved);

                if (highestPos < contestProblems.length - 1) {
                    const nextProblem = contestProblems[highestPos + 1];
                    if (nextProblem.rating && nextProblem.rating >= lo && nextProblem.rating <= hi) {
                        challenge = {
                            problemID: `${nextProblem.contestId}${nextProblem.index}`,
                            contestId: nextProblem.contestId,
                            index: nextProblem.index,
                            name: nextProblem.name,
                            rating: nextProblem.rating,
                            tags: nextProblem.tags || [],
                            link: `https://codeforces.com/contest/${nextProblem.contestId}/problem/${nextProblem.index}`,
                        };
                    }
                }
            }
        }

        contests.push({
            contestId,
            contestName: contest.contestName,
            triage,
            challenge,
        });
    }

    return { userRating: effectiveRating, contests };
}

module.exports = { getUpsolveTiers };
