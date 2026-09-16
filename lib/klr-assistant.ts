import { readFileSync } from "node:fs";
import { join } from "node:path";

type CsvRow = Record<string, string>;
type Evidence = Record<string, string | number | null>;
type CareerCentury = { date: string; format: string; runs: number; balls: number; opponent: string; venue: string; result: string };
type CareerFormat = { matches: number; innings: number; runs: number; average: number; strikeRate: number; highest: number; hundreds: number; fifties: number; thirties: number; fours: number; sixes: number; notOuts: number };
type ArchiveSnapshot = { centuries: CareerCentury[]; formats: Record<string, CareerFormat> };

const archiveData = JSON.parse(readFileSync(join(process.cwd(), "public", "data", "klr-archive.json"), "utf8")) as ArchiveSnapshot;
const verifiedFacts = JSON.parse(readFileSync(join(process.cwd(), "public", "data", "klr-verified-facts.json"), "utf8"));

export type AssistantResponse = {
  answer: string;
  evidence: Evidence[];
  status: "answered" | "limited" | "unavailable";
  source: string;
};

let cachedRows: CsvRow[] | null = null;

function parseCsv(text: string) {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && text[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      record.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      record.push(field);
      if (record.some(Boolean)) records.push(record);
      record = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field || record.length) {
    record.push(field);
    records.push(record);
  }

  const [headers, ...values] = records;
  return values.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])),
  );
}

function getRows() {
  if (cachedRows) return cachedRows;
  const file = join(process.cwd(), "backend", "data", "processed", "kl_rahul_innings_features.csv");
  cachedRows = parseCsv(readFileSync(file, "utf8"));
  return cachedRows;
}

function number(row: CsvRow, key: string) {
  const value = Number(row[key]);
  return Number.isFinite(value) ? value : 0;
}

function isTrue(value: string) {
  return value.toLowerCase() === "true" || value === "1";
}

function summarize(rows: CsvRow[]) {
  const runs = rows.reduce((total, row) => total + number(row, "runs"), 0);
  const balls = rows.reduce((total, row) => total + number(row, "balls"), 0);
  const outs = rows.filter((row) => isTrue(row.dismissed)).length;
  const highest = rows.reduce((value, row) => Math.max(value, number(row, "runs")), 0);
  return {
    innings: rows.length,
    runs,
    average: outs ? Number((runs / outs).toFixed(2)) : null,
    strike_rate: balls ? Number(((runs / balls) * 100).toFixed(2)) : null,
    hundreds: rows.filter((row) => number(row, "runs") >= 100).length,
    fifties: rows.filter((row) => number(row, "runs") >= 50 && number(row, "runs") < 100).length,
    highest,
  };
}

function groupBy(rows: CsvRow[], key: string) {
  const groups = new Map<string, CsvRow[]>();
  for (const row of rows) {
    const value = row[key];
    if (!value) continue;
    groups.set(value, [...(groups.get(value) ?? []), row]);
  }
  return groups;
}

function evidenceForInnings(row: CsvRow): Evidence {
  return {
    date: row.date,
    format: row.format,
    runs: number(row, "runs"),
    balls: number(row, "balls"),
    opponent: row.opponent,
    venue: row.venue,
    result: row.result,
  };
}

const SOURCE = "BCCI/IPL career snapshot and ICC-verified milestones through 2026-08-26; detailed splits use the local Cricsheet innings archive";

export function answerKlrQuestion(question: string): AssistantResponse {
  const allRows = getRows().filter((row) => !isTrue(row.super_over));
  const query = question.toLowerCase().replace(/\s+/g, " ").trim();
  const formatAliases: Array<[RegExp, string]> = [
    [/\btests?\b/, "Test"],
    [/\bodis?\b|one[- ]day/, "ODI"],
    [/\bt20is?\b|\bt20 internationals?\b/, "T20I"],
    [/\bipl\b/, "IPL"],
  ];
  const selectedFormat = formatAliases.find(([pattern]) => pattern.test(query))?.[1];
  const scope = selectedFormat ? allRows.filter((row) => row.format === selectedFormat) : allRows;

  if (/afghanistan|12th test (hundred|century)|vice[- ]captain/.test(query)) {
    const fact = verifiedFacts.afghanistan2026;
    return {
      answer: `On ${fact.date}, KL Rahul scored exactly ${fact.runs} from ${fact.balls} balls against Afghanistan in the one-off Test at ${fact.venue}. The innings contained ${fact.fours} fours, was his ${fact.testHundredNumber}th Test hundred, and his first hundred as India's vice-captain.`,
      evidence: [{ date: fact.date, format: "Test", opponent: fact.opponent, runs: fact.runs, balls: fact.balls, fours: fact.fours, venue: fact.venue }],
      status: "answered",
      source: SOURCE,
    };
  }

  if (/champions trophy|icc title|2025 trophy/.test(query)) {
    const fact = verifiedFacts.championsTrophy2025;
    return {
      answer: `${fact.result}. Rahul served as the ${fact.role.toLowerCase()}, scoring ${fact.runs} runs across ${fact.matches} matches (${fact.innings} innings) at a strike rate of ${fact.strikeRate.toFixed(2)}. In the final, he made ${fact.final}. It was his first senior ICC tournament title as a member of India's winning squad.`,
      evidence: [{ tournament: "ICC Champions Trophy 2025", matches: fact.matches, innings: fact.innings, runs: fact.runs, strike_rate: fact.strikeRate, final: fact.final }],
      status: "answered",
      source: SOURCE,
    };
  }

  if (/last (play|appearance|t20i)|t20i (absence|return)|2024 t20 world cup|2026 t20 world cup|world cup-winning squad/.test(query)) {
    const fact = verifiedFacts.t20iStatus;
    return {
      answer: `KL Rahul's last T20I was the World Cup semi-final against England on ${fact.lastAppearance}. He was not part of India's title-winning T20 World Cup squads in 2024 or 2026, so those are not his personal trophies. ${fact.status}`,
      evidence: [{ last_t20i: fact.lastAppearance, last_match: fact.lastMatch, "2024_squad": "not selected", "2026_squad": "not selected" }],
      status: "answered",
      source: SOURCE,
    };
  }

  if (!scope.length) {
    return { answer: "No innings match that format in the supplied coverage.", evidence: [], status: "unavailable", source: SOURCE };
  }

  if (/\b(opener|opening|batting position|no\.?\s*5|number five)\b/.test(query)) {
    const opener = scope.filter((row) => [1, 2].includes(number(row, "batting_position")));
    const numberFive = scope.filter((row) => number(row, "batting_position") === 5);
    const evidence: Evidence[] = [];
    if (opener.length) evidence.push({ label: "Opener (positions 1–2)", ...summarize(opener) });
    if (/\b(no\.?\s*5|number five|compare)\b/.test(query) && numberFive.length) {
      evidence.push({ label: "No. 5", ...summarize(numberFive) });
    }
    if (!evidence.length) {
      return { answer: "No innings match that batting-position request in the supplied coverage.", evidence, status: "unavailable", source: SOURCE };
    }
    const detail = evidence.map((item) => `${item.label}: ${item.runs} runs from ${item.innings} innings, average ${item.average}`).join("; ");
    return {
      answer: `Within the requested Cricsheet scope, ${detail}. Batting position is derived from first appearance in the delivery sequence.`,
      evidence,
      status: "answered",
      source: SOURCE,
    };
  }

  if (/\b(most runs|leading)\b/.test(query) && /\b(opponent|against)\b/.test(query)) {
    const ranked = [...groupBy(scope, "opponent")].map(([label, rows]) => ({ label, ...summarize(rows) })).sort((left, right) => right.runs - left.runs);
    const leader = ranked[0];
    return {
      answer: `In this dataset scope, KL Rahul has scored the most runs against ${leader.label}: ${leader.runs} runs from ${leader.innings} innings, with a highest score of ${leader.highest}.`,
      evidence: ranked.slice(0, 5),
      status: "answered",
      source: SOURCE,
    };
  }

  if (/\b(highest|best|top)\b/.test(query) && /\b(score|innings)\b/.test(query)) {
    const ranked = [...scope].sort((left, right) => number(right, "runs") - number(left, "runs") || number(right, "impact_score") - number(left, "impact_score"));
    const leader = ranked[0];
    return {
      answer: `His highest score in the requested scope is ${number(leader, "runs")} against ${leader.opponent} at ${leader.venue}, from ${number(leader, "balls")} balls.`,
      evidence: ranked.slice(0, 8).map(evidenceForInnings),
      status: "answered",
      source: SOURCE,
    };
  }

  if (/\bimpact\b/.test(query)) {
    const ranked = [...scope].sort((left, right) => number(right, "impact_score") - number(left, "impact_score"));
    const leader = ranked[0];
    return {
      answer: `The highest KLR Impact Score in this scope is ${number(leader, "impact_score")} for ${number(leader, "runs")} against ${leader.opponent}. KLR Impact Score is a site-defined metric, not an official cricket statistic.`,
      evidence: ranked.slice(0, 8).map((row) => ({ ...evidenceForInnings(row), impact_score: number(row, "impact_score") })),
      status: "answered",
      source: SOURCE,
    };
  }

  if (/\b(recent form|last (five|5|ten|10))\b/.test(query)) {
    const count = /\b(ten|10)\b/.test(query) ? 10 : 5;
    const recent = [...scope].sort((left, right) => left.date.localeCompare(right.date) || left.match_id.localeCompare(right.match_id)).slice(-count);
    const summary = summarize(recent);
    return {
      answer: `Across the latest ${recent.length} innings in this scope, KL Rahul scored ${summary.runs} runs at an average of ${summary.average} and strike rate of ${summary.strike_rate}. The coverage ends ${recent.at(-1)?.date}.`,
      evidence: recent.reverse().map((row) => ({ ...evidenceForInnings(row), form_index: number(row, "form_index") })),
      status: "answered",
      source: SOURCE,
    };
  }

  if (/\b(form index|form score)\b/.test(query)) {
    const recent = [...scope].sort((left, right) => left.date.localeCompare(right.date) || left.match_id.localeCompare(right.match_id)).slice(-10).reverse();
    const latest = recent[0];
    return {
      answer: `The latest available KLR Form Index is ${number(latest, "form_index")} after the innings on ${latest.date}. This is a site-defined trailing-ten metric, not an official statistic.`,
      evidence: recent.map((row) => ({ date: row.date, format: row.format, opponent: row.opponent, runs: number(row, "runs"), form_index: number(row, "form_index") })),
      status: "answered",
      source: SOURCE,
    };
  }

  if (/\b(dismiss|dismissal|gotten out|gets out)\b/.test(query)) {
    const dismissed = scope.filter((row) => isTrue(row.dismissed) && row.dismissal_kind);
    const patterns = [...groupBy(dismissed, "dismissal_kind")].map(([label, rows]) => ({ label, dismissals: rows.length, share_percent: Number(((rows.length / dismissed.length) * 100).toFixed(1)) })).sort((left, right) => right.dismissals - left.dismissals);
    const leader = patterns[0];
    return {
      answer: `The most frequent recorded dismissal in this scope is ${leader.label}: ${leader.dismissals} dismissals (${leader.share_percent}% of recorded outs).`,
      evidence: patterns,
      status: "answered",
      source: SOURCE,
    };
  }

  if (/\bseason|best ipl|ipl year\b/.test(query)) {
    const ipl = allRows.filter((row) => row.format === "IPL");
    const seasons = [...groupBy(ipl, "season")].map(([label, rows]) => ({ label, ...summarize(rows) })).sort((left, right) => right.runs - left.runs);
    return {
      answer: `By runs in the supplied IPL coverage, his leading seasons are ${seasons.slice(0, 5).map((season) => `${season.label} (${season.runs})`).join(", ")}.`,
      evidence: seasons.slice(0, 8),
      status: "answered",
      source: SOURCE,
    };
  }

  if (/\b(centur|hundred)\w*/.test(query)) {
    const centuries = archiveData.centuries
      .filter((row) => !selectedFormat || row.format === selectedFormat)
      .sort((left, right) => right.runs - left.runs || right.date.localeCompare(left.date));
    if (!centuries.length) return { answer: "No centuries match that format in the supplied coverage.", evidence: [], status: "unavailable", source: SOURCE };
    return {
      answer: `The verified career archive contains ${centuries.length} ${selectedFormat ? `${selectedFormat} ` : ""}centuries. The highest in this scope is ${centuries[0].runs} against ${centuries[0].opponent} at ${centuries[0].venue}.`,
      evidence: centuries.slice(0, 12).map((row) => ({ date: row.date, format: row.format, runs: row.runs, balls: row.balls, opponent: row.opponent, venue: row.venue, result: row.result })),
      status: "answered",
      source: SOURCE,
    };
  }

  const venue = [...new Set(allRows.map((row) => row.venue).filter(Boolean))].sort((left, right) => right.length - left.length).find((name) => query.includes(name.toLowerCase()));
  if (venue) {
    const rows = scope.filter((row) => row.venue === venue);
    const summary = summarize(rows);
    return {
      answer: `At ${venue}, KL Rahul scored ${summary.runs} runs in ${summary.innings} innings at an average of ${summary.average} and strike rate of ${summary.strike_rate}; his highest was ${summary.highest}.`,
      evidence: [{ label: venue, ...summary }],
      status: "answered",
      source: SOURCE,
    };
  }

  const opponent = [...new Set(allRows.map((row) => row.opponent).filter(Boolean))].sort((left, right) => right.length - left.length).find((name) => query.includes(name.toLowerCase()));
  if (opponent) {
    const rows = scope.filter((row) => row.opponent === opponent);
    if (!rows.length) return { answer: `No ${selectedFormat ?? "requested"} innings against ${opponent} exist in the supplied coverage.`, evidence: [], status: "unavailable", source: SOURCE };
    const summary = summarize(rows);
    return {
      answer: `Against ${opponent}, KL Rahul scored ${summary.runs} runs in ${summary.innings} innings at an average of ${summary.average} and strike rate of ${summary.strike_rate}. He made ${summary.hundreds} hundreds and ${summary.fifties} fifties; his highest was ${summary.highest}.`,
      evidence: [{ label: opponent, ...summary }],
      status: "answered",
      source: SOURCE,
    };
  }

  if (/\b(role|changed|evolution)\b/.test(query)) {
    const roleRows = allRows.filter((row) => row.format === (selectedFormat ?? "ODI"));
    const yearly = [...groupBy(roleRows, "year")].map(([label, rows]) => ({
      label,
      innings: rows.length,
      average_batting_position: Number((rows.reduce((total, row) => total + number(row, "batting_position"), 0) / rows.length).toFixed(2)),
      runs: summarize(rows).runs,
    })).sort((left, right) => left.label.localeCompare(right.label));
    return {
      answer: `The ${selectedFormat ?? "ODI"} role history below shows changes in recorded batting position by year. It describes position, not tactical intent.`,
      evidence: yearly,
      status: "answered",
      source: SOURCE,
    };
  }

  if (selectedFormat) {
    const summary = archiveData.formats[selectedFormat as keyof typeof archiveData.formats];
    return {
      answer: `Through 26 August 2026, KL Rahul has ${summary.runs} ${selectedFormat} runs from ${summary.innings} innings in ${summary.matches} matches, averaging ${summary.average} at a strike rate of ${summary.strikeRate}, with ${summary.hundreds} hundreds and ${summary.fifties} fifties.`,
      evidence: [{ label: selectedFormat, ...summary }],
      status: "answered",
      source: SOURCE,
    };
  }

  return {
    answer: "I could not map that question to a supported verified query. Ask about a format, opponent, venue, centuries, highest scores, recent form, Form Index, Impact Score, dismissals, IPL seasons, batting position or role evolution.",
    evidence: [],
    status: "unavailable",
    source: SOURCE,
  };
}

export function resetAssistantCacheForTests() {
  cachedRows = null;
}
