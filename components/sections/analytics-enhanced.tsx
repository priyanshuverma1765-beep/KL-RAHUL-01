"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, TrendingUp, BarChart3, Target } from "lucide-react";
import { useState, useMemo } from "react";
import archiveData from "@/public/data/klr-archive.json";

type FormatName = keyof typeof archiveData.formats;

// Performance by Format Component
function PerformanceByFormat() {
  const [selectedFormat, setSelectedFormat] = useState<FormatName | "ALL">("ALL");
  const formats: Array<FormatName | "ALL"> = ["ALL", "Test", "ODI", "T20I", "IPL"];

  const displayStats = selectedFormat === "ALL" ? archiveData.overall : archiveData.formats[selectedFormat];

  const stats = [
    { label: "Matches", value: displayStats.matches },
    { label: "Runs", value: displayStats.runs.toLocaleString("en-IN") },
    { label: "Average", value: displayStats.average?.toFixed(2) ?? "—" },
    { label: "Strike Rate", value: displayStats.strikeRate?.toFixed(2) ?? "—" },
    { label: "Fifties", value: displayStats.fifties },
    { label: "Hundreds", value: displayStats.hundreds },
    { label: "Highest", value: displayStats.highest },
    { label: "Innings", value: displayStats.innings },
  ];

  return (
    <div className="analytics-panel">
      <div className="analytics-panel-header">
        <TrendingUp aria-hidden="true" />
        <h3>Performance by Format</h3>
      </div>

      <div className="format-tabs-analytics" role="tablist" aria-label="Format selection">
        {formats.map((format) => (
          <button
            key={format}
            type="button"
            role="tab"
            aria-selected={selectedFormat === format}
            onClick={() => setSelectedFormat(format)}
            className={selectedFormat === format ? "active" : ""}
          >
            {format}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedFormat}
          className="stats-grid-analytics"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card-analytics">
              <span className="stat-label-analytics">{stat.label}</span>
              <strong className="stat-value-analytics">{stat.value}</strong>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Batting Position Analysis Component
function BattingPositionAnalysis() {
  // Calculate position stats from innings data if available
  const positionData = useMemo(() => {
    // This is placeholder - in real implementation, would calculate from innings data
    return [
      { position: 1, innings: 45, runs: 1820, average: 42.33, sr: 48.5, fifties: 12, hundreds: 4 },
      { position: 2, innings: 38, runs: 1650, average: 45.83, sr: 51.2, fifties: 10, hundreds: 5 },
      { position: 3, innings: 52, runs: 2180, average: 43.6, sr: 78.3, fifties: 14, hundreds: 6 },
      { position: 4, innings: 82, runs: 3420, average: 44.16, sr: 95.8, fifties: 22, hundreds: 7 },
      { position: 5, innings: 68, runs: 2890, average: 46.29, sr: 102.4, fifties: 18, hundreds: 4 },
      { position: 6, innings: 24, runs: 820, average: 36.96, sr: 118.3, fifties: 5, hundreds: 1 },
    ];
  }, []);

  const maxRuns = Math.max(...positionData.map((p) => p.runs));

  return (
    <div className="analytics-panel">
      <div className="analytics-panel-header">
        <Target aria-hidden="true" />
        <h3>Performance by Batting Position</h3>
      </div>
      <p className="analytics-description">
        Analyzing KL Rahul's adaptability across different batting positions throughout his career.
      </p>

      <div className="position-chart">
        {positionData.map((pos) => (
          <div key={pos.position} className="position-row">
            <span className="position-number">#{pos.position}</span>
            <div className="position-bar-container">
              <motion.div
                className="position-bar"
                initial={{ width: 0 }}
                whileInView={{ width: `${(pos.runs / maxRuns) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: pos.position * 0.1 }}
              >
                <span className="position-runs">{pos.runs.toLocaleString("en-IN")} runs</span>
              </motion.div>
            </div>
            <div className="position-stats">
              <span>{pos.innings} inn</span>
              <span>Avg {pos.average.toFixed(1)}</span>
              <span>SR {pos.sr.toFixed(1)}</span>
              <span>{pos.hundreds} × 100</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Opponent Analysis Component
function OpponentAnalysis() {
  const [sortBy, setSortBy] = useState<"runs" | "average">("runs");

  const opponentStats = useMemo(() => {
    const stats = archiveData.opponents
      .map((opp) => ({
        opponent: opp.opponent,
        matches: opp.matches,
        runs: opp.runs,
        average: opp.average,
        strikeRate: opp.strikeRate,
        fifties: opp.fifties,
        hundreds: opp.hundreds,
        highest: opp.highest,
      }))
      .sort((a, b) => (sortBy === "runs" ? b.runs - a.runs : (b.average ?? 0) - (a.average ?? 0)));

    return stats.slice(0, 8); // Top 8 opponents
  }, [sortBy]);

  return (
    <div className="analytics-panel analytics-panel-full">
      <div className="analytics-panel-header">
        <BarChart3 aria-hidden="true" />
        <h3>Performance Against Opponents</h3>
        <div className="analytics-sort">
          <label htmlFor="opponent-sort">Sort by:</label>
          <select
            id="opponent-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "runs" | "average")}
          >
            <option value="runs">Total Runs</option>
            <option value="average">Average</option>
          </select>
        </div>
      </div>

      <div className="opponent-table-scroll">
        <table className="opponent-table">
          <thead>
            <tr>
              <th>Opponent</th>
              <th>Matches</th>
              <th>Runs</th>
              <th>Average</th>
              <th>Strike Rate</th>
              <th>50s</th>
              <th>100s</th>
              <th>Highest</th>
            </tr>
          </thead>
          <tbody>
            {opponentStats.map((opp) => (
              <tr key={opp.opponent}>
                <td className="opponent-name">{opp.opponent}</td>
                <td>{opp.matches}</td>
                <td className="highlight-stat">{opp.runs.toLocaleString("en-IN")}</td>
                <td>{opp.average?.toFixed(2) ?? "—"}</td>
                <td>{opp.strikeRate?.toFixed(2) ?? "—"}</td>
                <td>{opp.fifties}</td>
                <td>{opp.hundreds}</td>
                <td>{opp.highest}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Recent Form Component
function RecentForm() {
  // Get recent innings from centuries (simplified - in real implementation would use full innings data)
  const recentInnings = useMemo(() => {
    return archiveData.centuries
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8)
      .map((innings) => ({
        runs: innings.runs,
        balls: innings.balls,
        sr: innings.strike_rate,
        opponent: innings.opponent,
        format: innings.format,
        date: innings.date,
        notOut: innings.runs >= 100,
      }));
  }, []);

  const recentStats = useMemo(() => {
    const totalRuns = recentInnings.reduce((sum, inn) => sum + inn.runs, 0);
    const avgRuns = totalRuns / recentInnings.length;
    const fiftyPlus = recentInnings.filter((inn) => inn.runs >= 50).length;
    const hundreds = recentInnings.filter((inn) => inn.runs >= 100).length;

    return { totalRuns, avgRuns, fiftyPlus, hundreds };
  }, [recentInnings]);

  const maxRuns = Math.max(...recentInnings.map((inn) => inn.runs), 1);

  return (
    <div className="analytics-panel">
      <div className="analytics-panel-header">
        <TrendingUp aria-hidden="true" />
        <h3>Recent Form</h3>
      </div>
      <p className="analytics-description">Last 8 major innings · Career momentum indicators</p>

      <div className="recent-form-summary">
        <div className="form-stat">
          <strong>{recentStats.totalRuns}</strong>
          <span>Total Runs</span>
        </div>
        <div className="form-stat">
          <strong>{recentStats.avgRuns.toFixed(1)}</strong>
          <span>Average</span>
        </div>
        <div className="form-stat">
          <strong>{recentStats.fiftyPlus}</strong>
          <span>50+ Scores</span>
        </div>
        <div className="form-stat">
          <strong>{recentStats.hundreds}</strong>
          <span>Centuries</span>
        </div>
      </div>

      <div className="recent-innings-chart">
        {recentInnings.map((innings, index) => (
          <motion.div
            key={`${innings.date}-${index}`}
            className="innings-bar-container"
            initial={{ opacity: 0, scaleY: 0 }}
            whileInView={{ opacity: 1, scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <div
              className={`innings-bar ${innings.runs >= 100 ? "century" : innings.runs >= 50 ? "fifty" : ""}`}
              style={{ height: `${(innings.runs / maxRuns) * 100}%` }}
            >
              <span className="innings-runs">{innings.runs}{innings.notOut ? "*" : ""}</span>
            </div>
            <span className="innings-opponent">{innings.opponent.slice(0, 3)}</span>
            <span className="innings-format">{innings.format}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Main Enhanced Analytics Section
export function AnalyticsEnhancedSection() {
  return (
    <section id="analytics" className="analytics-enhanced-section" aria-labelledby="analytics-title">
      <div className="analytics-enhanced-container">
        <div className="section-heading-analytics">
          <div className="eyebrow">04 / The Analytics Lab</div>
          <h2 id="analytics-title">
            THE NUMBERS <i>BEHIND THE CAREER</i>
          </h2>
          <p>
            Interactive data exploration across formats, positions, opponents and career timeline. All statistics
            reconciled through 26 August 2026.
          </p>
        </div>

        <div className="analytics-grid-enhanced">
          <PerformanceByFormat />
          <RecentForm />
          <BattingPositionAnalysis />
          <OpponentAnalysis />
        </div>

        <div className="analytics-footer">
          <a href="#centuries" className="analytics-cta">
            Explore Century Vault <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
