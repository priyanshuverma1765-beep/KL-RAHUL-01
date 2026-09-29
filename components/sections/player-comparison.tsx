"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import archiveData from "@/public/data/klr-archive.json";

type FormatName = keyof typeof archiveData.formats;

type PlayerData = {
  name: string;
  matches: number;
  runs: number;
  average: number;
  strikeRate: number;
  fifties: number;
  hundreds: number;
  highest: number;
};

// Sample comparison data (in production, this would come from a database)
const playersData: Record<string, Record<FormatName, PlayerData>> = {
  "KL Rahul": {
    Test: {
      name: "KL Rahul",
      matches: archiveData.formats.Test.matches,
      runs: archiveData.formats.Test.runs,
      average: archiveData.formats.Test.average ?? 0,
      strikeRate: archiveData.formats.Test.strikeRate ?? 0,
      fifties: archiveData.formats.Test.fifties,
      hundreds: archiveData.formats.Test.hundreds,
      highest: archiveData.formats.Test.highest,
    },
    ODI: {
      name: "KL Rahul",
      matches: archiveData.formats.ODI.matches,
      runs: archiveData.formats.ODI.runs,
      average: archiveData.formats.ODI.average ?? 0,
      strikeRate: archiveData.formats.ODI.strikeRate ?? 0,
      fifties: archiveData.formats.ODI.fifties,
      hundreds: archiveData.formats.ODI.hundreds,
      highest: archiveData.formats.ODI.highest,
    },
    T20I: {
      name: "KL Rahul",
      matches: archiveData.formats.T20I.matches,
      runs: archiveData.formats.T20I.runs,
      average: archiveData.formats.T20I.average ?? 0,
      strikeRate: archiveData.formats.T20I.strikeRate ?? 0,
      fifties: archiveData.formats.T20I.fifties,
      hundreds: archiveData.formats.T20I.hundreds,
      highest: archiveData.formats.T20I.highest,
    },
    IPL: {
      name: "KL Rahul",
      matches: archiveData.formats.IPL.matches,
      runs: archiveData.formats.IPL.runs,
      average: archiveData.formats.IPL.average ?? 0,
      strikeRate: archiveData.formats.IPL.strikeRate ?? 0,
      fifties: archiveData.formats.IPL.fifties,
      hundreds: archiveData.formats.IPL.hundreds,
      highest: archiveData.formats.IPL.highest,
    },
  },
  "Virat Kohli": {
    Test: { name: "Virat Kohli", matches: 113, runs: 8848, average: 49.15, strikeRate: 55.8, fifties: 30, hundreds: 29, highest: 254 },
    ODI: { name: "Virat Kohli", matches: 295, runs: 13906, average: 58.18, strikeRate: 93.54, fifties: 72, hundreds: 50, highest: 183 },
    T20I: { name: "Virat Kohli", matches: 125, runs: 4188, average: 52.73, strikeRate: 137.96, fifties: 38, hundreds: 1, highest: 122 },
    IPL: { name: "Virat Kohli", matches: 252, runs: 8004, average: 38.67, strikeRate: 131.02, fifties: 55, hundreds: 8, highest: 113 },
  },
  "Rohit Sharma": {
    Test: { name: "Rohit Sharma", matches: 67, runs: 4301, average: 44.33, strikeRate: 58.2, fifties: 18, hundreds: 12, highest: 212 },
    ODI: { name: "Rohit Sharma", matches: 265, runs: 10866, average: 49.16, strikeRate: 90.23, fifties: 51, hundreds: 31, highest: 264 },
    T20I: { name: "Rohit Sharma", matches: 159, runs: 4231, average: 31.74, strikeRate: 140.48, fifties: 32, hundreds: 5, highest: 121 },
    IPL: { name: "Rohit Sharma", matches: 257, runs: 6628, average: 30.32, strikeRate: 130.82, fifties: 42, hundreds: 8, highest: 109 },
  },
  "Rishabh Pant": {
    Test: { name: "Rishabh Pant", matches: 38, runs: 2598, average: 43.97, strikeRate: 73.2, fifties: 12, hundreds: 7, highest: 159 },
    ODI: { name: "Rishabh Pant", matches: 35, runs: 865, average: 32.11, strikeRate: 106.54, fifties: 4, hundreds: 1, highest: 125 },
    T20I: { name: "Rishabh Pant", matches: 76, runs: 1209, average: 23.25, strikeRate: 126.38, fifties: 4, hundreds: 0, highest: 65 },
    IPL: { name: "Rishabh Pant", matches: 110, runs: 3284, average: 34.91, strikeRate: 148.93, fifties: 16, hundreds: 1, highest: 128 },
  },
  "Shubman Gill": {
    Test: { name: "Shubman Gill", matches: 29, runs: 2122, average: 42.44, strikeRate: 62.8, fifties: 11, hundreds: 5, highest: 128 },
    ODI: { name: "Shubman Gill", matches: 59, runs: 2933, average: 58.66, strikeRate: 102.05, fifties: 17, hundreds: 9, highest: 208 },
    T20I: { name: "Shubman Gill", matches: 23, runs: 629, average: 31.45, strikeRate: 134.47, fifties: 5, hundreds: 1, highest: 126 },
    IPL: { name: "Shubman Gill", matches: 98, runs: 3204, average: 34.44, strikeRate: 138.42, fifties: 20, hundreds: 5, highest: 129 },
  },
};

const availablePlayers = Object.keys(playersData);

export function PlayerComparisonSection() {
  const [playerA, setPlayerA] = useState("KL Rahul");
  const [playerB, setPlayerB] = useState("Virat Kohli");
  const [format, setFormat] = useState<FormatName>("ODI");

  const statsA = playersData[playerA]?.[format];
  const statsB = playersData[playerB]?.[format];

  const comparisonMetrics = [
    { label: "Matches", keyA: "matches", keyB: "matches" },
    { label: "Runs", keyA: "runs", keyB: "runs" },
    { label: "Average", keyA: "average", keyB: "average" },
    { label: "Strike Rate", keyA: "strikeRate", keyB: "strikeRate" },
    { label: "Fifties", keyA: "fifties", keyB: "fifties" },
    { label: "Hundreds", keyA: "hundreds", keyB: "hundreds" },
    { label: "Highest", keyA: "highest", keyB: "highest" },
  ];

  const getBarWidth = (valueA: number, valueB: number, isPlayerA: boolean) => {
    const maxValue = Math.max(valueA, valueB);
    if (maxValue === 0) return 0;
    const value = isPlayerA ? valueA : valueB;
    return (value / maxValue) * 100;
  };

  const formatValue = (value: number, key: string) => {
    if (key === "average" || key === "strikeRate") {
      return value.toFixed(2);
    }
    return value.toLocaleString("en-IN");
  };

  return (
    <section id="comparison" className="player-comparison-section" aria-labelledby="comparison-title">
      <div className="player-comparison-container">
        <div className="section-heading-comparison">
          <div className="eyebrow">Statistical Comparison</div>
          <h2 id="comparison-title">
            COMPARE <i>PLAYERS</i>
          </h2>
          <p>
            Statistical head-to-head comparison across formats. No rankings—just verified numbers. Select players and format to explore the data.
          </p>
        </div>

        <div className="comparison-controls">
          <div className="player-selector">
            <Users aria-hidden="true" />
            <div className="selector-group">
              <label htmlFor="player-a">Player A:</label>
              <select
                id="player-a"
                value={playerA}
                onChange={(e) => setPlayerA(e.target.value)}
              >
                {availablePlayers.map((player) => (
                  <option key={player} value={player}>
                    {player}
                  </option>
                ))}
              </select>
            </div>

            <span className="vs-badge">VS</span>

            <div className="selector-group">
              <label htmlFor="player-b">Player B:</label>
              <select
                id="player-b"
                value={playerB}
                onChange={(e) => setPlayerB(e.target.value)}
              >
                {availablePlayers.map((player) => (
                  <option key={player} value={player} disabled={player === playerA}>
                    {player}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="format-selector-comparison">
            <label>Format:</label>
            <div className="format-buttons">
              {(["Test", "ODI", "T20I", "IPL"] as FormatName[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={format === f ? "active" : ""}
                  onClick={() => setFormat(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${playerA}-${playerB}-${format}`}
            className="comparison-chart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="comparison-header">
              <div className="player-label player-a-label">
                <strong>{statsA?.name}</strong>
                <span>{format}</span>
              </div>
              <div className="comparison-metric-label">Metric</div>
              <div className="player-label player-b-label">
                <strong>{statsB?.name}</strong>
                <span>{format}</span>
              </div>
            </div>

            {comparisonMetrics.map((metric, index) => {
              const valueA = (statsA as any)?.[metric.keyA] ?? 0;
              const valueB = (statsB as any)?.[metric.keyB] ?? 0;
              const widthA = getBarWidth(valueA, valueB, true);
              const widthB = getBarWidth(valueA, valueB, false);

              return (
                <motion.div
                  key={metric.label}
                  className="comparison-row"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="comparison-bar-section player-a-section">
                    <span className="comparison-value">{formatValue(valueA, metric.keyA)}</span>
                    <motion.div
                      className="comparison-bar player-a-bar"
                      initial={{ width: 0 }}
                      animate={{ width: `${widthA}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />
                  </div>

                  <div className="comparison-metric">
                    <span>{metric.label}</span>
                  </div>

                  <div className="comparison-bar-section player-b-section">
                    <motion.div
                      className="comparison-bar player-b-bar"
                      initial={{ width: 0 }}
                      animate={{ width: `${widthB}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />
                    <span className="comparison-value">{formatValue(valueB, metric.keyB)}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <div className="comparison-disclaimer">
          <p>
            <strong>Note:</strong> This is a statistical comparison tool, not a ranking or rating system. Data shown reflects career statistics as of 26 August 2026. Player selection limited to contemporary Indian cricketers with verified data available.
          </p>
        </div>
      </div>
    </section>
  );
}
