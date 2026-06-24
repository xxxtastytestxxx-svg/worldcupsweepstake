import fs from 'fs';
import path from 'path';

// If you don't have Node 18+, uncomment below to use node-fetch or axios
// import fetch from 'node-fetch';

const FIREBASE_DB_URL = "https://world-cup-sweepstake-82b1b-default-rtdb.europe-west1.firebasedatabase.app";
// Defaulting to the provided key. It can still be overridden via environment variable.
const API_TOKEN = process.env.FOOTBALL_DATA_API_KEY || "9cf728eab2e34cb5805c688fd81fdf0f";

if (!API_TOKEN) {
    console.error("ERROR: Missing API_TOKEN.");
    process.exit(1);
}

// football-data.org internal team mapping (we will need to adjust IDs when the World Cup endpoints are fully published)
// Since the 2026 WC teams aren't fully known, this is a generalized mapper to match 3-letter codes used in your DB
const TLA_TO_CODE = {
    "ARG": "ARG", "AUS": "AUS", "AUT": "AUT", "BEL": "BEL", "BRA": "BRA", "COL": "COL",
    "CRO": "CRO", "ECU": "ECU", "ENG": "ENG", "FRA": "FRA", "GER": "GER", "IRN": "IRN",
    "JPN": "JPN", "MEX": "MEX", "MAR": "MAR", "NED": "NED", "POR": "POR", "SEN": "SEN",
    "KOR": "KOR", "ESP": "ESP", "SUI": "SUI", "TUR": "TUR", "URU": "URU", "USA": "USA",
    "ALG": "ALG", "BIH": "BIH", "CAN": "CAN", "CPV": "CPV", "CIV": "CIV", "CUW": "CUW",
    "CZE": "CZE", "COD": "COD", "EGY": "EGY", "GHA": "GHA", "HAI": "HAI", "IRQ": "IRQ",
    "JOR": "JOR", "NZL": "NZL", "NOR": "NOR", "PAN": "PAN", "PAR": "PAR", "QAT": "QAT",
    "KSA": "KSA", "SCO": "SCO", "RSA": "RSA", "SWE": "SWE", "TUN": "TUN", "UZB": "UZB"
};

async function updateFirebase(path, data) {
    const url = `${FIREBASE_DB_URL}/${path}.json`;
    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            console.error(`Firebase write failed for ${path}: ${response.statusText}`);
        }
    } catch (e) {
        console.error("Firebase update error: ", e);
    }
}

async function fetchLiveScores() {
    try {
        // Fetch matches for the current day from football-data.org
        // Note: For World Cup, the competition code is typically 'WC'.
        console.log(`[${new Date().toISOString()}] Fetching live scores...`);
        const response = await fetch('https://api.football-data.org/v4/competitions/WC/matches?status=IN_PLAY,PAUSED,FINISHED', {
            headers: { 'X-Auth-Token': API_TOKEN }
        });

        if (!response.ok) {
            console.error(`API Fetch failed: ${response.status} ${response.statusText}`);
            return;
        }

        const data = await response.json();
        if (!data.matches || data.matches.length === 0) {
            console.log("No live or recently finished matches found right now.");
            return;
        }

        for (const match of data.matches) {
            const t1TLA = match.homeTeam.tla;
            const t2TLA = match.awayTeam.tla;

            if (!t1TLA || !t2TLA) continue;

            const dbCode1 = TLA_TO_CODE[t1TLA];
            const dbCode2 = TLA_TO_CODE[t2TLA];

            if (!dbCode1 || !dbCode2) continue;

            const isFinished = match.status === 'FINISHED' || match.status === 'AWARDED';
            const inProgress = match.status === 'IN_PLAY' || match.status === 'PAUSED';
            const isHalfTime = match.status === 'PAUSED';

            const score1 = match.score.fullTime.home ?? 0;
            const score2 = match.score.fullTime.away ?? 0;

            // Format time string
            let timeStr = "";
            if (isFinished) timeStr = "FT";
            else if (isHalfTime) timeStr = "HT";
            else if (inProgress) timeStr = "LIVE";

            // If it's a knockout match, pen/aet data might be available
            let aet = false;
            let pens = false;
            let pen1 = 0; let pen2 = 0;

            if (match.score.duration === 'EXTRA_TIME' || match.score.duration === 'PENALTY_SHOOTOUT') {
                aet = true;
                if (match.score.penalties && (match.score.penalties.home > 0 || match.score.penalties.away > 0)) {
                    pens = true;
                    pen1 = match.score.penalties.home;
                    pen2 = match.score.penalties.away;
                }
            }

            // We need to figure out which match ID this corresponds to. 
            // In a production scenario, you would map API Match IDs directly to your Firebase Match IDs.
            // For now, we will query Firebase to find a match that has these two teams.
            const fbRes = await fetch(`${FIREBASE_DB_URL}/matches.json`);
            const allMatches = await fbRes.json();

            let targetGroup = null;
            let targetMatchId = null;
            let isFlipped = false;

            // Search groups
            ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].forEach(grp => {
                const groupMatches = allMatches[grp] || {};
                Object.keys(groupMatches).forEach(mId => {
                    const m = groupMatches[mId];
                    if (m.team1 === dbCode1 && m.team2 === dbCode2) {
                        targetGroup = grp; targetMatchId = mId; isFlipped = false;
                    } else if (m.team1 === dbCode2 && m.team2 === dbCode1) {
                        targetGroup = grp; targetMatchId = mId; isFlipped = true;
                    }
                });
            });

            // Update Group Match
            if (targetMatchId) {
                const finalScore1 = isFlipped ? score2 : score1;
                const finalScore2 = isFlipped ? score1 : score2;

                const existingMatch = allMatches[targetGroup][targetMatchId];
                // CRITICAL SAFEGUARD: If the match is already finished in the database, DO NOT overwrite it.
                // This protects your manual edits in the admin panel for past games!
                if (existingMatch && existingMatch.played && !existingMatch.inProgress && !inProgress) {
                    console.log(`Match ${targetMatchId} is already marked as finished. Skipping API overwrite.`);
                    continue;
                }

                const payload = {
                    score1: finalScore1,
                    score2: finalScore2,
                    played: true,
                    inProgress: inProgress,
                    time: timeStr
                };
                console.log(`Updating Group Match ${targetMatchId} (${isFlipped ? dbCode2 : dbCode1} vs ${isFlipped ? dbCode1 : dbCode2}): ${finalScore1}-${finalScore2} [${timeStr}]`);
                await updateFirebase(`matches/${targetGroup}/${targetMatchId}`, payload);
            } else {
                // If not found in groups, search knockouts
                const koMatches = allMatches['knockouts'] || {};
                // Since knockout teams are dynamic, we just check if any match is currently set with these two teams
                // NOTE: Knockout keys are R32-1, R16-1, FIN, 3RD, etc.
                // However, they might not be fully known in Firebase.
                // To do this robustly, we'd need to map the API's stage names to your KO matches.
            }
        }
    } catch (e) {
        console.error("Error fetching live scores: ", e);
    }
}

if (process.env.GITHUB_ACTIONS) {
    // Run once and exit when triggered by GitHub Actions
    fetchLiveScores().then(() => {
        console.log("GitHub Action Updater finished successfully.");
        process.exit(0);
    });
} else {
    // Run immediately and then loop every 2 minutes when run locally
    fetchLiveScores();
    setInterval(fetchLiveScores, 120000);
    console.log("Local Auto Updater started... Checking every 2 minutes. Press Ctrl+C to stop.");
}
