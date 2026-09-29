"use client";

import { motion } from "framer-motion";
import { Award, TrendingUp, Zap, Star } from "lucide-react";
import { useMemo, useState } from "react";
import archiveData from "@/public/data/klr-archive.json";

type FormatName = keyof typeof archiveData.formats;

type RecordCategory = {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  records: Record[];
};

type Record = {
  label: string;
  value: string | number;
  context?: string;
  format?: FormatName | "Overall";
};

export function CareerRecordsSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("batting");

  const recordCategories: RecordCategory[] = useMemo(
    () => [
      {
        id: "batting",
        icon: <Award />,
        title: "Batting Records",
        description: "Career-best batting performances",
        records: [
          {
            label: "Highest Score",
            value: archiveData.overall.highest,
            context: "vs England · Test · Chennai 2016",
            format: "Overall",
          },
          {
            label: "Highest Test Score",
            value: archiveData.formats.Test.highest,
            context: "vs England · Chennai · 16 Dec 2016",
            format: "Test",
          },
          {
            label: "Highest ODI Score",
            value: archiveData.formats.ODI.highest,
            context: "vs New Zealand · Bay Oval · 11 Feb 2020",
            format: "ODI",
          },
          {
            label: "Highest T20I Score",
            value: archiveData.formats.T20I.highest,
            context: "vs West Indies · Florida · 27 Aug 2016",
            format: "T20I",
          },
          {
            label: "Highest IPL Score",
            value: archiveData.formats.IPL.highest,
            context: "vs Punjab Kings · Delhi Capitals · 25 Apr 2026",
            format: "IPL",
          },
        ],
      },
      {
        id: "milestones",
        icon: <TrendingUp />,
        title: "Career Milestones",
        description: "Major career achievements",
        records: [
          {
            label: "Total Runs",
            value: archiveData.overall.runs.toLocaleString("en-IN"),
            context: "Across all formats",
            format: "Overall",
          },
          {
            label: "Total Centuries",
            value: archiveData.overall.hundreds,
            context: `${archiveData.formats.Test.hundreds} Test, ${archiveData.formats.ODI.hundreds} ODI, ${archiveData.formats.T20I.hundreds} T20I, ${archiveData.formats.IPL.hundreds} IPL`,
            format: "Overall",
          },
          {
            label: "Total Half-Centuries",
            value: archiveData.overall.fifties,
            context: "50+ scores across career",
            format: "Overall",
          },
          {
            label: "Total Matches",
            value: archiveData.overall.matches,
            context: `${archiveData.coverage.innings} regulation innings`,
            format: "Overall",
          },
          {
            label: "Career Average",
            value: archiveData.overall.average.toFixed(2),
            context: "Overall batting average",
            format: "Overall",
          },
          {
            label: "Career Strike Rate",
            value: archiveData.overall.strikeRate.toFixed(2),
            context: "Runs per 100 balls",
            format: "Overall",
          },
        ],
      },
      {
        id: "format-best",
        icon: <Zap />,
        title: "Format-Specific Records",
        description: "Best performances in each format",
        records: [
          {
            label: "Best Test Average",
            value: archiveData.formats.Test.average?.toFixed(2) ?? "—",
            context: `${archiveData.formats.Test.runs.toLocaleString("en-IN")} runs in ${archiveData.formats.Test.innings} innings`,
            format: "Test",
          },
          {
            label: "Best ODI Average",
            value: archiveData.formats.ODI.average?.toFixed(2) ?? "—",
            context: `${archiveData.formats.ODI.runs.toLocaleString("en-IN")} runs in ${archiveData.formats.ODI.innings} innings`,
            format: "ODI",
          },
          {
            label: "Best IPL Average",
            value: archiveData.formats.IPL.average?.toFixed(2) ?? "—",
            context: `${archiveData.formats.IPL.runs.toLocaleString("en-IN")} runs in ${archiveData.formats.IPL.innings} innings`,
            format: "IPL",
          },
          {
            label: "Fastest T20I Strike Rate",
            value: archiveData.formats.T20I.strikeRate?.toFixed(2) ?? "—",
            context: `${archiveData.formats.T20I.runs.toLocaleString("en-IN")} runs at pace`,
            format: "T20I",
          },
          {
            label: "Most IPL Runs (Season)",
            value: "670",
            context: "Orange Cap winner · Punjab Kings · IPL 2020",
            format: "IPL",
          },
        ],
      },
      {
        id: "boundaries",
        icon: <Star />,
        title: "Boundary Records",
        description: "Fours and sixes throughout career",
        records: [
          {
            label: "Total Fours",
            value: archiveData.overall.fours.toLocaleString("en-IN"),
            context: "Across all formats",
            format: "Overall",
          },
          {
            label: "Total Sixes",
            value: archiveData.overall.sixes.toLocaleString("en-IN"),
            context: "Career maximums",
            format: "Overall",
          },
          {
            label: "Most Sixes (Format)",
            value: archiveData.formats.IPL.sixes,
            context: "In IPL career",
            format: "IPL",
          },
          {
            label: "Boundary Percentage",
            value: `${(((archiveData.overall.fours * 4 + archiveData.overall.sixes * 6) / archiveData.overall.runs) * 100).toFixed(1)}%`,
            context: "Runs from boundaries",
            format: "Overall",
          },
        ],
      },
    ],
    []
  );

  const selectedRecords = recordCategories.find((cat) => cat.id === selectedCategory) || recordCategories[0];

  return (
    <section id="records" className="career-records-section" aria-labelledby="records-title">
      <div className="career-records-container">
        <div className="section-heading-records">
          <div className="eyebrow">Career Records</div>
          <h2 id="records-title">
            THE <i>RECORD BOOK</i>
          </h2>
          <p>
            Verified career records and milestones across formats. All statistics reconciled through 26 August 2026.
          </p>
        </div>

        <div className="records-category-tabs">
          {recordCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`category-tab ${selectedCategory === category.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(category.id)}
              aria-pressed={selectedCategory === category.id}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-title">{category.title}</span>
            </button>
          ))}
        </div>

        <motion.div
          key={selectedCategory}
          className="records-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h3>{selectedRecords.title}</h3>
          <p className="records-description">{selectedRecords.description}</p>

          <div className="records-grid">
            {selectedRecords.records.map((record, index) => (
              <motion.div
                key={record.label}
                className="record-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <span className="record-label">{record.label}</span>
                <strong className="record-value">{record.value}</strong>
                {record.context && <p className="record-context">{record.context}</p>}
                {record.format && <span className="record-format">{record.format}</span>}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
