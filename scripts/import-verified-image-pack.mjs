import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = process.cwd();
const pack = resolve(root, "_verified_image_pack", "KL_Rahul_Verified_Image_Pack");
const csvPath = join(pack, "verified-image-manifest.csv");
const enhancedDir = join(pack, "02_enhanced_web");
const publicDir = join(root, "public", "images", "rahul", "verified");
const outputPath = join(root, "data", "verified-image-manifest.json");

function parseCsv(input) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [headers, ...values] = rows;
  return values.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

function galleryFilters(item) {
  const haystack = `${item.category} ${item.era_or_event} ${item.enhanced_web_file}`.toLowerCase();
  const filters = [];
  if (item.category.startsWith("International")) filters.push("International");
  if (haystack.includes("test")) filters.push("Test");
  if (haystack.includes("odi") || haystack.includes("champions trophy") || haystack.includes("world cup 2023")) filters.push("ODI");
  if (haystack.includes("t20i") || haystack.includes("t20 world cup")) filters.push("T20I");
  if (item.category.startsWith("IPL")) filters.push("IPL");
  if (haystack.includes("rcb")) filters.push("RCB");
  if (haystack.includes("punjab")) filters.push("Punjab Kings");
  if (haystack.includes("lucknow") || haystack.includes("lsg")) filters.push("LSG");
  if (haystack.includes("delhi capitals") || haystack.includes("dc-")) filters.push("Delhi Capitals");
  if (item.category.startsWith("Domestic") || item.category.startsWith("Early Career")) filters.push("Domestic/Early Career");
  if (haystack.includes("wicketkeep")) filters.push("Wicketkeeping");
  if (/century|celebration|troph|bat-raise|helmet-kiss|ear-celebration|awards/.test(haystack)) filters.push("Centuries/Celebrations");
  if (item.category.startsWith("Off Field")) filters.push("Off Field");
  return [...new Set(filters)];
}

if (!existsSync(csvPath)) throw new Error(`Verified manifest not found at ${csvPath}`);
mkdirSync(publicDir, { recursive: true });

const curated = ["04", "30", "13", "25", "18", "35", "36", "31", "33", "34"];
const records = parseCsv(readFileSync(csvPath, "utf8"))
  .map((item) => {
    if (item.id === "38") {
      item = {
        ...item,
        category: "International/ODI",
        era_or_event: "India limited-overs bat raise",
        verification_level: "format/team verified; exact event unverified",
        correct_website_use: "Gallery International/ODI; general India limited-overs context",
        must_not_use_for: "Do not use for Test, red-ball, Afghanistan 2026 or an exact century claim",
      };
    }
    const [width, height] = item.dimensions.split("x").map(Number);
    const source = join(enhancedDir, item.enhanced_web_file);
    const publicFile = item.id === "38" ? "38-india-limited-overs-bat-raise.webp" : item.enhanced_web_file;
    const destination = join(publicDir, publicFile);
    if (!existsSync(source)) throw new Error(`Missing enhanced asset: ${source}`);
    copyFileSync(source, destination);
    return {
      ...item,
      id: `verified-${item.id}`,
      width,
      height,
      max_recommended_css_width_px: Number(item.max_recommended_css_width_px),
      public_path: `/images/rahul/verified/${publicFile}`,
      gallery_filters: galleryFilters(item),
      caption: item.era_or_event,
      alt: `KL Rahul — ${item.era_or_event}`,
      source_collection: "KL Rahul Verified Image Pack",
    };
  })
  .sort((left, right) => {
    const leftRank = curated.indexOf(left.id.replace("verified-", ""));
    const rightRank = curated.indexOf(right.id.replace("verified-", ""));
    if (leftRank >= 0 || rightRank >= 0) return (leftRank < 0 ? 999 : leftRank) - (rightRank < 0 ? 999 : rightRank);
    return left.id.localeCompare(right.id);
  });

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify({ generatedAt: "2026-08-26", source: "verified-image-manifest.csv", records }, null, 2)}\n`);
console.log(`Imported ${records.length} verified images to ${publicDir}`);
console.log(`Generated ${outputPath}`);
