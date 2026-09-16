import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const original = JSON.parse(readFileSync(join(root, "data", "image-manifest.generated.json"), "utf8"));
const supplemental = JSON.parse(readFileSync(join(root, "data", "verified-image-manifest.json"), "utf8"));

const franchises = new Set(["RCB", "Punjab Kings", "LSG", "Delhi Capitals"]);
const normalizeCategory = (value) => value
  .replace("Domestic and Early Career", "Domestic/Early Career")
  .replace("Centuries and Celebrations", "Centuries/Celebrations");

function restrictionsFor(formats, teams, franchise, exact) {
  const restrictions = [];
  if (franchise.length) restrictions.push(`Do not use for another IPL franchise or an India match`);
  if (formats.includes("Test")) restrictions.push("Do not use for ODI, T20I or IPL stories");
  if (formats.some((format) => /ODI|limited overs/i.test(format))) restrictions.push("Do not use for Test or IPL stories");
  if (formats.includes("T20I")) restrictions.push("Do not use for Test, ODI or IPL stories");
  if (teams.includes("Karnataka")) restrictions.push("Do not use for an India or IPL match claim");
  if (!exact) restrictions.push("Do not attach to an exact match or innings without independent verification");
  return restrictions;
}

const excludedOriginalIds = new Map([
  ["old-38", { duplicateOf: "original-pack-3639", reason: "Same frame as pack-3639; the higher-resolution original-pack file is retained." }],
  ["old-14", { duplicateOf: "supplemental-04", reason: "Same Champions Trophy 2025 frame; supplemental-04 is the sharper 1280×720 copy." }],
]);

const originalRecords = original.records
  .filter((item) => !excludedOriginalIds.has(item.id))
  .map((item) => {
    const isWedding = item.id === "old-01";
    const teamFranchise = item.team_franchise ?? [];
    const franchise = teamFranchise.filter((value) => franchises.has(value));
    const team = teamFranchise.filter((value) => !franchises.has(value));
    const galleryCategories = [...new Set((item.gallery_filters ?? []).map(normalizeCategory))];
    const eventVerified = isWedding || Boolean(item.event_verified);
    return {
      id: `original-${item.id}`,
      originalFilename: item.filename,
      currentPath: item.public_path,
      collectionSource: "original-119",
      team,
      format: item.format ?? [],
      franchise,
      approximateYearEra: isWedding ? "23 January 2023 · wedding in Khandala" : item.approximate_career_period,
      eventOrMatch: isWedding ? "Marriage to Athiya Shetty · Khandala · 23 January 2023" : item.match_event,
      eventVerified,
      galleryCategories,
      suitableWebsitePlacements: isWedding ? ["Journey wedding chapter", "Gallery Off Field"] : item.recommended_sections?.length ? item.recommended_sections : ["Gallery"],
      mustNotUseFor: isWedding ? ["Do not use for a cricket match, tournament or sporting milestone"] : restrictionsFor(item.format ?? [], team, franchise, eventVerified),
      verificationConfidence: isWedding ? "exact wedding context verified" : eventVerified ? "exact-event verified" : item.notes?.includes("visual context") ? "visual context only" : "team/format/era verified",
      width: item.width,
      height: item.height,
      caption: isWedding ? "KL Rahul and Athiya Shetty · wedding ceremony" : item.caption,
      sourcePath: item.source_path,
    };
  });

function supplementalContext(item) {
  const category = item.category;
  const team = [];
  const franchise = [];
  const format = [];
  if (category.startsWith("International")) team.push("India");
  if (category.startsWith("Domestic")) { team.push("Karnataka"); format.push("Domestic"); }
  if (category.includes("/Test")) format.push("Test");
  if (category.includes("/ODI") || category.includes("Champions Trophy")) format.push("ODI");
  if (category.includes("/T20I")) format.push("T20I");
  if (category.startsWith("IPL")) {
    format.push("IPL");
    for (const name of franchises) if (category.includes(name)) franchise.push(name);
  }
  if (!format.length && category.startsWith("International")) format.push("International limited overs");
  return { team, franchise, format };
}

const supplementalRecords = supplemental.records.map((item) => {
  const { team, franchise, format } = supplementalContext(item);
  const eventVerified = /exact event verified/.test(item.verification_level);
  const galleryCategories = item.id === "verified-38"
    ? ["International", "ODI", "Centuries/Celebrations"]
    : item.gallery_filters.map(normalizeCategory);
  return {
    id: `supplemental-${item.id.replace("verified-", "")}`,
    originalFilename: item.original_filename,
    currentPath: item.public_path,
    collectionSource: "supplemental-41",
    team,
    format,
    franchise,
    approximateYearEra: item.era_or_event,
    eventOrMatch: eventVerified ? item.era_or_event : "Unverified — era/team/format context only",
    eventVerified,
    galleryCategories,
    suitableWebsitePlacements: item.correct_website_use.split(";").map((value) => value.trim()).filter(Boolean),
    mustNotUseFor: item.must_not_use_for.split(";").map((value) => value.trim()).filter(Boolean),
    verificationConfidence: item.verification_level,
    width: item.width,
    height: item.height,
    maxRecommendedCssWidthPx: item.max_recommended_css_width_px,
    caption: item.caption,
    sourcePath: `_verified_image_pack/KL_Rahul_Verified_Image_Pack/02_enhanced_web/${item.enhanced_web_file}`,
  };
});

const allRecords = [...originalRecords, ...supplementalRecords];
const curated = [
  "supplemental-04", "original-pack-3627", "original-pack-3654", "supplemental-14", "original-pack-3674",
  "supplemental-30", "original-pack-3664", "supplemental-36", "original-pack-3687", "supplemental-35",
];
allRecords.sort((left, right) => {
  const a = curated.indexOf(left.id);
  const b = curated.indexOf(right.id);
  if (a >= 0 || b >= 0) return (a < 0 ? 999 : a) - (b < 0 ? 999 : b);
  if (left.collectionSource !== right.collectionSource) return left.collectionSource.localeCompare(right.collectionSource);
  return left.id.localeCompare(right.id, undefined, { numeric: true });
});

const output = {
  generatedAt: "2026-08-27",
  sources: {
    originalRecovered: 119,
    supplementalRecovered: 41,
    sameFrameDuplicatesExcluded: 2,
    combinedValidUnique: allRecords.length,
  },
  excludedDuplicates: [...excludedOriginalIds].map(([id, detail]) => ({ id: `original-${id}`, ...detail })),
  records: allRecords,
};

if (output.sources.combinedValidUnique !== 158) throw new Error(`Expected 158 unique images, found ${output.sources.combinedValidUnique}`);
if (new Set(allRecords.map((item) => item.id)).size !== allRecords.length) throw new Error("Duplicate merged image IDs detected");
writeFileSync(join(root, "data", "merged-image-manifest.json"), `${JSON.stringify(output, null, 2)}\n`);
const csvColumns = [
  "id", "originalFilename", "currentPath", "collectionSource", "team", "format", "franchise",
  "approximateYearEra", "eventOrMatch", "eventVerified", "galleryCategories",
  "suitableWebsitePlacements", "mustNotUseFor", "verificationConfidence", "width", "height", "sourcePath",
];
const csvEscape = (value) => `"${String(Array.isArray(value) ? value.join(" | ") : value ?? "").replaceAll('"', '""')}"`;
const csv = [csvColumns.join(","), ...allRecords.map((item) => csvColumns.map((column) => csvEscape(item[column])).join(","))].join("\n");
writeFileSync(join(root, "data", "merged-image-manifest.csv"), `${csv}\n`);
console.log(JSON.stringify(output.sources, null, 2));
