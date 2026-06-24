import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDy9EGYDn8bFcrA-XSkOMrE4hRoTFPTGs8",
    authDomain: "world-cup-sweepstake-82b1b.firebaseapp.com",
    databaseURL: "https://world-cup-sweepstake-82b1b-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "world-cup-sweepstake-82b1b",
    storageBucket: "world-cup-sweepstake-82b1b.firebasestorage.app",
    messagingSenderId: "203930678989",
    appId: "1:203930678989:web:a53838f0aaf2d749e1db84"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const teamsData = {
    "ARG": { name: "Argentina", pot: "A", fifa: 1 }, "AUS": { name: "Australia", pot: "A", fifa: 27 }, "AUT": { name: "Austria", pot: "A", fifa: 24 }, "BEL": { name: "Belgium", pot: "A", fifa: 9 },
    "BRA": { name: "Brazil", pot: "A", fifa: 6 }, "COL": { name: "Colombia", pot: "A", fifa: 13 }, "CRO": { name: "Croatia", pot: "A", fifa: 11 }, "ECU": { name: "Ecuador", pot: "A", fifa: 23 },
    "ENG": { name: "England", pot: "A", fifa: 4 }, "FRA": { name: "France", pot: "A", fifa: 3 }, "GER": { name: "Germany", pot: "A", fifa: 10 }, "IRN": { name: "Iran", pot: "A", fifa: 20 },
    "JPN": { name: "Japan", pot: "A", fifa: 18 }, "MEX": { name: "Mexico", pot: "A", fifa: 14 }, "MAR": { name: "Morocco", pot: "A", fifa: 7 }, "NED": { name: "Netherlands", pot: "A", fifa: 8 },
    "POR": { name: "Portugal", pot: "A", fifa: 5 }, "SEN": { name: "Senegal", pot: "A", fifa: 15 }, "KOR": { name: "South Korea", pot: "A", fifa: 25 }, "ESP": { name: "Spain", pot: "A", fifa: 2 },
    "SUI": { name: "Switzerland", pot: "A", fifa: 19 }, "TUR": { name: "Turkey", pot: "A", fifa: 22 }, "URU": { name: "Uruguay", pot: "A", fifa: 16 }, "USA": { name: "USA", pot: "A", fifa: 17 },
    "ALG": { name: "Algeria", pot: "B", fifa: 28 }, "BIH": { name: "Bosnia & Herzegovina", pot: "B", fifa: 64 }, "CAN": { name: "Canada", pot: "B", fifa: 30 }, "CPV": { name: "Cape Verde", pot: "B", fifa: 67 },
    "CIV": { name: "Ivory Coast", pot: "B", fifa: 33 }, "CUW": { name: "Curacao", pot: "B", fifa: 82 }, "CZE": { name: "Czechia", pot: "B", fifa: 40 }, "COD": { name: "DR Congo", pot: "B", fifa: 46 },
    "EGY": { name: "Egypt", pot: "B", fifa: 29 }, "GHA": { name: "Ghana", pot: "B", fifa: 73 }, "HAI": { name: "Haiti", pot: "B", fifa: 83 }, "IRQ": { name: "Iraq", pot: "B", fifa: 57 },
    "JOR": { name: "Jordan", pot: "B", fifa: 63 }, "NZL": { name: "New Zealand", pot: "B", fifa: 85 }, "NOR": { name: "Norway", pot: "B", fifa: 31 }, "PAN": { name: "Panama", pot: "B", fifa: 34 },
    "PAR": { name: "Paraguay", pot: "B", fifa: 41 }, "QAT": { name: "Qatar", pot: "B", fifa: 56 }, "KSA": { name: "Saudi Arabia", pot: "B", fifa: 61 }, "SCO": { name: "Scotland", pot: "B", fifa: 42 },
    "RSA": { name: "South Africa", pot: "B", fifa: 60 }, "SWE": { name: "Sweden", pot: "B", fifa: 38 }, "TUN": { name: "Tunisia", pot: "B", fifa: 45 }, "UZB": { name: "Uzbekistan", pot: "B", fifa: 50 }
};

const groupStages = {
    "A": ["MEX", "RSA", "KOR", "CZE"], "B": ["CAN", "BIH", "QAT", "SUI"], "C": ["BRA", "MAR", "HAI", "SCO"], "D": ["USA", "PAR", "AUS", "TUR"],
    "E": ["GER", "CUW", "CIV", "ECU"], "F": ["NED", "JPN", "SWE", "TUN"], "G": ["BEL", "EGY", "IRN", "NZL"], "H": ["ESP", "CPV", "KSA", "URU"],
    "I": ["FRA", "SEN", "IRQ", "NOR"], "J": ["ARG", "ALG", "AUT", "JOR"], "K": ["POR", "COD", "UZB", "COL"], "L": ["ENG", "CRO", "GHA", "PAN"]
};

let dbTeams = {}; let dbMatches = {}; let dbCombinations = {};
let activeMainTab = 'groups'; let activeGroupTab = 'A'; let activeKoTab = 'r32';
let knockoutViewMode = 'rounds';

onValue(ref(db, 'teams'), (snapshot) => { dbTeams = snapshot.val() || {}; renderCurrentView(); });
onValue(ref(db, 'matches'), (snapshot) => { dbMatches = snapshot.val() || {}; renderCurrentView(); });
onValue(ref(db, 'combinations'), (snapshot) => { dbCombinations = snapshot.val() || {}; renderCurrentView(); });

window.addEventListener('mainTabChanged', (e) => { activeMainTab = e.detail; renderCurrentView(); });
window.addEventListener('groupTabChanged', (e) => { activeMainTab = 'groups'; activeGroupTab = e.detail; renderCurrentView(); });
window.addEventListener('koTabChanged', (e) => { activeMainTab = 'knockouts'; activeKoTab = e.detail; renderCurrentView(); });
window.addEventListener('toggleKoViewMode', () => { knockoutViewMode = knockoutViewMode === 'rounds' ? 'bracket' : 'rounds'; renderCurrentView(); });
window.addEventListener('statusTabChanged', () => { activeMainTab = 'status'; renderCurrentView(); });

function getDisplayName(code) {
    if (!code) return "TBD";
    return dbTeams[code]?.owner ? `${dbTeams[code].owner} (${code})` : (teamsData[code]?.name || code);
}
function isAssigned(code) { return !!(dbTeams[code] && dbTeams[code].owner); }

function getGroupDirectMatchResult(groupId, codeA, codeB) {
    const groupMatches = dbMatches[groupId] || {};
    const match = Object.values(groupMatches).find(m => m && ((m.team1 === codeA && m.team2 === codeB) || (m.team1 === codeB && m.team2 === codeA)));
    if (!match || !match.played || match.inProgress) return null;
    const scoreA = match.team1 === codeA ? match.score1 : match.score2;
    const scoreB = match.team1 === codeA ? match.score2 : match.score1;
    if (scoreA > scoreB) return 1;
    if (scoreA < scoreB) return -1;
    return 0;
}

function getPlayedGroupMatchCount() {
    let playedCount = 0;
    Object.keys(groupStages).forEach(g => {
        Object.values(dbMatches[g] || {}).forEach(m => {
            if (m && m.played && !m.inProgress) playedCount++;
        });
    });
    return playedCount;
}

function isGroupStageComplete() { return getPlayedGroupMatchCount() >= 72; }

function getCurrentPhase() {
    if (!isGroupStageComplete()) return "Group Stage";
    const bracket = getFullBracket(true);
    const countPlayed = (roundData) => (roundData || []).filter(m => {
        const res = dbMatches['knockouts']?.[m.id];
        return res && res.played && !res.inProgress;
    }).length;

    if (countPlayed(bracket.r32) < 16) return "Round of 32";
    if (countPlayed(bracket.r16) < 8) return "Round of 16";
    if (countPlayed(bracket.qf) < 4) return "Quarter Finals";
    if (countPlayed(bracket.sf) < 2) return "Semi Finals";
    return "Finals";
}

function updateGlobalLiveBadge() {
    let anyLive = false;
    Object.values(dbMatches || {}).forEach(groupOrKo => {
        if (groupOrKo && typeof groupOrKo === 'object') {
            Object.values(groupOrKo).forEach(m => {
                if (m && m.played && m.inProgress) anyLive = true;
            });
        }
    });
    const badge = document.getElementById('global-live-badge');
    if (badge) {
        if (anyLive) {
            badge.innerText = "Match in Progress";
            badge.className = "text-[10px] md:text-xs text-white bg-red-600 px-2 md:px-3 py-1 rounded uppercase font-bold tracking-wider shadow-[0_0_10px_rgba(220,38,38,0.8)] animate-pulse transition-all duration-300 ml-3 shrink-0";
        } else {
            badge.innerText = "LIVE";
            badge.className = "text-[10px] md:text-xs text-black bg-[#D4AF37] px-2 md:px-3 py-1 rounded uppercase font-bold tracking-wider shadow-[0_0_10px_rgba(212,175,55,0.5)] transition-all duration-300 ml-3 shrink-0";
        }
    }
}

function getFixtureDetails(groupId, matchIndex) {
    const schedule = {
        "A": [{ d: "Thu 11 Jun, 20:00 BST", c: "ITV" }, { d: "Fri 12 Jun, 03:00 BST", c: "ITV" }, { d: "Fri 19 Jun, 02:00 BST", c: "BBC" }, { d: "Thu 18 Jun, 17:00 BST", c: "BBC" }, { d: "Thu 25 Jun, 02:00 BST", c: "BBC" }, { d: "Thu 25 Jun, 02:00 BST", c: "BBC" }],
        "B": [{ d: "Fri 12 Jun, 20:00 BST", c: "BBC" }, { d: "Sat 13 Jun, 20:00 BST", c: "ITV" }, { d: "Thu 18 Jun, 23:00 BST", c: "ITV" }, { d: "Thu 18 Jun, 20:00 BST", c: "ITV" }, { d: "Wed 24 Jun, 20:00 BST", c: "ITV" }, { d: "Wed 24 Jun, 20:00 BST", c: "ITV" }],
        "C": [{ d: "Sat 13 Jun, 23:00 BST", c: "BBC" }, { d: "Sun 14 Jun, 02:00 BST", c: "BBC" }, { d: "Sat 20 Jun, 02:00 BST", c: "ITV" }, { d: "Fri 19 Jun, 23:00 BST", c: "ITV" }, { d: "Wed 24 Jun, 23:00 BST", c: "BBC" }, { d: "Wed 24 Jun, 23:00 BST", c: "BBC" }],
        "D": [{ d: "Sat 13 Jun, 02:00 BST", c: "BBC" }, { d: "Sun 14 Jun, 05:00 BST", c: "ITV" }, { d: "Fri 19 Jun, 20:00 BST", c: "BBC" }, { d: "Sat 20 Jun, 05:00 BST", c: "ITV" }, { d: "Fri 26 Jun, 03:00 BST", c: "ITV" }, { d: "Fri 26 Jun, 03:00 BST", c: "ITV" }],
        "E": [{ d: "Sun 14 Jun, 18:00 BST", c: "ITV" }, { d: "Mon 15 Jun, 00:00 BST", c: "BBC" }, { d: "Sat 20 Jun, 21:00 BST", c: "ITV" }, { d: "Sun 21 Jun, 01:00 BST", c: "BBC" }, { d: "Thu 25 Jun, 21:00 BST", c: "BBC" }, { d: "Thu 25 Jun, 21:00 BST", c: "BBC" }],
        "F": [{ d: "Sun 14 Jun, 21:00 BST", c: "ITV" }, { d: "Mon 15 Jun, 03:00 BST", c: "ITV" }, { d: "Sat 20 Jun, 18:00 BST", c: "BBC" }, { d: "Sun 21 Jun, 05:00 BST", c: "BBC" }, { d: "Fri 26 Jun, 00:00 BST", c: "BBC" }, { d: "Fri 26 Jun, 00:00 BST", c: "BBC" }],
        "G": [{ d: "Mon 15 Jun, 20:00 BST", c: "BBC" }, { d: "Tue 16 Jun, 02:00 BST", c: "BBC" }, { d: "Sun 21 Jun, 20:00 BST", c: "ITV" }, { d: "Mon 22 Jun, 02:00 BST", c: "ITV" }, { d: "Sat 27 Jun, 04:00 BST", c: "BBC" }, { d: "Sat 27 Jun, 04:00 BST", c: "BBC" }],
        "H": [{ d: "Mon 15 Jun, 17:00 BST", c: "ITV" }, { d: "Mon 15 Jun, 23:00 BST", c: "ITV" }, { d: "Sun 21 Jun, 17:00 BST", c: "ITV" }, { d: "Sun 21 Jun, 23:00 BST", c: "BBC" }, { d: "Sat 27 Jun, 01:00 BST", c: "ITV" }, { d: "Sat 27 Jun, 01:00 BST", c: "ITV" }],
        "I": [{ d: "Tue 16 Jun, 20:00 BST", c: "BBC" }, { d: "Tue 16 Jun, 23:00 BST", c: "BBC" }, { d: "Mon 22 Jun, 22:00 BST", c: "BBC" }, { d: "Tue 23 Jun, 01:00 BST", c: "ITV" }, { d: "Fri 26 Jun, 20:00 BST", c: "ITV" }, { d: "Fri 26 Jun, 20:00 BST", c: "ITV" }],
        "J": [{ d: "Wed 17 Jun, 02:00 BST", c: "ITV" }, { d: "Wed 17 Jun, 05:00 BST", c: "BBC" }, { d: "Mon 22 Jun, 18:00 BST", c: "BBC" }, { d: "Tue 23 Jun, 04:00 BST", c: "ITV" }, { d: "Sun 28 Jun, 03:00 BST", c: "BBC" }, { d: "Sun 28 Jun, 03:00 BST", c: "BBC" }],
        "K": [{ d: "Wed 17 Jun, 18:00 BST", c: "BBC" }, { d: "Thu 18 Jun, 03:00 BST", c: "BBC" }, { d: "Tue 23 Jun, 18:00 BST", c: "ITV" }, { d: "Wed 24 Jun, 03:00 BST", c: "ITV" }, { d: "Sun 28 Jun, 00:30 BST", c: "BBC" }, { d: "Sun 28 Jun, 00:30 BST", c: "BBC" }],
        "L": [{ d: "Wed 17 Jun, 21:00 BST", c: "ITV" }, { d: "Thu 18 Jun, 00:00 BST", c: "ITV" }, { d: "Tue 23 Jun, 21:00 BST", c: "BBC" }, { d: "Wed 24 Jun, 00:00 BST", c: "BBC" }, { d: "Sat 27 Jun, 22:00 BST", c: "ITV" }, { d: "Sat 27 Jun, 22:00 BST", c: "ITV" }]
    };
    return schedule[groupId][matchIndex] || { d: "TBC", c: "" };
}

function calculateGroup(groupId, includeLive = true) {
    const teams = groupStages[groupId];
    const standings = teams.map(code => ({ code, name: getDisplayName(code), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0, conduct: 0, originGroup: groupId }));
    const groupMatches = dbMatches[groupId] || {};

    const validMatches = Object.values(groupMatches).filter(m => m && m.played && (includeLive || !m.inProgress));

    validMatches.forEach(match => {
        const t1 = standings.find(t => t.code === match.team1); const t2 = standings.find(t => t.code === match.team2);
        if (!t1 || !t2) return;
        t1.played++; t2.played++;
        t1.gf += match.score1; t1.ga += match.score2; t2.gf += match.score2; t2.ga += match.score1;
        if (match.score1 > match.score2) { t1.won++; t1.pts += 3; t2.lost++; }
        else if (match.score1 < match.score2) { t2.won++; t2.pts += 3; t1.lost++; }
        else { t1.drawn++; t2.drawn++; t1.pts += 1; t2.pts += 1; }

        if (match.t1c) t1.conduct -= (match.t1c.yc * 1 + match.t1c.irc * 3 + match.t1c.drc * 4 + match.t1c.ydrc * 5);
        if (match.t2c) t2.conduct -= (match.t2c.yc * 1 + match.t2c.irc * 3 + match.t2c.drc * 4 + match.t2c.ydrc * 5);
    });
    standings.forEach(t => t.gd = t.gf - t.ga);
    standings.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;

        const h2h = validMatches.find(m => ((m.team1 === a.code && m.team2 === b.code) || (m.team1 === b.code && m.team2 === a.code)));
        let aH2hPts = 0, bH2hPts = 0, aH2hGd = 0, bH2hGd = 0, aH2hGf = 0, bH2hGf = 0;
        if (h2h) {
            const aScore = h2h.team1 === a.code ? h2h.score1 : h2h.score2;
            const bScore = h2h.team1 === b.code ? h2h.score1 : h2h.score2;
            if (aScore > bScore) { aH2hPts = 3; } else if (aScore < bScore) { bH2hPts = 3; } else { aH2hPts = 1; bH2hPts = 1; }
            aH2hGd = aScore - bScore; bH2hGd = bScore - aScore;
            aH2hGf = aScore; bH2hGf = bScore;
        }

        if (aH2hPts !== bH2hPts) return bH2hPts - aH2hPts;
        if (aH2hGd !== bH2hGd) return bH2hGd - aH2hGd;
        if (aH2hGf !== bH2hGf) return bH2hGf - aH2hGf;

        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        if (b.conduct !== a.conduct) return b.conduct - a.conduct;
        return teamsData[a.code].fifa - teamsData[b.code].fifa;
    });
    return standings;
}

function calculateThirdPlaceStandings(includeLive = true) {
    const thirdPlacedTeams = [];
    Object.keys(groupStages).forEach(group => { thirdPlacedTeams.push(calculateGroup(group, includeLive)[2]); });
    thirdPlacedTeams.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        if (b.conduct !== a.conduct) return b.conduct - a.conduct;
        return teamsData[a.code].fifa - teamsData[b.code].fifa;
    });
    return thirdPlacedTeams;
}

function getFullBracket(predict = true) {
    const ranks = {};
    Object.keys(groupStages).forEach(group => { ranks[group] = calculateGroup(group, predict); });
    const thirds = calculateThirdPlaceStandings(predict);

    const top8Thirds = thirds.slice(0, 8);
    const comboString = top8Thirds.map(t => t.originGroup).sort().join('');
    const matrixRow = dbCombinations[comboString] || {};

    const getThird = (matchId) => {
        if (!predict && !isGroupStageComplete()) return "3rd Place Team";
        const reqGroup = matrixRow[matchId];
        if (!reqGroup) return "3rd Place Team";
        const team = thirds.find(t => t.originGroup === reqGroup);
        return team ? team.code : "3rd Place Team";
    };

    const getSlot = (grp, pos) => {
        if (predict || isGroupStageComplete()) {
            if (pos === '1st') return ranks[grp][0].code;
            if (pos === '2nd') return ranks[grp][1].code;
        }

        const groupMatches = dbMatches[grp] || {};
        const playedCount = Object.values(groupMatches).filter(m => m && m.played && !m.inProgress).length;
        if (playedCount === 6) {
            if (pos === '1st') return ranks[grp][0].code;
            if (pos === '2nd') return ranks[grp][1].code;
        } else {
            const t0 = ranks[grp][0]; const t1 = ranks[grp][1]; const t2 = ranks[grp][2];
            const t1Max = t1.pts + (3 - t1.played) * 3;
            const t2Max = t2.pts + (3 - t2.played) * 3;
            if (pos === '1st' && t0.pts > t1Max) return t0.code;
            if (pos === '2nd' && t0.pts > t1Max && t1.pts > t2Max) return t1.code;
        }
        return `${pos} Grp ${grp}`;
    };

    const r32 = [
        { id: "R32-1", title: "Match 73", t1: getSlot('A', '2nd'), t2: getSlot('B', '2nd'), date: "Sun 28 Jun, 20:00 BST" },
        { id: "R32-2", title: "Match 76", t1: getSlot('C', '1st'), t2: getSlot('F', '2nd'), date: "Mon 29 Jun, 18:00 BST" },
        { id: "R32-3", title: "Match 74", t1: getSlot('E', '1st'), t2: getThird("R32-2"), date: "Mon 29 Jun, 21:30 BST" },
        { id: "R32-4", title: "Match 75", t1: getSlot('F', '1st'), t2: getSlot('C', '2nd'), date: "Tue 30 Jun, 02:00 BST" },
        { id: "R32-5", title: "Match 78", t1: getSlot('E', '2nd'), t2: getSlot('I', '2nd'), date: "Tue 30 Jun, 18:00 BST" },
        { id: "R32-6", title: "Match 77", t1: getSlot('I', '1st'), t2: getThird("R32-5"), date: "Tue 30 Jun, 22:00 BST" },
        { id: "R32-7", title: "Match 79", t1: getSlot('A', '1st'), t2: getThird("R32-7"), date: "Wed 1 Jul, 02:00 BST" },
        { id: "R32-8", title: "Match 80", t1: getSlot('L', '1st'), t2: getThird("R32-8"), date: "Wed 1 Jul, 17:00 BST" },
        { id: "R32-9", title: "Match 82", t1: getSlot('G', '1st'), t2: getThird("R32-10"), date: "Wed 1 Jul, 21:00 BST" },
        { id: "R32-10", title: "Match 81", t1: getSlot('D', '1st'), t2: getThird("R32-9"), date: "Thu 2 Jul, 01:00 BST" },
        { id: "R32-11", title: "Match 84", t1: getSlot('H', '1st'), t2: getSlot('J', '2nd'), date: "Thu 2 Jul, 20:00 BST" },
        { id: "R32-12", title: "Match 83", t1: getSlot('K', '2nd'), t2: getSlot('L', '2nd'), date: "Fri 3 Jul, 00:00 BST" },
        { id: "R32-13", title: "Match 85", t1: getSlot('B', '1st'), t2: getThird("R32-13"), date: "Fri 3 Jul, 04:00 BST" },
        { id: "R32-14", title: "Match 88", t1: getSlot('D', '2nd'), t2: getSlot('G', '2nd'), date: "Fri 3 Jul, 19:00 BST" },
        { id: "R32-15", title: "Match 86", t1: getSlot('J', '1st'), t2: getSlot('H', '2nd'), date: "Fri 3 Jul, 23:00 BST" },
        { id: "R32-16", title: "Match 87", t1: getSlot('K', '1st'), t2: getThird("R32-15"), date: "Sat 4 Jul, 02:30 BST" }
    ];

    const resolveWinner = (roundArray, mId) => {
        const m = (roundArray || []).find(x => x.id === mId);
        if (!m || !m.t1 || !m.t2) return `Winner ${mId}`;
        const res = dbMatches['knockouts']?.[mId];
        if (!res || !res.played || res.inProgress) return `Winner ${m.title || mId}`;
        if (res.score1 > res.score2) return m.t1;
        if (res.score2 > res.score1) return m.t2;
        if (res.pens && res.pen1 > res.pen2) return m.t1;
        if (res.pens && res.pen2 > res.pen1) return m.t2;
        return `Winner ${m.title || mId}`;
    };

    const resolveLoser = (roundArray, mId) => {
        const m = (roundArray || []).find(x => x.id === mId);
        if (!m || !m.t1 || !m.t2) return `Loser ${mId}`;
        const res = dbMatches['knockouts']?.[mId];
        if (!res || !res.played || res.inProgress) return `Loser ${m.title || mId}`;
        if (res.score1 > res.score2) return m.t2;
        if (res.score2 > res.score1) return m.t1;
        if (res.pens && res.pen1 > res.pen2) return m.t2;
        if (res.pens && res.pen2 > res.pen1) return m.t1;
        return `Loser ${m.title || mId}`;
    };

    const r16 = [
        { id: "R16-1", title: "Match 90", t1: resolveWinner(r32, "R32-1"), t2: resolveWinner(r32, "R32-4"), date: "Sat 4 Jul, 18:00 BST" },
        { id: "R16-2", title: "Match 89", t1: resolveWinner(r32, "R32-3"), t2: resolveWinner(r32, "R32-6"), date: "Sat 4 Jul, 22:00 BST" },
        { id: "R16-3", title: "Match 91", t1: resolveWinner(r32, "R32-2"), t2: resolveWinner(r32, "R32-5"), date: "Sun 5 Jul, 21:00 BST" },
        { id: "R16-4", title: "Match 92", t1: resolveWinner(r32, "R32-7"), t2: resolveWinner(r32, "R32-8"), date: "Mon 6 Jul, 01:00 BST" },
        { id: "R16-5", title: "Match 93", t1: resolveWinner(r32, "R32-12"), t2: resolveWinner(r32, "R32-11"), date: "Mon 6 Jul, 20:00 BST" },
        { id: "R16-6", title: "Match 94", t1: resolveWinner(r32, "R32-10"), t2: resolveWinner(r32, "R32-9"), date: "Tue 7 Jul, 01:00 BST" },
        { id: "R16-7", title: "Match 95", t1: resolveWinner(r32, "R32-15"), t2: resolveWinner(r32, "R32-14"), date: "Tue 7 Jul, 17:00 BST" },
        { id: "R16-8", title: "Match 96", t1: resolveWinner(r32, "R32-13"), t2: resolveWinner(r32, "R32-16"), date: "Tue 7 Jul, 21:00 BST" }
    ];

    const qf = [
        { id: "QF-1", title: "Match 97", t1: resolveWinner(r16, "R16-2"), t2: resolveWinner(r16, "R16-1"), date: "Thu 9 Jul, 21:00 BST" },
        { id: "QF-2", title: "Match 98", t1: resolveWinner(r16, "R16-5"), t2: resolveWinner(r16, "R16-6"), date: "Fri 10 Jul, 20:00 BST" },
        { id: "QF-3", title: "Match 99", t1: resolveWinner(r16, "R16-3"), t2: resolveWinner(r16, "R16-4"), date: "Sat 11 Jul, 22:00 BST" },
        { id: "QF-4", title: "Match 100", t1: resolveWinner(r16, "R16-7"), t2: resolveWinner(r16, "R16-8"), date: "Sun 12 Jul, 02:00 BST" }
    ];

    const sf = [
        { id: "SF-1", title: "Match 101", t1: resolveWinner(qf, "QF-1"), t2: resolveWinner(qf, "QF-2"), date: "Tue 14 Jul, 20:00 BST" },
        { id: "SF-2", title: "Match 102", t1: resolveWinner(qf, "QF-3"), t2: resolveWinner(qf, "QF-4"), date: "Wed 15 Jul, 20:00 BST" }
    ];

    const finals = [
        { id: "FIN", title: "Match 104", t1: resolveWinner(sf, "SF-1"), t2: resolveWinner(sf, "SF-2"), date: "Sun 19 Jul, 20:00 BST" },
        { id: "3RD", title: "Match 103", t1: resolveLoser(sf, "SF-1"), t2: resolveLoser(sf, "SF-2"), date: "Sat 18 Jul, 22:00 BST" }
    ];

    return { r32: r32 || [], r16: r16 || [], qf: qf || [], sf: sf || [], finals: finals || [] };
}

function isGuaranteedTop2(groupId, teamCode) {
    const teams = groupStages[groupId];
    const groupMatches = dbMatches[groupId] || {};
    const rawFixtures = [
        [teams[0], teams[1]], [teams[2], teams[3]], 
        [teams[0], teams[2]], [teams[1], teams[3]], 
        [teams[0], teams[3]], [teams[1], teams[2]]
    ];
    
    const unplayedMatches = [];
    const basePts = {}; teams.forEach(t => basePts[t] = 0);
    const baseH2H = {}; 
    const getH2hKey = (tA, tB) => tA < tB ? `${tA}-${tB}` : `${tB}-${tA}`;
    
    rawFixtures.forEach((fixture, index) => {
        const matchId = `G${groupId}-M${index + 1}`;
        const matchData = groupMatches[matchId];
        const t1 = fixture[0]; const t2 = fixture[1];
        
        if (matchData && matchData.played && !matchData.inProgress) {
            let t1Goals = matchData.score1; let t2Goals = matchData.score2;
            if (matchData.team1 === t2) { t1Goals = matchData.score2; t2Goals = matchData.score1; }
            if (t1Goals > t2Goals) {
                basePts[t1] += 3; baseH2H[getH2hKey(t1, t2)] = t1;
            } else if (t1Goals < t2Goals) {
                basePts[t2] += 3; baseH2H[getH2hKey(t1, t2)] = t2;
            } else {
                basePts[t1] += 1; basePts[t2] += 1; baseH2H[getH2hKey(t1, t2)] = 'draw';
            }
        } else {
            unplayedMatches.push({t1, t2});
        }
    });
    
    let guaranteedTop2 = true;
    function simulate(matchIndex, currentPts, currentH2H) {
        if (!guaranteedTop2) return; 
        if (matchIndex === unplayedMatches.length) {
            let placedAheadCount = 0;
            for (let i=0; i<teams.length; i++) {
                const t = teams[i];
                if (t === teamCode) continue;
                if (currentPts[t] > currentPts[teamCode]) {
                    placedAheadCount++;
                } else if (currentPts[t] === currentPts[teamCode]) {
                    const winner = currentH2H[getH2hKey(teamCode, t)];
                    if (winner !== teamCode) placedAheadCount++;
                }
            }
            if (placedAheadCount >= 2) guaranteedTop2 = false;
            return;
        }
        
        const m = unplayedMatches[matchIndex];
        const h2hKey = getH2hKey(m.t1, m.t2);
        
        currentPts[m.t1] += 3; currentH2H[h2hKey] = m.t1;
        simulate(matchIndex + 1, currentPts, currentH2H);
        currentPts[m.t1] -= 3;
        
        currentPts[m.t2] += 3; currentH2H[h2hKey] = m.t2;
        simulate(matchIndex + 1, currentPts, currentH2H);
        currentPts[m.t2] -= 3;
        
        currentPts[m.t1] += 1; currentPts[m.t2] += 1; currentH2H[h2hKey] = 'draw';
        simulate(matchIndex + 1, currentPts, currentH2H);
        currentPts[m.t1] -= 1; currentPts[m.t2] -= 1;
    }
    
    simulate(0, basePts, baseH2H);
    return guaranteedTop2;
}

function getTeamStatusData(code) {
    const isGroupComplete = isGroupStageComplete();
    const phase = getCurrentPhase();
    const bracket = getFullBracket(true);
    const pot = teamsData[code].pot;

    if (isGroupComplete) {
        const madeR32 = (bracket.r32 || []).some(m => m.t1 === code || m.t2 === code);
        if (!madeR32) return 'red';

        let isGold = false, isSilver = false, isBronze = false;
        let lostAMatch = false, wonCurrentRound = false, reachedQF = false;

        const rounds = { 'Round of 32': 'r32', 'Round of 16': 'r16', 'Quarter Finals': 'qf', 'Semi Finals': 'sf', 'Finals': 'finals' };

        ['r32', 'r16', 'qf', 'sf', 'finals'].forEach(r => {
            const match = (bracket[r] || []).find(m => m.t1 === code || m.t2 === code);
            if (match) {
                if (r === 'qf' || r === 'sf' || r === 'finals') reachedQF = true;
                const res = dbMatches['knockouts']?.[match.id];

                if (res && res.played && !res.inProgress) {
                    const isT1 = match.t1 === code;
                    let won = false;

                    if (res.score1 > res.score2) won = isT1;
                    else if (res.score2 > res.score1) won = !isT1;
                    else if (res.pens && res.pen1 > res.pen2) won = isT1;
                    else if (res.pens && res.pen2 > res.pen1) won = !isT1;

                    if (match.id === 'FIN') { if (won) isGold = true; else isSilver = true; }
                    else if (match.id === '3RD') { if (won) isBronze = true; else lostAMatch = true; }
                    else {
                        if (!won) lostAMatch = true;
                        if (won && rounds[phase] === r) wonCurrentRound = true;
                    }
                }
            }
        });

        if (isGold) return 'gold';
        if (isSilver) return 'silver';
        if (isBronze) return 'bronze';

        const inUnplayed3rd = (bracket.finals || []).some(m => m.id === '3RD' && (m.t1 === code || m.t2 === code) && !(dbMatches['knockouts']?.['3RD']?.played && !dbMatches['knockouts']?.['3RD']?.inProgress));
        if (inUnplayed3rd) return 'blue';

        if (lostAMatch) {
            if (pot === 'B' && reachedQF) return 'purple';
            return 'red';
        }
        if (wonCurrentRound) return 'green';
        return 'blue';
    }

    const groupId = Object.keys(groupStages).find(g => groupStages[g].includes(code));
    const standings = calculateGroup(groupId, false);
    const tData = standings.find(t => t.code === code);

    const groupMatches = dbMatches[groupId] || {};
    const playedInGroup = Object.values(groupMatches).filter(m => m && m.played && !m.inProgress).length;

    if (playedInGroup === 6) {
        if (standings[0].code === code || standings[1].code === code) return 'green';
        if (standings[3].code === code) return 'red';
    } else {
        if (isGuaranteedTop2(groupId, code)) return 'green';

        const maxPts = tData.pts + (3 - tData.played) * 3;
        const thirdEntry = standings[2];
        if (maxPts < thirdEntry.pts) return 'red';

        const tieH2HTeam = (maxPts === thirdEntry.pts && tData.code !== thirdEntry.code)
            ? getGroupDirectMatchResult(groupId, code, thirdEntry.code)
            : null;
        if (tieH2HTeam === -1) return 'red';
    }

    return 'blue';
}

function resolvePrizeWinner(matchId, wantWinner) {
    const res = dbMatches['knockouts']?.[matchId];
    if (!res || !res.played || res.inProgress) return null;
    const bracket = getFullBracket(true);

    let roundKey = 'finals';
    if (matchId.startsWith('SF')) roundKey = 'sf';

    const matchObj = (bracket[roundKey] || []).find(m => m.id === matchId);
    if (!matchObj) return null;

    let t1Won = res.score1 > res.score2;
    if (res.score1 === res.score2 && res.pens) t1Won = res.pen1 > res.pen2;

    const winCode = t1Won ? matchObj.t1 : matchObj.t2;
    const loseCode = t1Won ? matchObj.t2 : matchObj.t1;
    const targetCode = wantWinner ? winCode : loseCode;

    if (!dbTeams[targetCode] || !dbTeams[targetCode].owner) return null;
    return { owner: dbTeams[targetCode].owner, country: teamsData[targetCode].name };
}

function getPotBBountyWinners() {
    const bracket = getFullBracket(true);
    const winners = [];
    const qfTeams = new Set();

    (bracket.qf || []).forEach(m => {
        if (m.t1 && !m.t1.startsWith("Winner") && !m.t1.startsWith("1st") && !m.t1.startsWith("2nd") && !m.t1.startsWith("3rd") && !m.t1.startsWith("Match")) qfTeams.add(m.t1);
        if (m.t2 && !m.t2.startsWith("Winner") && !m.t2.startsWith("1st") && !m.t2.startsWith("2nd") && !m.t2.startsWith("3rd") && !m.t2.startsWith("Match")) qfTeams.add(m.t2);
    });

    qfTeams.forEach(code => {
        if (teamsData[code] && teamsData[code].pot === 'B' && dbTeams[code]?.owner) {
            winners.push(`${dbTeams[code].owner} (${teamsData[code].name})`);
        }
    });

    const r16MatchesPlayed = (bracket.r16 || []).filter(m => dbMatches['knockouts']?.[m.id]?.played && !dbMatches['knockouts']?.[m.id]?.inProgress).length;
    return { list: winners, isRoundOver: r16MatchesPlayed >= 8 };
}

function renderCurrentView() {
    updateGlobalLiveBadge();
    if (activeMainTab === 'groups') {
        if (activeGroupTab === '3rd') renderThirdPlaceView(); else renderGroupView(activeGroupTab);
    } else if (activeMainTab === 'status') {
        renderStatusView();
    } else if (activeMainTab === 'fixtures') {
        renderFixturesView();
    } else {
        renderKnockoutsView(activeKoTab);
    }
}

function renderStatusView() {
    const target = document.getElementById('status-target');
    const header = document.getElementById('status-header');
    const phase = getCurrentPhase();

    header.innerHTML = `
        <h2 class="text-3xl font-extrabold text-white tracking-widest uppercase mb-2">Tournament Status</h2>
        <div class="inline-block bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            Current Phase: ${phase}
        </div>
    `;

    const allTeams = Object.keys(teamsData).map(code => {
        return { code, name: teamsData[code].name, pot: teamsData[code].pot, owner: dbTeams[code]?.owner || null, status: getTeamStatusData(code) };
    }).sort((a, b) => a.name.localeCompare(b.name));

    const buildGrid = (teamsArr) => {
        let gridHtml = `<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">`;
        teamsArr.forEach(t => {
            const borderClass = t.pot === 'A' ? 'border-[#D4AF37]' : 'border-gray-400';
            let bgClass = '';
            if (t.status === 'gold') bgClass = 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.6)]';
            else if (t.status === 'silver') bgClass = 'bg-gray-300 text-black shadow-[0_0_15px_rgba(209,213,219,0.6)]';
            else if (t.status === 'bronze') bgClass = 'bg-amber-700 text-white shadow-[0_0_15px_rgba(180,83,9,0.6)]';
            else if (t.status === 'purple') bgClass = 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.6)]';
            else if (t.status === 'red') bgClass = 'bg-red-900/80 text-gray-400 opacity-70';
            else if (t.status === 'green') bgClass = 'bg-green-700 text-white shadow-[0_0_10px_rgba(0,255,0,0.3)]';
            else bgClass = 'bg-blue-900 text-white';

            gridHtml += `
                <div class="border-2 rounded p-3 flex flex-col justify-center items-center text-center transition-all ${borderClass} ${bgClass}">
                    <span class="font-bold text-sm tracking-wider uppercase">${t.name}</span>
                    ${t.owner ? `<span class="text-xs mt-1 font-semibold tracking-wide">(${t.owner})</span>` : ''}
                </div>
            `;
        });
        return gridHtml + `</div>`;
    };

    const assigned = allTeams.filter(t => t.owner);
    const unassigned = allTeams.filter(t => !t.owner);

    const unassignedBlock = unassigned.length > 0
        ? `<div class="mb-8 opacity-80"><h3 class="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Unassigned Teams</h3>${buildGrid(unassigned)}</div>`
        : '';

    target.innerHTML = `
        <div class="mb-8"><h3 class="text-xl font-bold text-[#D4AF37] uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Assigned Teams</h3>${buildGrid(assigned)}</div>
        ${unassignedBlock}
        
        <div class="bg-black border border-gray-700 rounded p-4 flex flex-col items-center space-y-4 text-sm mt-4">
            <div class="flex flex-wrap justify-center items-center gap-4 md:gap-6">
                <div class="flex items-center space-x-2"><div class="w-4 h-4 bg-green-700 border border-green-500 rounded"></div><span class="text-gray-300">Qualified/Won Round</span></div>
                <div class="flex items-center space-x-2"><div class="w-4 h-4 bg-blue-900 border border-blue-500 rounded"></div><span class="text-gray-300">Active</span></div>
                <div class="flex items-center space-x-2"><div class="w-4 h-4 bg-red-900/80 border border-red-500 rounded"></div><span class="text-gray-300">Eliminated</span></div>
                <div class="h-6 border-l border-gray-600 hidden md:block"></div>
                <div class="flex items-center space-x-2"><div class="w-4 h-4 border-2 border-[#D4AF37] bg-black rounded"></div><span class="text-gray-300">Pot A</span></div>
                <div class="flex items-center space-x-2"><div class="w-4 h-4 border-2 border-gray-400 bg-black rounded"></div><span class="text-gray-300">Pot B</span></div>
            </div>
            <div class="flex flex-wrap justify-center items-center gap-4 md:gap-6 border-t border-gray-800 pt-4 w-full">
                <div class="flex items-center space-x-2"><div class="w-4 h-4 bg-yellow-500 rounded shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div><span class="text-gray-300">1st Place</span></div>
                <div class="flex items-center space-x-2"><div class="w-4 h-4 bg-gray-300 rounded shadow-[0_0_8px_rgba(209,213,219,0.6)]"></div><span class="text-gray-300">2nd Place</span></div>
                <div class="flex items-center space-x-2"><div class="w-4 h-4 bg-amber-700 rounded shadow-[0_0_8px_rgba(180,83,9,0.6)]"></div><span class="text-gray-300">3rd Place</span></div>
                <div class="flex items-center space-x-2"><div class="w-4 h-4 bg-purple-500 rounded shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div><span class="text-gray-300">Pot B QF+ Bounty</span></div>
            </div>
        </div>
    `;

    const formatPrizeDisplay = (winnerObj, defaultAmt) => {
        if (!winnerObj) return `<div class="text-[#D4AF37] font-extrabold text-2xl">${defaultAmt}</div>`;
        return `
            <div class="text-[#D4AF37] font-black text-xl tracking-wide uppercase">${winnerObj.owner}</div>
            <div class="text-gray-400 text-xs font-bold italic mb-2">(${winnerObj.country})</div>
            <div class="text-white text-xs font-semibold tracking-widest bg-gray-900 px-3 py-1 rounded inline-block border border-gray-800">${defaultAmt}</div>
        `;
    };

    const prizeTarget = Array.from(document.querySelectorAll('#view-status .grid')).find(el => el.classList.contains('md:grid-cols-3'));
    if (prizeTarget) {
        prizeTarget.innerHTML = `
            <div class="bg-black border border-gray-700 rounded-lg p-4 text-center shadow-lg flex flex-col justify-center min-h-[140px]">
                <div class="text-2xl mb-1">🏆</div><div class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Winner</div>
                ${formatPrizeDisplay(resolvePrizeWinner('FIN', true), "£65 Cash")}
            </div>
            <div class="bg-black border border-gray-700 rounded-lg p-4 text-center shadow-lg flex flex-col justify-center min-h-[140px]">
                <div class="text-2xl mb-1">🥈</div><div class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Runner Up</div>
                ${formatPrizeDisplay(resolvePrizeWinner('FIN', false), "£40 Amazon Voucher")}
            </div>
            <div class="bg-black border border-gray-700 rounded-lg p-4 text-center shadow-lg flex flex-col justify-center min-h-[140px]">
                <div class="text-2xl mb-1">🥉</div><div class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Third Place</div>
                ${formatPrizeDisplay(resolvePrizeWinner('3RD', true), "£20 Amazon Voucher")}
            </div>
        `;
    }

    const bountyBox = prizeTarget ? prizeTarget.nextElementSibling : null;
    const bounty = getPotBBountyWinners();
    if (bountyBox) {
        if (bounty.list.length > 0) {
            bountyBox.innerHTML = `
                <span class="text-lg mb-1 block">🎯 <span class="font-bold text-[#D4AF37] uppercase tracking-wider">Pot B Bounty Winners!</span></span>
                <p class="text-white font-extrabold text-base tracking-wide">${bounty.list.join(' • ')}</p>
                <p class="text-xs text-gray-400 mt-2">Each team member receives a <strong>£10 Amazon Voucher</strong>.</p>
            `;
            bountyBox.className = "mt-4 bg-purple-950/30 border border-purple-800 rounded-lg p-4 text-center shadow-[0_0_15px_rgba(168,85,247,0.15)]";
        } else if (bounty.isRoundOver) {
            bountyBox.innerHTML = `
                <span class="text-lg mb-1 block">🎯 <span class="font-bold text-gray-400 uppercase tracking-wider">Pot B Bounty</span></span>
                <p class="text-red-400 font-bold text-sm tracking-widest uppercase">No Winners</p>
                <p class="text-xs text-gray-500 mt-1">No Pot B teams qualified for the Quarter Finals this tournament.</p>
            `;
            bountyBox.className = "mt-4 bg-gray-800 border border-gray-600 rounded-lg p-4 text-center";
        } else {
            bountyBox.innerHTML = `
                <span class="text-lg mb-1 block">🎯 <span class="font-bold text-white uppercase tracking-wider">Pot B Bounty</span></span>
                <p class="text-gray-300 text-sm">Any team member with a Pot B team that reaches the Quarter Finals or better wins a <strong class="text-[#D4AF37]">£10 Amazon Voucher</strong>.</p>
            `;
            bountyBox.className = "mt-4 bg-gray-800 border border-gray-600 rounded-lg p-4 text-center";
        }
    }
}

function renderGroupView(groupId) {
    const target = document.getElementById('group-table-target');
    const groupMatches = dbMatches[groupId] || {};

    let groupHasLiveMatch = false;
    const liveTeams = new Set();
    Object.values(groupMatches).forEach(m => {
        if (m && m.played && m.inProgress) {
            groupHasLiveMatch = true;
            liveTeams.add(m.team1); liveTeams.add(m.team2);
        }
    });

    const titleEl = document.getElementById('current-group-title');
    if (titleEl) titleEl.innerText = groupHasLiveMatch ? `Group ${groupId} (As it stands)` : `Group ${groupId}`;

    const standingsLive = calculateGroup(groupId, true);
    const standingsSettled = calculateGroup(groupId, false);

    const settledPosMap = {};
    standingsSettled.forEach((t, i) => { settledPosMap[t.code] = i; });

    let groupHasQualified = false;

    let html = `<div class="overflow-x-auto"><table class="w-full text-left border-collapse">
        <thead><tr class="bg-black border-b border-[#D4AF37] text-[#D4AF37] text-xs uppercase tracking-wider">
            <th class="p-3">Pos</th><th class="p-3">Team</th><th class="p-3 text-center">P</th><th class="p-3 text-center">W</th>
            <th class="p-3 text-center">D</th><th class="p-3 text-center">L</th><th class="p-3 text-center hidden sm:table-cell">GF</th>
            <th class="p-3 text-center hidden sm:table-cell">GA</th><th class="p-3 text-center">GD</th><th class="p-3 text-center font-bold">Pts</th>
        </tr></thead><tbody class="text-sm">`;

    standingsLive.forEach((team, index) => {
        const teamStatus = getTeamStatusData(team.code);
        const isQual = (teamStatus === 'green' || teamStatus === 'gold' || teamStatus === 'silver' || teamStatus === 'bronze' || teamStatus === 'purple');
        if (isQual) groupHasQualified = true;

        let borderClass = index < 2 ? 'border-l-4 border-green-500' : (index === 2 ? 'border-l-4 border-yellow-500' : 'border-l-4 border-transparent');
        const bgClass = isQual ? 'bg-green-900/30 hover:bg-green-900/50' : 'hover:bg-gray-800';
        const assigned = isAssigned(team.code);
        const textClass = assigned ? 'text-[#D4AF37] font-extrabold' : 'text-white font-bold';
        const liveAsterisk = liveTeams.has(team.code) ? `<span class="text-red-500 ml-1 text-lg leading-none">*</span>` : '';

        let arrowHtml = `<span class="w-3 inline-block"></span>`;
        if (groupHasLiveMatch) {
            const sPos = settledPosMap[team.code];
            if (index < sPos) arrowHtml = `<span class="w-3 inline-block text-center text-green-500 font-bold text-[10px] md:text-xs">▲</span>`;
            else if (index > sPos) arrowHtml = `<span class="w-3 inline-block text-center text-red-500 font-bold text-[10px] md:text-xs">▼</span>`;
            else arrowHtml = `<span class="w-3 inline-block text-center text-gray-600 font-bold text-xs">-</span>`;
        }

        html += `<tr class="border-b border-gray-800 ${bgClass} ${borderClass}">
            <td class="p-3 font-bold text-gray-400 whitespace-nowrap"><div class="flex items-center space-x-1 md:space-x-2"><span>${index + 1}</span>${arrowHtml}</div></td>
            <td class="p-3 ${textClass}">${team.name}${liveAsterisk}</td>
            <td class="p-3 text-center text-gray-300">${team.played}</td><td class="p-3 text-center text-gray-300">${team.won}</td>
            <td class="p-3 text-center text-gray-300">${team.drawn}</td><td class="p-3 text-center text-gray-300">${team.lost}</td>
            <td class="p-3 text-center text-gray-400 hidden sm:table-cell">${team.gf}</td><td class="p-3 text-center text-gray-400 hidden sm:table-cell">${team.ga}</td>
            <td class="p-3 text-center ${team.gd > 0 ? 'text-green-400' : team.gd < 0 ? 'text-red-400' : 'text-gray-400'}">${team.gd > 0 ? '+' + team.gd : team.gd}</td>
            <td class="p-3 text-center font-bold text-[#D4AF37]">${team.pts}</td></tr>`;
    });
    html += `</tbody></table></div>`;

    if (groupHasLiveMatch) html += `<div class="mt-2 text-xs text-gray-400 font-bold"><span class="text-red-500 text-sm">*</span> Match in progress</div>`;
    if (groupHasQualified) html += `<div class="mt-2 text-xs text-gray-400 font-bold"><div class="w-3 h-3 bg-green-900/30 border border-green-500 inline-block align-middle mr-1"></div> Qualified for R32</div>`;

    html += `<div class="mt-8 border-t border-gray-800 pt-6"><h3 class="text-[#D4AF37] font-bold uppercase tracking-widest text-sm mb-4">Group Fixtures</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4">`;
    const teams = groupStages[groupId];
    const rawFixtures = [[teams[0], teams[1]], [teams[2], teams[3]], [teams[0], teams[2]], [teams[1], teams[3]], [teams[0], teams[3]], [teams[1], teams[2]]];

    rawFixtures.forEach((fixture, index) => {
        const matchId = `G${groupId}-M${index + 1}`; const matchData = groupMatches[matchId];
        const fixObj = getFixtureDetails(groupId, index);
        const t1Name = getDisplayName(fixture[0]); const t2Name = getDisplayName(fixture[1]);

        const channelLogo = fixObj.c === 'BBC'
            ? `<img src="BBC.png" class="h-4 ml-2 inline-block rounded-sm opacity-90" alt="BBC">`
            : (fixObj.c === 'ITV' ? `<img src="ITV.png" class="h-4 ml-2 inline-block rounded-sm opacity-90" alt="ITV">` : '');

        if (matchData && matchData.played) {
            if (matchData.inProgress) {
                html += `<div class="bg-black border border-red-900 rounded p-3 flex justify-between items-center shadow-inner">
                    <div class="text-right w-2/5 font-bold ${isAssigned(fixture[0]) ? 'text-[#D4AF37]' : 'text-white'}">${t1Name}</div>
                    <div class="w-1/5 text-center font-bold text-red-500 bg-gray-900 border border-red-800/50 rounded py-1 px-1 mx-2 flex flex-col justify-center">
                        <span class="text-[9px] uppercase tracking-widest leading-none mb-0.5 animate-pulse">${matchData.time || 'Live'}</span>
                        <span class="text-lg leading-none">${matchData.score1} - ${matchData.score2}</span>
                    </div>
                    <div class="text-left w-2/5 font-bold ${isAssigned(fixture[1]) ? 'text-[#D4AF37]' : 'text-white'}">${t2Name}</div></div>`;
            } else {
                html += `<div class="bg-black border border-gray-700 rounded p-3 flex justify-between items-center shadow-inner">
                    <div class="text-right w-2/5 font-bold ${isAssigned(fixture[0]) ? 'text-[#D4AF37]' : 'text-white'}">${t1Name}</div>
                    <div class="w-1/5 text-center font-bold text-lg text-[#D4AF37] bg-gray-900 rounded py-1 px-2 mx-2 flex flex-col justify-center leading-none">
                        ${matchData.played ? '<span class="text-[8px] text-gray-500 uppercase tracking-widest leading-none mb-0.5">FT</span>' : ''}
                        <span>${matchData.score1} - ${matchData.score2}</span>
                    </div>
                    <div class="text-left w-2/5 font-bold ${isAssigned(fixture[1]) ? 'text-[#D4AF37]' : 'text-white'}">${t2Name}</div></div>`;
            }
        } else {
            html += `<div class="bg-gray-900 border border-gray-800 rounded p-3 flex flex-col justify-center items-center">
                <div class="flex justify-between w-full mb-2"><div class="text-right w-2/5 text-sm ${isAssigned(fixture[0]) ? 'text-[#D4AF37] font-bold' : 'text-gray-300'}">${t1Name}</div>
                <div class="w-1/5 text-center text-xs text-gray-500 font-bold">VS</div><div class="text-left w-2/5 text-sm ${isAssigned(fixture[1]) ? 'text-[#D4AF37] font-bold' : 'text-gray-300'}">${t2Name}</div></div>
                <div class="text-xs text-gray-500 tracking-wider flex items-center justify-center">${fixObj.d} ${channelLogo}</div></div>`;
        }
    });
    html += `</div></div>`; target.innerHTML = html;
}

function renderThirdPlaceView() {
    const target = document.getElementById('group-table-target');

    let globalGroupLiveMatch = false;
    const activeLiveTeams = new Set();
    Object.keys(groupStages).forEach(g => {
        Object.values(dbMatches[g] || {}).forEach(m => {
            if (m && m.played && m.inProgress) {
                globalGroupLiveMatch = true;
                activeLiveTeams.add(m.team1); activeLiveTeams.add(m.team2);
            }
        });
    });

    const titleEl = document.getElementById('current-group-title');
    if (titleEl) {
        titleEl.innerHTML = globalGroupLiveMatch
            ? `<div class="flex flex-col items-center"><span>Best 3rd-Placed Teams</span><span class="text-xs text-red-500 font-bold uppercase tracking-widest mt-1 animate-pulse">(As it stands)</span></div>`
            : `Best 3rd-Placed Teams`;
    }

    const standingsLive = calculateThirdPlaceStandings(true);
    const standingsSettled = calculateThirdPlaceStandings(false);

    const settledPosMap = {};
    standingsSettled.forEach((t, i) => { settledPosMap[t.code] = i; });

    const bracket = getFullBracket(true);
    const headerText = isGroupStageComplete() ? 'R32 Opponent' : 'Potential R32 Opponent';

    let groupHasQualified = false;

    let html = `<div class="overflow-x-auto"><table class="w-full text-left border-collapse">
        <thead><tr class="bg-black border-b border-[#D4AF37] text-[#D4AF37] text-xs uppercase tracking-wider">
            <th class="p-3">Pos</th><th class="p-3 text-[#D4AF37]">Grp</th><th class="p-3">Team</th>
            <th class="p-3 text-center">P</th><th class="p-3 text-center">W</th><th class="p-3 text-center">D</th><th class="p-3 text-center">L</th>
            <th class="p-3 text-center">GD</th><th class="p-3 text-center font-bold">Pts</th><th class="p-3 whitespace-nowrap">${headerText}</th>
        </tr></thead><tbody class="text-sm">`;

    standingsLive.forEach((team, index) => {
        const teamStatus = getTeamStatusData(team.code);
        const isQual = (teamStatus === 'green' || teamStatus === 'gold' || teamStatus === 'silver' || teamStatus === 'bronze' || teamStatus === 'purple');
        if (isQual) groupHasQualified = true;

        const borderClass = index < 8 ? 'border-l-4 border-green-500' : 'border-l-4 border-red-900 opacity-50';
        const bgClass = isQual ? 'bg-green-900/30 hover:bg-green-900/50' : 'hover:bg-gray-800';
        const assigned = isAssigned(team.code);
        const textClass = assigned ? 'text-[#D4AF37] font-extrabold' : 'text-white font-bold';
        const liveAsterisk = activeLiveTeams.has(team.code) ? `<span class="text-red-500 ml-1 text-lg leading-none">*</span>` : '';

        let arrowHtml = `<span class="w-3 inline-block"></span>`;
        if (globalGroupLiveMatch) {
            const sPos = settledPosMap[team.code];
            if (sPos !== undefined) {
                if (index < sPos) arrowHtml = `<span class="w-3 inline-block text-center text-green-500 font-bold text-[10px] md:text-xs">▲</span>`;
                else if (index > sPos) arrowHtml = `<span class="w-3 inline-block text-center text-red-500 font-bold text-[10px] md:text-xs">▼</span>`;
                else arrowHtml = `<span class="w-3 inline-block text-center text-gray-600 font-bold text-xs">-</span>`;
            } else {
                const settledGroup = calculateGroup(team.originGroup, false);
                const pastGroupPos = settledGroup.findIndex(t => t.code === team.code);
                if (pastGroupPos > 2) arrowHtml = `<span class="w-3 inline-block text-center text-green-500 font-bold text-[10px] md:text-xs">▲</span>`;
                else if (pastGroupPos < 2) arrowHtml = `<span class="w-3 inline-block text-center text-red-500 font-bold text-[10px] md:text-xs">▼</span>`;
                else arrowHtml = `<span class="w-3 inline-block text-center text-gray-600 font-bold text-xs">-</span>`;
            }
        }

        let oppHtml = `<td class="p-3 text-gray-600 font-bold">-</td>`;
        if (index < 8) {
            const r32Match = (bracket.r32 || []).find(m => m.t2 === team.code);
            if (r32Match && r32Match.t1) {
                oppHtml = `<td class="p-3 text-xs font-bold text-[#D4AF37] whitespace-nowrap">vs ${getDisplayName(r32Match.t1)}</td>`;
            }
        }

        html += `<tr class="border-b border-gray-800 ${bgClass} ${borderClass}">
            <td class="p-3 font-bold text-gray-400 whitespace-nowrap"><div class="flex items-center space-x-1 md:space-x-2"><span>${index + 1}</span>${arrowHtml}</div></td>
            <td class="p-3 font-bold text-[#D4AF37]">${team.originGroup}</td>
            <td class="p-3 ${textClass}">${team.name}${liveAsterisk}</td><td class="p-3 text-center text-gray-300">${team.played}</td>
            <td class="p-3 text-center text-gray-300">${team.won}</td><td class="p-3 text-center text-gray-300">${team.drawn}</td>
            <td class="p-3 text-center text-gray-300">${team.lost}</td>
            <td class="p-3 text-center ${team.gd > 0 ? 'text-green-400' : team.gd < 0 ? 'text-red-400' : 'text-gray-400'}">${team.gd > 0 ? '+' + team.gd : team.gd}</td>
            <td class="p-3 text-center font-bold text-[#D4AF37]">${team.pts}</td>${oppHtml}</tr>`;
    });
    html += `</tbody></table></div>`;

    if (globalGroupLiveMatch) html += `<div class="mt-2 text-xs text-gray-400 font-bold"><span class="text-red-500 text-sm">*</span> Match in progress</div>`;
    if (groupHasQualified) html += `<div class="mt-2 text-xs text-gray-400 font-bold"><div class="w-3 h-3 bg-green-900/30 border border-green-500 inline-block align-middle mr-1"></div> Qualified for R32</div>`;

    target.innerHTML = html;
}

function renderKnockoutsView(round) {
    const target = document.getElementById('knockout-target');
    const titleEl = document.getElementById('current-ko-title');
    const subtabs = document.getElementById('ko-subtabs-container');
    const toggleBtn1 = document.getElementById('ko-view-toggle');
    const toggleBtn2 = document.getElementById('ko-view-toggle-mobile');

    if (knockoutViewMode === 'bracket') {
        if (subtabs) subtabs.classList.add('hidden');
        if (toggleBtn1) toggleBtn1.innerText = 'Show Rounds View';
        if (toggleBtn2) toggleBtn2.innerText = 'Show Rounds View';
        if (titleEl) titleEl.innerText = 'Full Tournament Bracket';
        renderFullBracketView(target);
        return;
    } else {
        if (subtabs) subtabs.classList.remove('hidden');
        if (toggleBtn1) toggleBtn1.innerText = 'Bracket View';
        if (toggleBtn2) toggleBtn2.innerText = 'Bracket View';
        const titles = { 'r32': 'Round of 32', 'r16': 'Round of 16', 'qf': 'Quarter Finals', 'sf': 'Semi Finals', 'finals': 'Finals & 3rd Place' };
        if (titleEl) titleEl.innerText = titles[round];
    }

    const bracket = getFullBracket(true);
    const matches = bracket[round] || [];

    let html = ``;
    if (!isGroupStageComplete()) {
        const pCount = getPlayedGroupMatchCount();
        html += `<div class="bg-yellow-900 border border-yellow-600 text-yellow-400 p-3 rounded mb-6 text-center text-sm font-bold uppercase tracking-widest shadow-inner">As It Stands (${pCount}/72 Group Games Played)</div>`;
    } else {
        html += `<div class="bg-blue-900/30 border border-blue-600 text-blue-400 p-3 rounded mb-6 text-center text-sm font-bold uppercase tracking-widest shadow-inner">Current Phase: ${getCurrentPhase()}</div>`;
    }

    html += `<div class="grid grid-cols-1 ${round === 'finals' ? '' : 'md:grid-cols-2'} gap-6">`;

    matches.forEach(match => {
        const isFinal = match.id === 'FIN';
        const isPlaceHolderT1 = match.t1.startsWith("Winner") || match.t1.startsWith("Loser") || match.t1.startsWith("1st") || match.t1.startsWith("2nd") || match.t1.startsWith("3rd") || match.t1.startsWith("Match");
        const isPlaceHolderT2 = match.t2.startsWith("Winner") || match.t2.startsWith("Loser") || match.t2.startsWith("1st") || match.t2.startsWith("2nd") || match.t2.startsWith("3rd") || match.t2.startsWith("Match");

        let t1Str = isPlaceHolderT1 ? match.t1 : getDisplayName(match.t1);
        let t2Str = isPlaceHolderT2 ? match.t2 : getDisplayName(match.t2);
        const t1Assigned = isAssigned(match.t1);
        const t2Assigned = isAssigned(match.t2);

        const res = dbMatches['knockouts']?.[match.id];
        let scoreUI = ``;

        if (res && res.played) {
            let s1 = res.score1; let s2 = res.score2;
            let t1Won = false; let t2Won = false;

            if (!res.inProgress) {
                if (s1 > s2) t1Won = true;
                else if (s2 > s1) t2Won = true;
                else if (res.pens && res.pen1 > res.pen2) t1Won = true;
                else if (res.pens && res.pen2 > res.pen1) t2Won = true;
            }

            if (res.aet) {
                if (!res.inProgress && t1Won) s1 = `${s1}<sup class="text-xs text-[#D4AF37] ml-1 font-bold">AET</sup>`;
                else if (!res.inProgress && t2Won) s2 = `${s2}<sup class="text-xs text-[#D4AF37] ml-1 font-bold">AET</sup>`;
                else {
                    s1 = `${s1}<sup class="text-[10px] text-gray-400 ml-1 font-bold">AET</sup>`;
                    s2 = `${s2}<sup class="text-[10px] text-gray-400 ml-1 font-bold">AET</sup>`;
                }
            }
            if (res.pens) {
                s1 = `${s1} <span class="text-xs text-gray-400 font-normal ml-1">(${res.pen1})</span>`;
                s2 = `${s2} <span class="text-xs text-gray-400 font-normal ml-1">(${res.pen2})</span>`;
            }

            const t1Bg = t1Won ? 'bg-green-900/50' : 'bg-black';
            const t2Bg = t2Won ? 'bg-green-900/50' : 'bg-black';
            const borderGlow = res.inProgress ? 'border-red-900/50' : 'border-gray-800';

            scoreUI = `
                <div class="flex justify-between items-center ${t1Bg} p-3 rounded border ${borderGlow}">
                    <span class="font-bold truncate mr-2 ${t1Assigned ? 'text-[#D4AF37]' : 'text-white'}">${t1Str}</span>
                    <span class="shrink-0 ${res.inProgress ? 'text-red-500' : 'text-[#D4AF37]'} font-bold text-lg">${s1}</span>
                </div>
                <div class="flex justify-between items-center ${t2Bg} p-3 rounded border ${borderGlow}">
                    <span class="font-bold truncate mr-2 ${t2Assigned ? 'text-[#D4AF37]' : 'text-white'}">${t2Str}</span>
                    <span class="shrink-0 ${res.inProgress ? 'text-red-500' : 'text-[#D4AF37]'} font-bold text-lg">${s2}</span>
                </div>
            `;
        } else {
            scoreUI = `
                <div class="flex justify-between items-center bg-black p-3 rounded border border-gray-800">
                    <span class="font-bold truncate mr-2 ${t1Assigned ? 'text-[#D4AF37]' : 'text-gray-400'}">${t1Str}</span>
                    <span class="text-gray-600 font-bold text-sm shrink-0">-</span>
                </div>
                <div class="flex justify-between items-center bg-black p-3 rounded border border-gray-800">
                    <span class="font-bold truncate mr-2 ${t2Assigned ? 'text-[#D4AF37]' : 'text-gray-400'}">${t2Str}</span>
                    <span class="text-gray-600 font-bold text-sm shrink-0">-</span>
                </div>
            `;
        }

        const containerClass = isFinal
            ? "md:col-span-2 bg-gray-900 border-2 border-[#D4AF37] rounded-lg p-6 shadow-[0_0_20px_rgba(212,175,55,0.3)] flex flex-col"
            : `bg-gray-900 border ${res && res.inProgress ? 'border-red-900/50' : 'border-gray-700'} rounded-lg p-4 shadow-lg flex flex-col justify-between`;

        const headerClass = isFinal ? "text-lg font-black text-[#D4AF37]" : "text-xs font-bold text-gray-500";
        let liveIndicator = (res && res.inProgress) ? `<div class="text-center w-full text-[10px] text-red-500 uppercase tracking-widest font-bold animate-pulse mt-3">${res.time || 'Live Score'}</div>` : ``;
        if (res && res.played && !res.inProgress) liveIndicator = `<div class="text-center w-full text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-3">FT</div>`;

        html += `
            <div class="${containerClass}">
                <div class="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                    <span class="${headerClass} tracking-wider uppercase">${match.title || match.id}</span>
                    <span class="${isFinal ? 'text-sm' : 'text-xs'} text-gray-400">${match.date}</span>
                </div>
                <div class="space-y-4">${scoreUI}</div>
                ${liveIndicator}
            </div>
        `;
    });

    html += `</div>`; target.innerHTML = html;
}

function renderFullBracketView(target) {
    const bracket = getFullBracket(true);

    let html = `
        <div id="bracket-scroll-container" class="overflow-x-auto pb-4 premium-scroll cursor-grab active:cursor-grabbing select-none" style="scroll-behavior: auto;">
            <div class="flex min-w-max px-2 h-[800px] md:h-[900px] gap-4 md:gap-8 mx-auto" style="width: fit-content;">
    `;

    const getMatchById = (roundArr, id) => roundArr.find(m => m.id === id);

    const renderMatchBox = (match) => {
        if (!match) return `<div class="h-[72px] w-48 md:w-56 opacity-0 my-2"></div>`;
        const res = dbMatches['knockouts']?.[match.id];

        const isPlaceHolderT1 = match.t1 && (match.t1.startsWith("Winner") || match.t1.startsWith("Loser") || match.t1.startsWith("1st") || match.t1.startsWith("2nd") || match.t1.startsWith("3rd") || match.t1.startsWith("Match"));
        const isPlaceHolderT2 = match.t2 && (match.t2.startsWith("Winner") || match.t2.startsWith("Loser") || match.t2.startsWith("1st") || match.t2.startsWith("2nd") || match.t2.startsWith("3rd") || match.t2.startsWith("Match"));

        let t1Str = !isPlaceHolderT1 ? getDisplayName(match.t1) : `<span class="text-gray-500 font-normal italic text-[10px] md:text-xs">${match.t1}</span>`;
        let t2Str = !isPlaceHolderT2 ? getDisplayName(match.t2) : `<span class="text-gray-500 font-normal italic text-[10px] md:text-xs">${match.t2}</span>`;

        const t1Col = !isPlaceHolderT1 && isAssigned(match.t1) ? 'text-[#D4AF37]' : 'text-white';
        const t2Col = !isPlaceHolderT2 && isAssigned(match.t2) ? 'text-[#D4AF37]' : 'text-white';

        let s1 = '', s2 = '';
        if (res && res.played) {
            s1 = res.score1; s2 = res.score2;
            if (res.pens) {
                s1 += ` <span class="text-[9px] text-gray-400">(${res.pen1})</span>`;
                s2 += ` <span class="text-[9px] text-gray-400">(${res.pen2})</span>`;
            }
        }

        return `<div class="w-48 md:w-56 bg-black border ${res?.inProgress ? 'border-red-900/80 shadow-[0_0_10px_rgba(220,38,38,0.3)]' : 'border-gray-700'} rounded-lg p-2 text-xs shadow-lg flex flex-col justify-center h-[64px] md:h-[72px] relative z-10 transition-transform hover:scale-[1.02]">
            <div class="text-gray-500 mb-1 flex justify-between items-center"><span class="text-[9px] md:text-[10px] uppercase tracking-wider font-bold">${match.title || match.id}</span><span class="text-gray-600 font-normal text-[9px] md:text-[10px] whitespace-nowrap">${res?.inProgress ? `<span class="text-red-500 animate-pulse font-bold">${res.time || 'LIVE'}</span>` : (res?.played ? 'FT' : (match.date ? match.date.split(',')[0] : ''))}</span></div>
            <div class="flex justify-between items-center mb-0.5"><span class="truncate ${t1Col} font-bold mr-2 text-[11px] md:text-xs">${t1Str}</span><span class="font-bold ${res?.inProgress ? 'text-red-500' : 'text-[#D4AF37]'} shrink-0 text-xs">${s1}</span></div>
            <div class="flex justify-between items-center"><span class="truncate ${t2Col} font-bold mr-2 text-[11px] md:text-xs">${t2Str}</span><span class="font-bold ${res?.inProgress ? 'text-red-500' : 'text-[#D4AF37]'} shrink-0 text-xs">${s2}</span></div>
        </div>`;
    };

    const renderColumn = (title, matchIds, roundArr) => {
        let colHtml = `<div class="flex flex-col h-full relative group">
            <div class="text-[#D4AF37] font-bold text-center uppercase tracking-wider text-[10px] md:text-xs absolute -top-8 w-full">${title}</div>
            <div class="flex flex-col justify-around h-full w-48 md:w-56 relative">`;
        matchIds.forEach(id => {
            const m = id ? getMatchById(roundArr, id) : null;
            colHtml += renderMatchBox(m);
        });
        colHtml += `</div></div>`;
        return colHtml;
    };

    // Left side: R32 -> R16 -> QF -> SF
    html += renderColumn('Round of 32', ['R32-3', 'R32-6', 'R32-1', 'R32-4', 'R32-12', 'R32-11', 'R32-10', 'R32-9'], bracket.r32);
    html += renderColumn('Round of 16', ['R16-2', 'R16-1', 'R16-5', 'R16-6'], bracket.r16);
    html += renderColumn('Quarter Finals', ['QF-1', 'QF-2'], bracket.qf);
    html += renderColumn('Semi Finals', ['SF-1'], bracket.sf);

    // Center: Final & 3rd Place
    html += `<div class="flex flex-col h-full relative mx-4 md:mx-8">
        <div class="text-yellow-500 font-extrabold text-center uppercase tracking-widest text-xs md:text-sm absolute -top-10 w-full shadow-[0_0_10px_rgba(234,179,8,0.3)]">Finals</div>
        <div class="flex flex-col justify-center items-center h-full space-y-16">
            <div class="relative">
                <div class="absolute -top-6 text-center w-full text-[#D4AF37] font-bold text-[10px] uppercase tracking-widest">World Cup Final</div>
                <div class="transform scale-110 shadow-[0_0_20px_rgba(212,175,55,0.2)] rounded-lg">
                    ${renderMatchBox(getMatchById(bracket.finals, 'FIN'))}
                </div>
            </div>
            <div class="relative opacity-90">
                <div class="absolute -top-6 text-center w-full text-gray-400 font-bold text-[10px] uppercase tracking-widest">3rd Place Playoff</div>
                ${renderMatchBox(getMatchById(bracket.finals, '3RD'))}
            </div>
        </div>
    </div>`;

    // Right side: SF -> QF -> R16 -> R32
    html += renderColumn('Semi Finals', ['SF-2'], bracket.sf);
    html += renderColumn('Quarter Finals', ['QF-3', 'QF-4'], bracket.qf);
    html += renderColumn('Round of 16', ['R16-3', 'R16-4', 'R16-7', 'R16-8'], bracket.r16);
    html += renderColumn('Round of 32', ['R32-2', 'R32-5', 'R32-7', 'R32-8', 'R32-15', 'R32-14', 'R32-13', 'R32-16'], bracket.r32);

    html += `</div></div>`;
    target.innerHTML = html;

    // Attach drag-to-scroll logic
    const slider = document.getElementById('bracket-scroll-container');
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active');
    });
    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
    });
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
        slider.scrollLeft = scrollLeft - walk;
    });

    // Center the bracket on load
    setTimeout(() => {
        const centerOffset = (slider.scrollWidth - slider.clientWidth) / 2;
        slider.scrollLeft = centerOffset;
    }, 50);
}

function renderFixturesView() {
    const target = document.getElementById('fixtures-target');
    const allMatches = [];

    Object.keys(groupStages).forEach(groupId => {
        const teams = groupStages[groupId];
        const rawFixtures = [[teams[0], teams[1]], [teams[2], teams[3]], [teams[0], teams[2]], [teams[1], teams[3]], [teams[0], teams[3]], [teams[1], teams[2]]];
        rawFixtures.forEach((fixture, index) => {
            const mId = `G${groupId}-M${index + 1}`;
            const fixDetails = getFixtureDetails(groupId, index);
            allMatches.push({ id: mId, t1: fixture[0], t2: fixture[1], dateStr: fixDetails.d, channel: fixDetails.c, round: `Grp ${groupId}`, isGroup: true, originGroup: groupId });
        });
    });

    const bracket = getFullBracket(false);
    const roundNames = { 'r32': 'R32', 'r16': 'R16', 'qf': 'QF', 'sf': 'SF', 'finals': 'Final' };

    ['r32', 'r16', 'qf', 'sf', 'finals'].forEach(roundKey => {
        (bracket[roundKey] || []).forEach(m => {
            let rName = roundNames[roundKey];
            if (m.id === '3RD') rName = '3rd Pl';

            let channelStr = "";
            if (m.id === 'FIN') channelStr = "BOTH";
            else channelStr = dbMatches['knockouts']?.[m.id]?.channel || "";

            allMatches.push({ id: m.id, t1: m.t1, t2: m.t2, dateStr: m.date, channel: channelStr, round: rName, isGroup: false });
        });
    });

    const groupedMatches = {};
    allMatches.forEach(m => {
        const dateParts = m.dateStr.split(',');
        const dayString = dateParts[0].trim();
        m.timeString = dateParts[1] ? dateParts[1].replace('BST', '').trim() : '';
        const matchParse = m.dateStr.match(/(\d+\s[A-Za-z]+),\s(\d+:\d+)/);
        m.timestamp = matchParse ? Date.parse(`${matchParse[1]} 2026 ${matchParse[2]} GMT+0100`) : 0;

        if (!groupedMatches[dayString]) groupedMatches[dayString] = [];
        groupedMatches[dayString].push(m);
    });

    const sortedDays = Object.keys(groupedMatches).sort((a, b) => groupedMatches[a][0].timestamp - groupedMatches[b][0].timestamp);

    const getFormattedTeamName = (str) => {
        if (teamsData[str]) {
            const name = getDisplayName(str);
            const color = isAssigned(str) ? 'text-[#D4AF37]' : 'text-white';
            return `<span class="${color}">${name}</span>`;
        }
        return `<span class="text-gray-500 font-normal text-[10px] md:text-xs uppercase tracking-wider">${str}</span>`;
    };

    let html = '';
    sortedDays.forEach(day => {
        groupedMatches[day].sort((a, b) => a.timestamp - b.timestamp);
        html += `<div class="bg-gray-800 text-[#D4AF37] font-bold px-4 py-2 uppercase tracking-widest text-[10px] md:text-xs border-y border-gray-700 shadow-md">${day}</div>`;

        groupedMatches[day].forEach(m => {
            let res = m.isGroup ? dbMatches[m.originGroup]?.[m.id] : dbMatches['knockouts']?.[m.id];
            let matchUI = ""; let channelUI = "";

            if (res && res.played) {
                let s1 = res.score1; let s2 = res.score2;
                let t1Won = false; let t2Won = false;

                if (!res.inProgress) {
                    if (s1 > s2) t1Won = true;
                    else if (s2 > s1) t2Won = true;
                    else if (res.pens && res.pen1 > res.pen2) t1Won = true;
                    else if (res.pens && res.pen2 > res.pen1) t2Won = true;
                }

                if (res.aet) {
                    if (!res.inProgress && t1Won) s1 = `${s1}<sup class="text-[10px] text-[#D4AF37] ml-0.5 font-bold">AET</sup>`;
                    else if (!res.inProgress && t2Won) s2 = `${s2}<sup class="text-[10px] text-[#D4AF37] ml-0.5 font-bold">AET</sup>`;
                    else { s1 += `<sup class="text-[10px] text-gray-400 ml-0.5 font-bold">AET</sup>`; s2 += `<sup class="text-[10px] text-gray-400 ml-0.5 font-bold">AET</sup>`; }
                }
                if (res.pens) {
                    s1 = `${s1} <span class="text-[10px] text-gray-400 font-normal">(${res.pen1})</span>`;
                    s2 = `<span class="text-[10px] text-gray-400 font-normal">(${res.pen2})</span> ${s2}`;
                }

                const timeStr = res.time ? `<span class="text-[8px] md:text-[9px] uppercase tracking-widest block text-center mb-0.5 leading-none">${res.time}</span>` : '';
                const scoreBox = res.inProgress
                    ? `<div class="bg-gray-900 border border-red-800/50 rounded px-1.5 py-0.5 text-red-500 font-bold text-xs md:text-sm tracking-wider flex flex-col items-center shadow-[0_0_8px_rgba(220,38,38,0.3)] animate-pulse mx-1 shrink-0 whitespace-nowrap min-w-[50px] justify-center">${timeStr}<span>${s1} - ${s2}</span></div>`
                    : `<div class="bg-gray-900 rounded px-1.5 py-0.5 text-[#D4AF37] font-bold text-xs md:text-sm tracking-wider mx-1 shrink-0 whitespace-nowrap min-w-[50px] text-center flex flex-col justify-center">${res.played ? '<span class="text-[8px] text-gray-500 uppercase tracking-widest block mb-0.5 leading-none">FT</span>' : ''}<span>${s1} - ${s2}</span></div>`;

                matchUI = `<div class="flex justify-between items-center w-full max-w-[280px] md:max-w-md mx-auto">
                    <div class="text-right flex-1 leading-tight truncate px-1">${getFormattedTeamName(m.t1)}</div>
                    ${scoreBox}
                    <div class="text-left flex-1 leading-tight truncate px-1">${getFormattedTeamName(m.t2)}</div>
                </div>`;
            } else {
                matchUI = `<div class="flex justify-between items-center w-full max-w-[280px] md:max-w-md mx-auto">
                    <div class="text-right flex-1 leading-tight truncate px-1">${getFormattedTeamName(m.t1)}</div>
                    <div class="text-gray-600 text-[10px] md:text-xs px-1 md:px-2 font-bold shrink-0">v</div>
                    <div class="text-left flex-1 leading-tight truncate px-1">${getFormattedTeamName(m.t2)}</div>
                </div>`;

                if (m.channel === 'BBC') channelUI = `<img src="BBC.png" class="h-3 md:h-4 rounded-sm opacity-90" alt="BBC">`;
                else if (m.channel === 'ITV') channelUI = `<img src="ITV.png" class="h-3 md:h-4 rounded-sm opacity-90" alt="ITV">`;
                else if (m.channel === 'BOTH') channelUI = `<img src="BBC.png" class="h-3 md:h-4 rounded-sm opacity-90" alt="BBC"><img src="ITV.png" class="h-3 md:h-4 rounded-sm opacity-90 ml-1" alt="ITV">`;
            }

            html += `
                <div class="flex items-center justify-between border-b border-gray-800/50 py-3 px-2 md:px-4 hover:bg-gray-900 transition-colors text-sm">
                    <div class="w-10 md:w-14 text-green-500 font-bold text-[10px] md:text-xs shrink-0">${m.timeString}</div>
                    <div class="w-12 md:w-16 text-gray-500 uppercase tracking-wider text-[10px] md:text-xs font-bold shrink-0 text-center">${m.round}</div>
                    <div class="flex-1 text-center font-bold overflow-hidden">${matchUI}</div>
                    <div class="w-8 md:w-12 flex justify-end shrink-0">${channelUI}</div>
                </div>
            `;
        });
    });

    target.innerHTML = html;
}