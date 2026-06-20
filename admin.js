import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, update, remove, onValue, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
onValue(ref(db, 'teams'), (snapshot) => { dbTeams = snapshot.val() || {}; });
onValue(ref(db, 'matches'), (snapshot) => { 
    dbMatches = snapshot.val() || {}; 
    populateTVDropdown(); 
});
onValue(ref(db, 'combinations'), (snapshot) => { dbCombinations = snapshot.val() || {}; });

function getAdminDisplayName(code) {
    if (!code || code.startsWith("Winner") || code.startsWith("Loser") || code.startsWith("1st") || code.startsWith("2nd") || code.startsWith("3rd") || code.startsWith("Match")) return code;
    return teamsData[code]?.name || code;
}

function calculateGroup(groupId) {
    const teams = groupStages[groupId];
    const standings = teams.map(code => ({ code, name: getAdminDisplayName(code), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0, conduct: 0, originGroup: groupId }));
    const groupMatches = dbMatches[groupId] || {};

    const validMatches = Object.values(groupMatches).filter(m => m && m.played && !m.inProgress);

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

function calculateThirdPlaceStandings() {
    const thirdPlacedTeams = [];
    Object.keys(groupStages).forEach(group => { thirdPlacedTeams.push(calculateGroup(group)[2]); });
    thirdPlacedTeams.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts; 
        if (b.gd !== a.gd) return b.gd - a.gd; 
        if (b.gf !== a.gf) return b.gf - a.gf;
        if (b.conduct !== a.conduct) return b.conduct - a.conduct;
        return teamsData[a.code].fifa - teamsData[b.code].fifa;
    });
    return thirdPlacedTeams;
}

function getFullBracket() {
    const ranks = {};
    Object.keys(groupStages).forEach(group => { ranks[group] = calculateGroup(group); });
    
    const thirds = calculateThirdPlaceStandings();
    const top8Thirds = thirds.slice(0, 8);
    const comboString = top8Thirds.map(t => t.originGroup).sort().join('');
    const matrixRow = dbCombinations[comboString] || {};

    const getThird = (matchId) => {
        let allGroupsComplete = true;
        Object.keys(groupStages).forEach(g => {
            const mCount = Object.values(dbMatches[g] || {}).filter(m => m && m.played && !m.inProgress).length;
            if (mCount < 6) allGroupsComplete = false;
        });
        if (!allGroupsComplete) return "3rd Place Team";
        
        const reqGroup = matrixRow[matchId];
        if (!reqGroup) return "3rd Place Team";
        const team = thirds.find(t => t.originGroup === reqGroup);
        return team ? team.code : "3rd Place Team";
    };

    const getSlot = (grp, pos) => {
        let allGroupsComplete = true;
        Object.keys(groupStages).forEach(g => {
            const mCount = Object.values(dbMatches[g] || {}).filter(m => m && m.played && !m.inProgress).length;
            if (mCount < 6) allGroupsComplete = false;
        });

        if (allGroupsComplete) {
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
            const t1Max = t1.pts + (3 - t1.played)*3; 
            const t2Max = t2.pts + (3 - t2.played)*3;
            
            if (pos === '1st' && t0.pts > t1Max) return t0.code;
            if (pos === '2nd' && t0.pts > t1Max && t1.pts > t2Max) return t1.code;
        }
        return `${pos} Grp ${grp}`;
    };

    const r32 = [
        { id: "R32-1", title: "Match 73", t1: getSlot('A', '2nd'), t2: getSlot('B', '2nd') },
        { id: "R32-2", title: "Match 76", t1: getSlot('C', '1st'), t2: getSlot('F', '2nd') },
        { id: "R32-3", title: "Match 74", t1: getSlot('E', '1st'), t2: getThird("R32-2") },
        { id: "R32-4", title: "Match 75", t1: getSlot('F', '1st'), t2: getSlot('C', '2nd') },
        { id: "R32-5", title: "Match 78", t1: getSlot('E', '2nd'), t2: getSlot('I', '2nd') },
        { id: "R32-6", title: "Match 77", t1: getSlot('I', '1st'), t2: getThird("R32-5") },
        { id: "R32-7", title: "Match 79", t1: getSlot('A', '1st'), t2: getThird("R32-7") },
        { id: "R32-8", title: "Match 80", t1: getSlot('L', '1st'), t2: getThird("R32-8") },
        { id: "R32-9", title: "Match 82", t1: getSlot('G', '1st'), t2: getThird("R32-10") },
        { id: "R32-10", title: "Match 81", t1: getSlot('D', '1st'), t2: getThird("R32-9") },
        { id: "R32-11", title: "Match 84", t1: getSlot('H', '1st'), t2: getSlot('J', '2nd') },
        { id: "R32-12", title: "Match 83", t1: getSlot('K', '2nd'), t2: getSlot('L', '2nd') },
        { id: "R32-13", title: "Match 85", t1: getSlot('B', '1st'), t2: getThird("R32-13") },
        { id: "R32-14", title: "Match 88", t1: getSlot('D', '2nd'), t2: getSlot('G', '2nd') },
        { id: "R32-15", title: "Match 86", t1: getSlot('J', '1st'), t2: getSlot('H', '2nd') },
        { id: "R32-16", title: "Match 87", t1: getSlot('K', '1st'), t2: getThird("R32-15") }
    ];

    const resolveWinner = (roundArray, mId) => {
        const m = roundArray.find(x => x.id === mId);
        if (!m || !m.t1 || !m.t2) return `Winner ${mId}`;
        const res = dbMatches['knockouts']?.[mId];
        if (!res || !res.played) return `Winner ${m.title || mId}`;
        if (res.score1 > res.score2) return m.t1;
        if (res.score2 > res.score1) return m.t2;
        if (res.pens && res.pen1 > res.pen2) return m.t1;
        if (res.pens && res.pen2 > res.pen1) return m.t2;
        return `Winner ${m.title || mId}`;
    };

    const resolveLoser = (roundArray, mId) => {
        const m = roundArray.find(x => x.id === mId);
        if (!m || !m.t1 || !m.t2) return `Loser ${mId}`;
        const res = dbMatches['knockouts']?.[mId];
        if (!res || !res.played) return `Loser ${m.title || mId}`;
        if (res.score1 > res.score2) return m.t2;
        if (res.score2 > res.score1) return m.t1;
        if (res.pens && res.pen1 > res.pen2) return m.t2;
        if (res.pens && res.pen2 > res.pen1) return m.t1;
        return `Loser ${m.title || mId}`;
    };

    const r16 = [
        { id: "R16-1", title: "Match 90", t1: resolveWinner(r32, "R32-1"), t2: resolveWinner(r32, "R32-4") },
        { id: "R16-2", title: "Match 89", t1: resolveWinner(r32, "R32-3"), t2: resolveWinner(r32, "R32-6") },
        { id: "R16-3", title: "Match 91", t1: resolveWinner(r32, "R32-2"), t2: resolveWinner(r32, "R32-5") },
        { id: "R16-4", title: "Match 92", t1: resolveWinner(r32, "R32-7"), t2: resolveWinner(r32, "R32-8") },
        { id: "R16-5", title: "Match 93", t1: resolveWinner(r32, "R32-12"), t2: resolveWinner(r32, "R32-11") },
        { id: "R16-6", title: "Match 94", t1: resolveWinner(r32, "R32-10"), t2: resolveWinner(r32, "R32-9") },
        { id: "R16-7", title: "Match 95", t1: resolveWinner(r32, "R32-15"), t2: resolveWinner(r32, "R32-14") },
        { id: "R16-8", title: "Match 96", t1: resolveWinner(r32, "R32-13"), t2: resolveWinner(r32, "R32-16") }
    ];

    const qf = [
        { id: "QF-1", title: "Match 97", t1: resolveWinner(r16, "R16-2"), t2: resolveWinner(r16, "R16-1") },
        { id: "QF-2", title: "Match 98", t1: resolveWinner(r16, "R16-5"), t2: resolveWinner(r16, "R16-6") },
        { id: "QF-3", title: "Match 99", t1: resolveWinner(r16, "R16-3"), t2: resolveWinner(r16, "R16-4") },
        { id: "QF-4", title: "Match 100", t1: resolveWinner(r16, "R16-7"), t2: resolveWinner(r16, "R16-8") }
    ];

    const sf = [
        { id: "SF-1", title: "Match 101", t1: resolveWinner(qf, "QF-1"), t2: resolveWinner(qf, "QF-2") },
        { id: "SF-2", title: "Match 102", t1: resolveWinner(qf, "QF-3"), t2: resolveWinner(qf, "QF-4") }
    ];

    const finals = [
        { id: "3RD", title: "Match 103", t1: resolveLoser(sf, "SF-1"), t2: resolveLoser(sf, "SF-2") },
        { id: "FIN", title: "Match 104", t1: resolveWinner(sf, "SF-1"), t2: resolveWinner(sf, "SF-2") }
    ];

    return { r32, r16, qf, sf, finals };
}

// POPULATE TEAM DROPDOWNS
const selectA = document.getElementById('team-select-a');
const selectB = document.getElementById('team-select-b');
const selectRemove = document.getElementById('remove-team-select');

let htmlA = `<option value="">-- No Pot A Team --</option>`;
let htmlB = `<option value="">-- No Pot B Team --</option>`;
let htmlRemove = `<option value="" disabled selected>-- Select Team to Unassign --</option>`;

const sortedCodes = Object.keys(teamsData).sort((a, b) => teamsData[a].name.localeCompare(teamsData[b].name));
sortedCodes.forEach(code => {
    const data = teamsData[code];
    const optionHTML = `<option value="${code}">${data.name} (${code})</option>`;
    if (data.pot === "A") htmlA += optionHTML; else htmlB += optionHTML;
    htmlRemove += optionHTML;
});

selectA.innerHTML = htmlA; selectB.innerHTML = htmlB; selectRemove.innerHTML = htmlRemove;

document.getElementById('save-owner-btn').addEventListener('click', () => {
    const ownerName = document.getElementById('owner-input').value.trim();
    const codeA = selectA.value; const codeB = selectB.value;
    const statusText = document.getElementById('owner-status');

    if (!ownerName || (!codeA && !codeB)) return showStatus(statusText, "Please enter a team member name and select at least one team.", false);

    const updates = {};
    if (codeA) updates['teams/' + codeA] = { owner: ownerName, pot: "A", name: teamsData[codeA].name };
    if (codeB) updates['teams/' + codeB] = { owner: ownerName, pot: "B", name: teamsData[codeB].name };

    update(ref(db), updates).then(() => {
        showStatus(statusText, `Assigned successfully!`, true);
        document.getElementById('owner-input').value = ''; selectA.value = ''; selectB.value = '';
    }).catch(err => showStatus(statusText, "Error: " + err.message, false));
});

document.getElementById('remove-owner-btn').addEventListener('click', () => {
    const code = selectRemove.value;
    const statusText = document.getElementById('remove-status');
    if (!code) return showStatus(statusText, "Select a team to remove.", false);

    remove(ref(db, 'teams/' + code)).then(() => {
        showStatus(statusText, `Unassigned successfully.`, true);
        selectRemove.value = '';
    }).catch(err => showStatus(statusText, "Error: " + err.message, false));
});


// GROUP MATCH LOGIC
const groupFilter = document.getElementById('group-filter');
const matchSelect = document.getElementById('match-select');

groupFilter.addEventListener('change', (e) => {
    const group = e.target.value;
    const teams = groupStages[group];
    const fixtures = [[teams[0], teams[1]], [teams[2], teams[3]], [teams[0], teams[2]], [teams[1], teams[3]], [teams[0], teams[3]], [teams[1], teams[2]]];

    matchSelect.innerHTML = `<option value="" disabled selected>-- Select Match --</option>`;
    fixtures.forEach((match, index) => {
        const matchId = `G${group}-M${index+1}`;
        matchSelect.innerHTML += `<option value="${matchId}" data-t1="${match[0]}" data-t2="${match[1]}">${teamsData[match[0]].name} vs ${teamsData[match[1]].name}</option>`;
    });
    matchSelect.disabled = false;
    resetGroupInputs();
});

matchSelect.addEventListener('change', (e) => {
    const opt = e.target.options[e.target.selectedIndex];
    document.getElementById('team1-name').innerText = teamsData[opt.getAttribute('data-t1')].name;
    document.getElementById('team2-name').innerText = teamsData[opt.getAttribute('data-t2')].name;
    document.getElementById('save-score-btn').disabled = false;
    document.getElementById('clear-score-btn').disabled = false;

    const matchId = matchSelect.value;
    get(ref(db, `matches/${groupFilter.value}/${matchId}`)).then(snap => {
        if(snap.exists() && snap.val().played) {
            const data = snap.val();
            document.getElementById('team1-score').value = data.score1;
            document.getElementById('team2-score').value = data.score2;
            document.getElementById('group-in-progress-check').checked = !!data.inProgress;
            
            document.getElementById('t1-yc').value = data.t1c?.yc || ''; document.getElementById('t1-irc').value = data.t1c?.irc || ''; document.getElementById('t1-drc').value = data.t1c?.drc || ''; document.getElementById('t1-ydrc').value = data.t1c?.ydrc || '';
            document.getElementById('t2-yc').value = data.t2c?.yc || ''; document.getElementById('t2-irc').value = data.t2c?.irc || ''; document.getElementById('t2-drc').value = data.t2c?.drc || ''; document.getElementById('t2-ydrc').value = data.t2c?.ydrc || '';
        } else {
            resetGroupInputs(true);
        }
    });
});

document.getElementById('save-score-btn').addEventListener('click', () => {
    const matchId = matchSelect.value;
    const s1 = parseInt(document.getElementById('team1-score').value);
    const s2 = parseInt(document.getElementById('team2-score').value);
    const isLive = document.getElementById('group-in-progress-check').checked;
    const statusText = document.getElementById('score-status');

    if (isNaN(s1) || isNaN(s2)) return showStatus(statusText, "Enter valid scores.", false);

    const t1YC = parseInt(document.getElementById('t1-yc').value) || 0; const t1IRC = parseInt(document.getElementById('t1-irc').value) || 0; const t1DRC = parseInt(document.getElementById('t1-drc').value) || 0; const t1YDRC = parseInt(document.getElementById('t1-ydrc').value) || 0;
    const t2YC = parseInt(document.getElementById('t2-yc').value) || 0; const t2IRC = parseInt(document.getElementById('t2-irc').value) || 0; const t2DRC = parseInt(document.getElementById('t2-drc').value) || 0; const t2YDRC = parseInt(document.getElementById('t2-ydrc').value) || 0;

    const opt = matchSelect.options[matchSelect.selectedIndex];
    set(ref(db, `matches/${groupFilter.value}/${matchId}`), {
        team1: opt.getAttribute('data-t1'), score1: s1, team2: opt.getAttribute('data-t2'), score2: s2, played: true, inProgress: isLive,
        t1c: { yc: t1YC, irc: t1IRC, drc: t1DRC, ydrc: t1YDRC },
        t2c: { yc: t2YC, irc: t2IRC, drc: t2DRC, ydrc: t2YDRC }
    }).then(() => {
        showStatus(statusText, isLive ? `Live Score Updated!` : `Final Result Published!`, true);
    }).catch(err => showStatus(statusText, err.message, false));
});

document.getElementById('clear-score-btn').addEventListener('click', () => {
    const matchId = matchSelect.value;
    const statusText = document.getElementById('score-status');
    if (!matchId) return;

    remove(ref(db, `matches/${groupFilter.value}/${matchId}`)).then(() => {
        showStatus(statusText, `Result Deleted/Cleared.`, true);
        resetGroupInputs(true);
    });
});


// DYNAMIC KNOCKOUT MATCH LOGIC
const koRoundsInfo = {
    "R32": Array.from({length: 16}, (_, i) => `R32-${i+1}`),
    "R16": Array.from({length: 8}, (_, i) => `R16-${i+1}`),
    "QF": Array.from({length: 4}, (_, i) => `QF-${i+1}`),
    "SF": Array.from({length: 2}, (_, i) => `SF-${i+1}`),
    "FINALS": ["3RD", "FIN"]
};

const koRoundSelect = document.getElementById('ko-round-select');
const koMatchSelect = document.getElementById('ko-match-select');
const koPensCheck = document.getElementById('ko-pens-check');
const pensContainer = document.getElementById('penalties-container');

koRoundSelect.addEventListener('change', (e) => {
    const round = e.target.value.toLowerCase();
    koMatchSelect.innerHTML = `<option value="" disabled selected>-- Select Match --</option>`;
    
    const bracket = getFullBracket();
    const matches = bracket[round] || [];
    
    matches.forEach(match => {
        const t1 = getAdminDisplayName(match.t1);
        const t2 = getAdminDisplayName(match.t2);
        koMatchSelect.innerHTML += `<option value="${match.id}">${match.title || match.id}: ${t1} vs ${t2}</option>`;
    });

    koMatchSelect.disabled = false;
    document.getElementById('ko-save-btn').disabled = true;
    document.getElementById('ko-clear-btn').disabled = true;
    resetKoInputs();
});

koMatchSelect.addEventListener('change', () => {
    document.getElementById('ko-save-btn').disabled = false;
    document.getElementById('ko-clear-btn').disabled = false;

    const matchId = koMatchSelect.value;
    get(ref(db, `matches/knockouts/${matchId}`)).then(snap => {
        if(snap.exists() && snap.val().played) {
            const data = snap.val();
            document.getElementById('ko-team1-score').value = data.score1;
            document.getElementById('ko-team2-score').value = data.score2;
            document.getElementById('ko-in-progress-check').checked = !!data.inProgress;
            document.getElementById('ko-aet-check').checked = !!data.aet;
            
            if (data.pens) {
                koPensCheck.checked = true;
                pensContainer.classList.remove('hidden');
                document.getElementById('ko-pen1-score').value = data.pen1;
                document.getElementById('ko-pen2-score').value = data.pen2;
            } else {
                koPensCheck.checked = false;
                pensContainer.classList.add('hidden');
            }
        } else {
            resetKoInputs(true);
        }
    });
});

koPensCheck.addEventListener('change', (e) => {
    if (e.target.checked) pensContainer.classList.remove('hidden');
    else pensContainer.classList.add('hidden');
});

document.getElementById('ko-save-btn').addEventListener('click', () => {
    const matchId = koMatchSelect.value;
    const s1 = parseInt(document.getElementById('ko-team1-score').value);
    const s2 = parseInt(document.getElementById('ko-team2-score').value);
    const aet = document.getElementById('ko-aet-check').checked;
    const pens = koPensCheck.checked;
    const isLive = document.getElementById('ko-in-progress-check').checked;
    const p1 = parseInt(document.getElementById('ko-pen1-score').value);
    const p2 = parseInt(document.getElementById('ko-pen2-score').value);
    const statusText = document.getElementById('ko-score-status');

    if (isNaN(s1) || isNaN(s2)) return showStatus(statusText, "Enter valid main scores.", false);
    if (pens && (isNaN(p1) || isNaN(p2))) return showStatus(statusText, "Enter valid penalty scores.", false);

    get(ref(db, `matches/knockouts/${matchId}/channel`)).then(snap => {
        const existingChannel = snap.exists() ? snap.val() : null;
        
        const payload = { score1: s1, score2: s2, played: true, aet: aet, pens: pens, inProgress: isLive };
        if (pens) { payload.pen1 = p1; payload.pen2 = p2; }
        if (existingChannel) { payload.channel = existingChannel; }

        set(ref(db, `matches/knockouts/${matchId}`), payload).then(() => {
            showStatus(statusText, isLive ? `Live Knockout Score Updated!` : `Final Knockout Result Published!`, true);
        }).catch(err => showStatus(statusText, err.message, false));
    });
});

document.getElementById('ko-clear-btn').addEventListener('click', () => {
    const matchId = koMatchSelect.value;
    const statusText = document.getElementById('ko-score-status');
    if (!matchId) return;

    get(ref(db, `matches/knockouts/${matchId}/channel`)).then(snap => {
        const existingChannel = snap.exists() ? snap.val() : null;
        
        if (existingChannel) {
            set(ref(db, `matches/knockouts/${matchId}`), { channel: existingChannel }).then(() => {
                showStatus(statusText, `Knockout Result Cleared.`, true);
                resetKoInputs(true);
            });
        } else {
            remove(ref(db, `matches/knockouts/${matchId}`)).then(() => {
                showStatus(statusText, `Knockout Result Cleared.`, true);
                resetKoInputs(true);
            });
        }
    });
});

// KNOCKOUT TV BROADCAST SELECTION
const tvMatchSelect = document.getElementById('tv-ko-match-select');
const tvChannelSelect = document.getElementById('tv-channel-select');
const saveTvBtn = document.getElementById('save-tv-btn');
const clearTvBtn = document.getElementById('clear-tv-btn');

function populateTVDropdown() {
    const currentVal = tvMatchSelect.value;
    tvMatchSelect.innerHTML = `<option value="" disabled selected>-- Select KO Match --</option>`;
    
    const bracket = getFullBracket(); 
    ['r32', 'r16', 'qf', 'sf', 'finals'].forEach(round => {
        (bracket[round] || []).forEach(m => {
            if (m.id !== 'FIN') { 
                const t1 = getAdminDisplayName(m.t1);
                const t2 = getAdminDisplayName(m.t2);
                tvMatchSelect.innerHTML += `<option value="${m.id}">${m.title || m.id}: ${t1} vs ${t2}</option>`;
            }
        });
    });
    
    if (currentVal) tvMatchSelect.value = currentVal;
}

tvMatchSelect.addEventListener('change', () => {
    tvChannelSelect.disabled = false;
    saveTvBtn.disabled = false;
    clearTvBtn.disabled = false;
    get(ref(db, `matches/knockouts/${tvMatchSelect.value}/channel`)).then(snap => {
        tvChannelSelect.value = snap.exists() ? snap.val() : "";
    });
});

saveTvBtn.addEventListener('click', () => {
    const matchId = tvMatchSelect.value;
    const channel = tvChannelSelect.value;
    const statusText = document.getElementById('tv-status');

    update(ref(db, `matches/knockouts/${matchId}`), { channel: channel || null }).then(() => {
        showStatus(statusText, `Broadcast updated!`, true);
    }).catch(err => showStatus(statusText, err.message, false));
});

clearTvBtn.addEventListener('click', () => {
    const matchId = tvMatchSelect.value;
    const statusText = document.getElementById('tv-status');

    update(ref(db, `matches/knockouts/${matchId}`), { channel: null }).then(() => {
        showStatus(statusText, `Broadcast cleared!`, true);
        tvChannelSelect.value = "";
    }).catch(err => showStatus(statusText, err.message, false));
});


// RESET TOOLS (DANGER ZONE)
const resetGroupsBtn = document.getElementById('reset-groups-btn');
const resetKosBtn = document.getElementById('reset-kos-btn');
const resetStatus = document.getElementById('reset-status');

if (resetGroupsBtn) {
    resetGroupsBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to delete ALL Group Stage results? This cannot be undone.")) {
            const updates = {};
            ['A','B','C','D','E','F','G','H','I','J','K','L'].forEach(g => {
                updates[`matches/${g}`] = null;
            });
            update(ref(db), updates).then(() => {
                showStatus(resetStatus, "All Group Stage results have been wiped clean.", true);
            }).catch(err => showStatus(resetStatus, err.message, false));
        }
    });
}

if (resetKosBtn) {
    resetKosBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to delete ALL Knockout match results? This cannot be undone.")) {
            remove(ref(db, 'matches/knockouts')).then(() => {
                showStatus(resetStatus, "All Knockout results have been wiped clean.", true);
            }).catch(err => showStatus(resetStatus, err.message, false));
        }
    });
}

function showStatus(element, text, isSuccess) {
    element.innerText = text;
    element.classList.remove('hidden');
    element.className = `text-sm mt-4 text-center block font-bold tracking-wide ${isSuccess ? 'text-green-500' : 'text-red-500'}`;
}

function resetGroupInputs(keepNames = false) {
    if(!keepNames) {
        document.getElementById('team1-name').innerText = "Team 1"; document.getElementById('team2-name').innerText = "Team 2";
        document.getElementById('save-score-btn').disabled = true; document.getElementById('clear-score-btn').disabled = true;
    }
    document.getElementById('team1-score').value = ''; document.getElementById('team2-score').value = '';
    document.getElementById('group-in-progress-check').checked = false;
    ['t1-yc', 't1-irc', 't1-drc', 't1-ydrc', 't2-yc', 't2-irc', 't2-drc', 't2-ydrc'].forEach(id => { document.getElementById(id).value = ''; });
}

function resetKoInputs(keepMatch = false) {
    document.getElementById('ko-team1-score').value = ''; document.getElementById('ko-team2-score').value = '';
    document.getElementById('ko-pen1-score').value = ''; document.getElementById('ko-pen2-score').value = '';
    document.getElementById('ko-aet-check').checked = false; koPensCheck.checked = false;
    document.getElementById('ko-in-progress-check').checked = false;
    pensContainer.classList.add('hidden');
    if(!keepMatch) {
        document.getElementById('ko-save-btn').disabled = true;
        document.getElementById('ko-clear-btn').disabled = true;
    }
}