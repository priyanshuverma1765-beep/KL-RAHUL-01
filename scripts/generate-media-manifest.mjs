import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, "data", "asset-manifest.csv");
const destination = resolve(root, "data", "media.generated.json");

function parseCsvLine(line) {
  const fields = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += character;
    }
  }

  fields.push(field);
  return fields;
}

const categoryMeta = {
  "01_early_career": {
    index: "01",
    label: "Early career",
    shortLabel: "Early career",
    title: "A game begins",
    body: "The foundations: Karnataka cricket, first-class experience and the work before the international stage.",
  },
  "02_india_breakthrough": {
    index: "02",
    label: "India breakthrough",
    shortLabel: "Breakthrough",
    title: "The first step",
    body: "An international career takes shape through red-ball patience and a growing multi-format range.",
  },
  "03_established_india": {
    index: "03",
    label: "Established India career",
    shortLabel: "Established India",
    title: "No single shape",
    body: "Opening, adapting and moving between formats as his role continued to expand.",
  },
  "04_captaincy_and_lsg": {
    index: "04",
    label: "Captaincy and LSG",
    shortLabel: "Captaincy & LSG",
    title: "Leading from the front",
    body: "A chapter shaped by responsibility, franchise leadership and the demands of the top order.",
  },
  "05_comeback_and_world_cup": {
    index: "05",
    label: "Comeback and World Cup",
    shortLabel: "Comeback",
    title: "A role reinvented",
    body: "A return built around middle-order control, wicketkeeping and another change of role.",
  },
  "06_current_chapter": {
    index: "06",
    label: "Current chapter",
    shortLabel: "Current chapter",
    title: "Still becoming",
    body: "The archive remains open: another phase of adaptation, experience and technical renewal.",
  },
};

const journeyRepresentativeIds = new Set([3623, 3633, 3643, 3663, 3677, 3698]);
const lines = readFileSync(source, "utf8").trim().split(/\r?\n/);
const headers = parseCsvLine(lines.shift());
const rows = lines.map((line) => {
  const values = parseCsvLine(line);
  return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
});

function publicPath(packPath) {
  return packPath.replace("02_web_ready", "/images/rahul/archive");
}

const gallery = rows.map((row, index) => {
  const [width, height] = row.original_dimensions.split("x").map(Number);
  const era = categoryMeta[row.category];
  return {
    id: Number(row.asset_id),
    index: index + 1,
    category: row.category,
    era: era.label,
    shortEra: era.shortLabel,
    src: publicPath(row.gallery_webp),
    width,
    height,
    alt: `KL Rahul — ${era.label.toLowerCase()} archive image`,
  };
});

const journey = rows
  .filter((row) => journeyRepresentativeIds.has(Number(row.asset_id)))
  .sort((left, right) => left.category.localeCompare(right.category))
  .map((row) => ({
    id: Number(row.asset_id),
    category: row.category,
    src: publicPath(row.journey_card_webp),
    ...categoryMeta[row.category],
  }));

const centuries = rows
  .filter((row) => row.century_vault_webp)
  .map((row, index) => ({
    id: Number(row.asset_id),
    index,
    category: row.category,
    era: categoryMeta[row.category].label,
    src: publicPath(row.century_vault_webp),
    width: 1920,
    height: 1080,
  }));

const media = {
  generatedFrom: "data/asset-manifest.csv",
  journey,
  centuries,
  gallery,
  categories: Object.entries(categoryMeta).map(([id, meta]) => ({ id, ...meta })),
  backgrounds: {
    journey: "/images/rahul/archive/backgrounds/kl-rahul-early-career-3627-4k.webp",
    analytics: "/images/rahul/archive/backgrounds/kl-rahul-comeback-and-world-cup-3677-4k.webp",
    finale: "/images/rahul/archive/backgrounds/kl-rahul-current-chapter-3698-4k.webp",
  },
};

writeFileSync(destination, `${JSON.stringify(media, null, 2)}\n`, "utf8");
console.log(`Generated ${destination} (${journey.length} journey, ${centuries.length} century, ${gallery.length} gallery assets).`);
