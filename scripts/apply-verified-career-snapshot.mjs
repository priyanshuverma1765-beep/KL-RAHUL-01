import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const archivePath = join(process.cwd(), "public", "data", "klr-archive.json");
const archive = JSON.parse(readFileSync(archivePath, "utf8"));

const formats = {
  IPL: { matches: 159, innings: 150, runs: 5815, average: 46.15, strikeRate: 139.15, highest: 152, hundreds: 6, fifties: 45, thirties: 74, fours: 508, sixes: 239, notOuts: 24 },
  Test: { matches: 69, innings: 121, runs: 4270, average: 36.81, strikeRate: 52.09, highest: 199, hundreds: 12, fifties: 21, thirties: 49, fours: 508, sixes: 33, notOuts: 5 },
  ODI: { matches: 98, innings: 90, runs: 3412, average: 49.45, strikeRate: 91.08, highest: 112, hundreds: 8, fifties: 20, thirties: 46, fours: 265, sixes: 79, notOuts: 21 },
  T20I: { matches: 72, innings: 68, runs: 2265, average: 37.75, strikeRate: 139.13, highest: 110, hundreds: 2, fifties: 22, thirties: 31, fours: 191, sixes: 99, notOuts: 8 },
};

archive.lastUpdated = "2026-08-26";
archive.deliveryCoverage = { ...archive.coverage };
archive.coverage = { start: "2013-04-16", end: "2026-08-26", matches: 398, innings: 429 };
archive.overall = {
  matches: 398,
  innings: 429,
  runs: 15762,
  average: 42.49,
  strikeRate: 88.8,
  highest: 199,
  hundreds: 28,
  fifties: 108,
  thirties: 200,
  fours: 1472,
  sixes: 450,
  notOuts: 58,
};
archive.formats = formats;

archive.yearly = archive.yearly.map((row) => {
  if (row.format === "Test" && row.year === 2026) {
    return { matches: 2, innings: 3, runs: 217, average: 72.33, strikeRate: 56.07, highest: 100, hundreds: 1, fifties: 1, thirties: 3, fours: 23, sixes: 3, notOuts: 0, format: "Test", year: 2026 };
  }
  if (row.format === "ODI" && row.year === 2026) {
    return { matches: 7, innings: 7, runs: 194, average: 48.5, strikeRate: 129.33, highest: 112, hundreds: 1, fifties: 0, thirties: 2, fours: 19, sixes: 5, notOuts: 3, format: "ODI", year: 2026 };
  }
  return row;
});

if (!archive.centuries.some((entry) => entry.date === "2026-06-06" && entry.format === "Test")) {
  archive.centuries.push({
    match_id: "verified-148382",
    date: "2026-06-06",
    format: "Test",
    opponent: "Afghanistan",
    venue: "Mullanpur / New Chandigarh",
    innings_number: 1,
    batting_position: 1,
    runs: 100,
    balls: 165,
    fours: 11,
    sixes: 0,
    strike_rate: 60.61,
    result: "win",
    dismissal_kind: "caught",
    team_score: 564,
    impact_score: 92.1,
    milestone: "12th Test century · first hundred as India vice-captain",
    match_context: "India vs Afghanistan · one-off Test",
  });
}
archive.centuries.sort((left, right) => left.date.localeCompare(right.date));

writeFileSync(archivePath, `${JSON.stringify(archive, null, 2)}\n`);

const facts = {
  lastUpdated: "2026-08-26",
  identity: "Independent AI fan assistant; not KL Rahul and not affiliated with him.",
  officialCareerSnapshot: { formats, overall: archive.overall },
  afghanistan2026: {
    date: "2026-06-06",
    opponent: "Afghanistan",
    match: "one-off Test",
    venue: "Mullanpur / New Chandigarh",
    runs: 100,
    balls: 165,
    fours: 11,
    sixes: 0,
    testHundredNumber: 12,
    viceCaptainMilestone: "First hundred as India's Test vice-captain",
  },
  championsTrophy2025: {
    result: "India won the ICC Champions Trophy in March 2025",
    matches: 5,
    innings: 4,
    runs: 140,
    strikeRate: 97.9,
    final: "34 not out; completed the chase against New Zealand with Ravindra Jadeja",
    role: "Middle-order wicketkeeper-finisher",
    milestone: "First senior ICC tournament title as a member of India's winning squad",
  },
  t20iStatus: {
    lastAppearance: "2022-11-10",
    lastMatch: "T20 World Cup semi-final against England",
    notInWinningSquads: ["India's 2024 T20 World Cup-winning squad", "India's 2026 T20 World Cup-winning squad"],
    status: "No T20I appearance since November 2022; a return remains an unfinished personal objective.",
  },
  sourceNotes: [
    "BCCI international player profile and official schedule",
    "IPL official player profile",
    "ICC tournament reports and player features",
    "Verified scorecards for the Afghanistan 2026 Test and August 2026 Sri Lanka Test",
  ],
};
writeFileSync(join(process.cwd(), "public", "data", "klr-verified-facts.json"), `${JSON.stringify(facts, null, 2)}\n`);
console.log("Applied verified KL Rahul career snapshot through 2026-08-26");
