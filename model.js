// ============================================================
// Folketingsvalg 2026 – Prediction Model
// ============================================================

const THRESHOLD = 2.0; // 2% spærregrænse
const TOTAL_SEATS = 175;

class ElectionModel {
    constructor() {
        this.latestPolls = LATEST_POLLS;
        this.results = null;
    }

    // D'Hondt method for seat allocation
    dHondt(partyVotes, totalSeats) {
        const quotients = [];
        for (const [party, votes] of Object.entries(partyVotes)) {
            if (votes < THRESHOLD) continue; // Below threshold
            for (let d = 1; d <= totalSeats; d++) {
                quotients.push({ party, quotient: votes / d });
            }
        }
        quotients.sort((a, b) => b.quotient - a.quotient);
        const seats = {};
        for (const party of Object.keys(partyVotes)) seats[party] = 0;
        for (let i = 0; i < totalSeats; i++) {
            seats[quotients[i].party]++;
        }
        return seats;
    }

    // Allocate seats to constituencies for a party
    allocateConstituencySeats(party, nationalSeats) {
        const constituencies = Object.keys(CONSTITUENCIES);
        const weights = {};
        let totalWeight = 0;

        for (const c of constituencies) {
            const modifier = REGIONAL_STRENGTH[c]?.[party] || 1.0;
            const cSeats = CONSTITUENCIES[c].seats;
            weights[c] = modifier * cSeats;
            totalWeight += weights[c];
        }

        // Distribute seats proportionally
        const cSeats = {};
        let allocated = 0;
        const remainders = {};

        for (const c of constituencies) {
            const exact = (weights[c] / totalWeight) * nationalSeats;
            cSeats[c] = Math.floor(exact);
            remainders[c] = exact - cSeats[c];
            allocated += cSeats[c];
        }

        // Largest remainder method for remaining seats
        const remaining = nationalSeats - allocated;
        const sorted = Object.entries(remainders).sort((a, b) => b[1] - a[1]);
        for (let i = 0; i < remaining; i++) {
            cSeats[sorted[i][0]]++;
        }

        return cSeats;
    }

    // Score individual candidates within a constituency
    scoreCandidate(candidate, partyPollPct) {
        let score = 0;

        // List position factor (lower = better)
        score += Math.max(0, 10 - candidate.listPosition) * 5;

        // Personal votes factor (normalized)
        score += Math.log(1 + candidate.personalVotes2022) * 3;

        // Incumbent bonus
        if (candidate.incumbent) score += 15;

        // Notable/leader bonus
        if (candidate.notable) score += 20;

        // Party poll strength factor
        score *= (1 + partyPollPct / 100);

        return score;
    }

    // Run a single simulation with noise
    runSimulation(noise = 0) {
        const polls = {};
        let total = 0;

        for (const party of Object.keys(PARTIES)) {
            let pct = this.latestPolls[party] || 0;
            if (noise > 0) {
                pct += (Math.random() - 0.5) * 2 * noise;
                pct = Math.max(0, pct);
            }
            polls[party] = pct;
            total += pct;
        }

        // Normalize
        for (const party of Object.keys(polls)) {
            polls[party] = (polls[party] / total) * 100;
        }

        return this.dHondt(polls, TOTAL_SEATS);
    }

    // Monte Carlo simulation for probability estimation
    runMonteCarlo(iterations = 1000) {
        const candidateWins = {};
        const partySeatDist = {};

        for (const c of CANDIDATES) {
            candidateWins[c.name + '|' + c.party + '|' + c.constituency] = 0;
        }
        for (const party of Object.keys(PARTIES)) {
            partySeatDist[party] = [];
        }

        for (let i = 0; i < iterations; i++) {
            const noise = 2.5; // ±2.5 percentage points
            const nationalSeats = this.runSimulation(noise);

            for (const party of Object.keys(PARTIES)) {
                partySeatDist[party].push(nationalSeats[party] || 0);
            }

            // For each party, allocate to constituencies and rank candidates
            for (const party of Object.keys(PARTIES)) {
                if (!nationalSeats[party]) continue;

                const cSeats = this.allocateConstituencySeats(party, nationalSeats[party]);
                const partyCandidates = CANDIDATES.filter(c => c.party === party);

                for (const [constName, seats] of Object.entries(cSeats)) {
                    if (seats === 0) continue;

                    const constCandidates = partyCandidates
                        .filter(c => c.constituency === constName)
                        .map(c => ({
                            ...c,
                            score: this.scoreCandidate(c, this.latestPolls[party] || 0) +
                                   (Math.random() - 0.5) * 10 // Add noise to candidate ranking
                        }))
                        .sort((a, b) => b.score - a.score);

                    for (let s = 0; s < Math.min(seats, constCandidates.length); s++) {
                        const key = constCandidates[s].name + '|' + constCandidates[s].party + '|' + constCandidates[s].constituency;
                        candidateWins[key]++;
                    }
                }
            }
        }

        // Calculate probabilities
        const candidateResults = CANDIDATES.map(c => {
            const key = c.name + '|' + c.party + '|' + c.constituency;
            const probability = (candidateWins[key] || 0) / iterations;
            return {
                ...c,
                probability,
                status: probability >= 0.9 ? 'safe' :
                        probability >= 0.6 ? 'likely' :
                        probability >= 0.3 ? 'tossup' : 'unlikely'
            };
        }).sort((a, b) => b.probability - a.probability);

        // Party stats
        const partyResults = {};
        for (const party of Object.keys(PARTIES)) {
            const dist = partySeatDist[party];
            dist.sort((a, b) => a - b);
            partyResults[party] = {
                ...PARTIES[party],
                pollPct: this.latestPolls[party] || 0,
                seats2022: ELECTION_2022[party]?.seats || 0,
                pct2022: ELECTION_2022[party]?.pct || 0,
                meanSeats: Math.round(dist.reduce((a, b) => a + b, 0) / dist.length),
                medianSeats: dist[Math.floor(dist.length / 2)],
                minSeats: dist[Math.floor(dist.length * 0.05)],
                maxSeats: dist[Math.floor(dist.length * 0.95)],
                aboveThreshold: dist.filter(s => s > 0).length / iterations,
            };
        }

        // Calculate historical probability trends (simulate past model runs)
        const probabilityHistory = this.calculateProbabilityHistory(candidateResults);

        this.results = {
            candidates: candidateResults,
            parties: partyResults,
            nationalSeats: this.runSimulation(0), // Baseline no-noise
            probabilityHistory,
        };

        return this.results;
    }

    // Simulate historical probability trends based on polling history
    calculateProbabilityHistory(currentCandidates) {
        const history = {};

        for (const poll of POLLING_HISTORY) {
            const savedPolls = this.latestPolls;
            this.latestPolls = poll;

            // Quick simulation (fewer iterations for speed)
            const candidateWins = {};
            for (const c of CANDIDATES) {
                candidateWins[c.name + '|' + c.party + '|' + c.constituency] = 0;
            }

            const quickIterations = 200;
            for (let i = 0; i < quickIterations; i++) {
                const nationalSeats = this.runSimulation(2.5);
                for (const party of Object.keys(PARTIES)) {
                    if (!nationalSeats[party]) continue;
                    const cSeats = this.allocateConstituencySeats(party, nationalSeats[party]);
                    const partyCandidates = CANDIDATES.filter(c => c.party === party);

                    for (const [constName, seats] of Object.entries(cSeats)) {
                        if (seats === 0) continue;
                        const constCandidates = partyCandidates
                            .filter(c => c.constituency === constName)
                            .map(c => ({ ...c, score: this.scoreCandidate(c, poll[party] || 0) + (Math.random() - 0.5) * 10 }))
                            .sort((a, b) => b.score - a.score);

                        for (let s = 0; s < Math.min(seats, constCandidates.length); s++) {
                            const key = constCandidates[s].name + '|' + constCandidates[s].party + '|' + constCandidates[s].constituency;
                            candidateWins[key]++;
                        }
                    }
                }
            }

            for (const c of CANDIDATES) {
                const key = c.name + '|' + c.party + '|' + c.constituency;
                if (!history[key]) history[key] = [];
                history[key].push({
                    date: poll.date,
                    probability: (candidateWins[key] || 0) / quickIterations
                });
            }

            this.latestPolls = savedPolls;
        }

        return history;
    }
}
