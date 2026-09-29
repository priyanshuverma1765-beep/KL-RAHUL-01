"use client";

import { motion } from "framer-motion";
import { Award, TrendingUp, Zap, Star, Trophy, Target } from "lucide-react";
import { useState } from "react";

const careerRecords = {
  batting: [
    { label: "Highest Score", value: "199", context: "vs England · Test · Chennai · 16 Dec 2016", highlight: true },
    { label: "Total Runs", value: "15,762", context: "Across all formats (2013-2026)" },
    { label: "Career Average", value: "42.49", context: "Overall batting average" },
    { label: "Strike Rate", value: "88.80", context: "Runs per 100 balls" },
    { label: "Total Centuries", value: "28", context: "12 Test, 8 ODI, 2 T20I, 6 IPL" },
    { label: "Total Half-Centuries", value: "108", context: "50+ scores across career" },
  ],
  format: [
    { label: "Test Runs", value: "4,270", context: "69 matches · 36.81 avg · 199 highest", format: "Test" },
    { label: "ODI Runs", value: "3,412", context: "98 matches · 49.45 avg · 112 highest", format: "ODI" },
    { label: "T20I Runs", value: "2,265", context: "72 matches · 37.75 avg · 110 highest", format: "T20I" },
    { label: "IPL Runs", value: "5,815", context: "159 matches · 46.15 avg · 152 highest", format: "IPL" },
  ],
  special: [
    { label: "IPL Orange Cap 2020", value: "670 runs", context: "Most runs in IPL 2020 season · Punjab Kings", icon: "🏆" },
    { label: "Fastest Indian to 2000 T20I Runs", value: "56 innings", context: "Among Indian batters (2026)", icon: "⚡" },
    { label: "Test Debut Century", value: "110", context: "vs Australia · Boxing Day Test · MCG · 26 Dec 2014", icon: "💯" },
    { label: "Highest Indian IPL Score", value: "132*", context: "For wicketkeeper-batter · PBKS vs RCB · 2020", icon: "🔥" },
    { label: "Consecutive IPL 50+ Scores", value: "4 matches", context: "IPL 2018 · Most consecutive fifties that season", icon: "📈" },
    { label: "ODI World Cup 2019", value: "361 runs", context: "4th highest for India · 55.16 average · Opening role", icon: "🌟" },
  ],
  boundaries: [
    { label: "Total Fours", value: "1,472", context: "Across all formats" },
    { label: "Total Sixes", value: "450", context: "Career maximums" },
    { label: "Boundary %", value: "45.8%", context: "Runs scored via boundaries" },
    { label: "Most Sixes (Format)", value: "239", context: "In IPL career" },
  ],
  milestones2026: [
    { label: "Champions Trophy 2025", value: "Winner 🏆", context: "India defeated Pakistan in final · Key contributor", highlight: true },
    { label: "Test Series vs England 2026", value: "2 Centuries", context: "412 runs at 58.85 average" },
    { label: "IPL 2026 Performance", value: "152 HS", context: "Delhi Capitals · Highest individual score of season", highlight: true },
    { label: "T20 World Cup 2024", value: "Winner 🏆", context: "India champions · 242 runs in tournament" },
  ],
};

const categories = [
  { id: "batting", label: "Batting Records", icon: Award },
  { id: "format", label: "Format-Wise", icon: Target },
  { id: "special", label: "Special Achievements", icon: Trophy },
  { id: "boundaries", label: "Boundaries", icon: Zap },
  { id: "milestones2026", label: "2024-2026 Milestones", icon: TrendingUp },
];

export function CareerRecordsSection() {
  const [selected, setSelected] = useState("batting");
  const Icon = categories.find((c) => c.id === selected)?.icon || Award;

  return (
    <section id="records" className="records-section-new">
      <div className="records-container-new">
        <div className="records-header-new">
          <div className="eyebrow">Career Records</div>
          <h2>
            THE <i>RECORD BOOK</i>
          </h2>
          <p>Verified career records and achievements through 26 August 2026</p>
        </div>

        <div className="records-nav-new">
          {categories.map((cat) => {
            const CategoryIcon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                className={`records-nav-btn ${selected === cat.id ? "active" : ""}`}
                onClick={() => setSelected(cat.id)}
              >
                <CategoryIcon size={18} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <motion.div
          key={selected}
          className="records-content-new"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="records-grid-new">
            {(careerRecords[selected as keyof typeof careerRecords] || []).map((record: any, index: number) => (
              <motion.div
                key={record.label}
                className={`record-card-new ${record.highlight ? "highlight" : ""}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {record.icon && <span className="record-icon-new">{record.icon}</span>}
                <div className="record-label-new">{record.label}</div>
                <div className="record-value-new">{record.value}</div>
                <div className="record-context-new">{record.context}</div>
                {record.format && <span className="record-format-badge">{record.format}</span>}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="records-footer-new">
          <p>
            <strong>Data Source:</strong> Official BCCI records, IPL statistics, ICC records, and verified Cricsheet data through 26 August 2026.
          </p>
        </div>
      </div>
    </section>
  );
}
