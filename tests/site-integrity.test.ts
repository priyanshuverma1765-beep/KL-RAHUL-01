import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { answerKlrQuestion, resetAssistantCacheForTests } from "../lib/klr-assistant.ts";

const root = process.cwd();
const mergedImages = JSON.parse(readFileSync(join(root, "data", "merged-image-manifest.json"), "utf8"));
const archive = JSON.parse(readFileSync(join(root, "public", "data", "klr-archive.json"), "utf8"));

test("the restored and supplemental collections coexist in one local manifest", () => {
  assert.deepEqual(mergedImages.sources, {
    originalRecovered: 119,
    supplementalRecovered: 41,
    sameFrameDuplicatesExcluded: 2,
    combinedValidUnique: 158,
  });
  assert.equal(mergedImages.records.length, 158);
  assert.deepEqual(mergedImages.records.slice(0, 10).map((item: { id: string }) => item.id), [
    "supplemental-04", "original-pack-3627", "original-pack-3654", "supplemental-14", "original-pack-3674",
    "supplemental-30", "original-pack-3664", "supplemental-36", "original-pack-3687", "supplemental-35",
  ]);
  assert.equal(new Set(mergedImages.records.map((item: { id: string }) => item.id)).size, 158);
  assert.equal(mergedImages.records.filter((item: { collectionSource: string }) => item.collectionSource === "original-119").length, 117);
  assert.equal(mergedImages.records.filter((item: { collectionSource: string }) => item.collectionSource === "supplemental-41").length, 41);
  for (const item of mergedImages.records) {
    assert.ok(item.galleryCategories.length > 0, `${item.id} needs a filter`);
    assert.ok(item.suitableWebsitePlacements.length > 0, `${item.id} needs a suitable placement`);
    assert.ok(item.mustNotUseFor.length > 0, `${item.id} needs a restriction`);
    const file = join(root, "public", item.currentPath.replace(/^\//, ""));
    assert.equal(existsSync(file), true, item.currentPath);
    assert.ok(statSync(file).size > 0, `${item.currentPath} must not be empty`);
  }
  const image38 = mergedImages.records.find((item: { id: string }) => item.id === "supplemental-38");
  assert.deepEqual(image38.format, ["ODI"]);
  assert.equal(image38.galleryCategories.includes("Test"), false);
  assert.match(image38.currentPath, /limited-overs/);
  assert.match(image38.mustNotUseFor.join(" "), /Afghanistan 2026/);
});

test("Journey contains the required compact 19-stage chronology and measured route", () => {
  const source = readFileSync(join(root, "components", "sections", "journey-stats.tsx"), "utf8");
  const styles = readFileSync(join(root, "app", "globals.css"), "utf8");
  assert.equal((source.match(/number: "\d{2}"/g) ?? []).length, 19);
  for (const phrase of [
    "Karnataka foundations", "India call-up, difficult debut", "Sydney answers the doubt", "A hundred on ODI debut", "From T20I debut to 110*",
    "Two difficult campaigns", "The T20I door stays closed", "A home beyond cricket", "111* on return", "Champions Trophy winner",
    "Delhi resurgence", "Red-ball renewal", "The 150 barrier falls",
  ]) assert.ok(source.includes(phrase), phrase);
  assert.match(source, /ResizeObserver/);
  assert.match(source, /document\.fonts\?\.ready/);
  assert.match(source, /markerEnd="url\(#journey-arrow\)"/);
  assert.match(source, /journey-route-sketch/);
  assert.match(styles, /stroke-dasharray: 1\.6 8\.4/);
  assert.match(source, /152\* \(67\)/);
  assert.match(source, /old-01-1f65a1f37eaae9d258f8ad662632b0c4\.webp/);
  assert.match(source, /old-04-64e66dfd4d7fecb8f7eca85270c858d2\.webp/);
  assert.match(source, /early-career-3626\.webp/);
  assert.match(source, /india-breakthrough-3635\.webp/);
  assert.match(source, /established-india-3649\.webp/);
  assert.match(source, /comeback-and-world-cup-3677\.webp/);
  assert.equal(source.includes("A hundred, and unfinished ground"), false);
  assert.equal(/100vh|100dvh/.test(source), false);
  assert.match(styles, /gap: clamp\(64px, 6vw, 92px\)/);
  assert.match(styles, /scroll-margin-top: calc\(var\(--nav-height\) \+ 44px\)/);
  assert.equal(styles.includes(".journey-link-0"), false);
});

test("career snapshot and Afghanistan century are reconciled through 26 August 2026", () => {
  assert.equal(archive.lastUpdated, "2026-08-26");
  assert.deepEqual(archive.coverage, { start: "2013-04-16", end: "2026-08-26", matches: 398, innings: 429 });
  assert.equal(archive.overall.runs, 15762);
  assert.equal(archive.overall.hundreds, 28);
  assert.deepEqual(archive.formats.Test, {
    matches: 69, innings: 121, runs: 4270, average: 36.81, strikeRate: 52.09, highest: 199,
    hundreds: 12, fifties: 21, thirties: 49, fours: 508, sixes: 33, notOuts: 5,
  });
  const afghanistan = archive.centuries.find((item: { date: string }) => item.date === "2026-06-06");
  assert.deepEqual(
    { opponent: afghanistan.opponent, venue: afghanistan.venue, runs: afghanistan.runs, balls: afghanistan.balls, fours: afghanistan.fours },
    { opponent: "Afghanistan", venue: "Mullanpur / New Chandigarh", runs: 100, balls: 165, fours: 11 },
  );
  assert.match(afghanistan.milestone, /12th Test century/);
});

test("Stats keeps the hundreds and fifties value on one baseline", () => {
  const source = readFileSync(join(root, "components", "sections", "journey-stats.tsx"), "utf8");
  const styles = readFileSync(join(root, "app", "globals.css"), "utf8");
  assert.match(source, /className="stat-nowrap"/);
  assert.match(styles, /\.stat-strip strong\.stat-nowrap[\s\S]*display: inline-flex/);
  assert.match(styles, /\.stat-strip strong\.stat-nowrap[\s\S]*white-space: nowrap/);
  assert.match(styles, /\.stat-strip strong\.stat-nowrap[\s\S]*align-items: baseline/);
});

test("Gallery starts at ten, increments by ten and resets after filtering", () => {
  const source = readFileSync(join(root, "components", "sections", "century-gallery.tsx"), "utf8");
  assert.match(source, /merged-image-manifest\.json/);
  assert.match(source, /useState\(10\)/);
  assert.match(source, /setVisibleCount\(10\)/);
  assert.match(source, /Math\.min\(value \+ 10, filtered\.length\)/);
  assert.match(source, /Showing \{visible\.length\} of \{filtered\.length\}/);
  for (const label of ["Domestic/Early Career", "Centuries/Celebrations", "Wicketkeeping", "Off Field"]) assert.ok(source.includes(label));
  assert.match(source, /const visible = useMemo\(\(\) => filtered\.slice\(0, visibleCount\)/);
});

test("Century Vault restores every century image and sorts scores high to low", () => {
  const source = readFileSync(join(root, "components", "sections", "century-gallery.tsx"), "utf8");
  assert.equal((source.match(/^  "\d{4}-\d{2}-\d{2}":/gm) ?? []).length, 28);
  assert.match(source, /right\.runs - left\.runs/);
  assert.match(source, /2026-04-25[\s\S]*current-chapter-3691\.webp/);
  assert.match(source, /2018-07-03[\s\S]*established-india-3641\.webp/);
  assert.match(source, /2020-09-24[\s\S]*18-punjab-kings-2020-ipl-action\.webp/);
  assert.match(source, /2025-07-10[\s\S]*current-chapter-3697\.webp/);
  assert.match(source, /2023-09-10[\s\S]*36-asia-cup-2023-pakistan-111\.webp/);
  assert.match(source, /2026-06-06[\s\S]*21-current-test-century-with-gill\.webp/);
  assert.match(source, /2016-12-16[\s\S]*42-chennai-2016-199-bcci\.jpg/);
  assert.match(source, /2019-07-06[\s\S]*established-india-3649\.webp/);
  assert.match(source, /2023-11-12[\s\S]*02-2019-world-cup-century-celebration\.webp/);
  assert.equal(source.includes("38-current-test-century-back-view.webp"), false);
  assert.equal(source.includes("century-verification"), false);
});

test("Ask KLR answers new verified milestones without impersonation", () => {
  resetAssistantCacheForTests();
  const afghanistan = answerKlrQuestion("Tell me about the Afghanistan 2026 century");
  assert.equal(afghanistan.status, "answered");
  assert.match(afghanistan.answer, /100 from 165 balls/);
  assert.match(afghanistan.answer, /12th Test hundred/);

  const championsTrophy = answerKlrQuestion("What did Rahul do in the 2025 Champions Trophy?");
  assert.equal(championsTrophy.status, "answered");
  assert.match(championsTrophy.answer, /140 runs/);
  assert.match(championsTrophy.answer, /34 not out/);

  const t20i = answerKlrQuestion("When did KL Rahul last play a T20I?");
  assert.match(t20i.answer, /not part of India's title-winning T20 World Cup squads in 2024 or 2026/);

  const tests = answerKlrQuestion("Show his Test centuries");
  assert.equal(tests.evidence.length, 12);
  assert.ok(tests.evidence.every((row) => row.format === "Test"));

  const unsupported = answerKlrQuestion("What did he eat before the match?");
  assert.equal(unsupported.status, "unavailable");
  assert.equal(unsupported.evidence.length, 0);
});

test("all primary navigation targets remain in the composed experience", () => {
  const source = readFileSync(join(root, "components", "archive-experience.tsx"), "utf8");
  for (const id of ["home", "journey", "stats", "centuries", "analytics", "gallery", "ask-klr"]) {
    assert.ok(source.includes(`{ id: "${id}"`), id);
  }
});
