"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Calendar, MapPin, Trophy, TrendingUp, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import archiveData from "@/public/data/klr-archive.json";

type FormatName = keyof typeof archiveData.formats;

type MatchInning = {
  date: string;
  format: FormatName | "IPL";
  opponent: string;
  venue: string;
  runs: number;
  balls: number;
  strike_rate: number;
  result: string;
  fours?: number;
  sixes?: number;
  dismissal?: string;
  batting_position?: number;
};

export function MatchExplorerSection() {
  const [selectedFormat, setSelectedFormat] = useState<FormatName | "IPL" | "ALL">("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);

  // Get ALL innings from the data
  const allInnings = useMemo<MatchInning[]>(() => {
    const innings: MatchInning[] = [];

    // Get centuries
    archiveData.centuries.forEach((century) => {
      innings.push({
        date: century.date,
        format: century.format as FormatName | "IPL",
        opponent: century.opponent,
        venue: century.venue,
        runs: century.runs,
        balls: century.balls,
        strike_rate: century.strike_rate,
        result: century.result,
        fours: century.fours,
        sixes: century.sixes,
        dismissal: century.dismissal_kind,
        batting_position: century.batting_position,
      });
    });

    return innings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  const years = useMemo(() => {
    const yearSet = new Set(allInnings.map((m) => m.date.split("-")[0]));
    return ["ALL", ...Array.from(yearSet).sort().reverse()];
  }, [allInnings]);

  const filteredInnings = useMemo(() => {
    return allInnings.filter((innings) => {
      const formatMatch = selectedFormat === "ALL" || innings.format === selectedFormat;
      const yearMatch = selectedYear === "ALL" || innings.date.startsWith(selectedYear);
      const searchMatch =
        searchQuery === "" ||
        innings.opponent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        innings.venue.toLowerCase().includes(searchQuery.toLowerCase());

      return formatMatch && yearMatch && searchMatch;
    });
  }, [allInnings, selectedFormat, selectedYear, searchQuery]);

  const visibleInnings = filteredInnings.slice(0, visibleCount);

  const formatDate = (date: string) => {
    return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const getResultColor = (result: string) => {
    if (result === "win") return "result-win";
    if (result === "loss") return "result-loss";
    return "result-draw";
  };

  const getResultLabel = (result: string) => {
    if (result === "win") return "Won";
    if (result === "loss") return "Lost";
    if (result === "no_result") return "No Result";
    return "Draw";
  };

  return (
    <section id="matches" className="match-explorer-new" aria-labelledby="matches-title">
      <div className="match-explorer-container-new">
        <div className="match-explorer-header">
          <div className="eyebrow">Match Explorer</div>
          <h2 id="matches-title">
            EVERY <i>INNINGS</i>
          </h2>
          <p>
            Explore KL Rahul's career innings by innings. {allInnings.length} documented performances across all formats.
          </p>
        </div>

        <div className="match-filters-new">
          <div className="filter-search-new">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search by opponent or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search matches"
            />
          </div>

          <div className="filter-formats-new">
            {(["ALL", "Test", "ODI", "T20I", "IPL"] as const).map((format) => (
              <button
                key={format}
                type="button"
                className={`format-filter-btn ${selectedFormat === format ? "active" : ""}`}
                onClick={() => setSelectedFormat(format)}
              >
                {format}
              </button>
            ))}
          </div>

          <div className="filter-year-new">
            <Calendar size={16} />
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year === "ALL" ? "All Years" : year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="match-results-info">
          <span>Showing {visibleInnings.length} of {filteredInnings.length} innings</span>
        </div>

        <div className="match-grid-new">
          <AnimatePresence mode="popLayout">
            {visibleInnings.map((innings, index) => (
              <motion.div
                key={`${innings.date}-${innings.opponent}-${innings.runs}`}
                className="match-card-new"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
              >
                <div className="match-card-header">
                  <span className={`match-format-badge ${innings.format.toLowerCase()}`}>
                    {innings.format}
                  </span>
                  <span className={`match-result-badge ${getResultColor(innings.result)}`}>
                    {getResultLabel(innings.result)}
                  </span>
                </div>

                <div className="match-card-score">
                  <div className="runs-display">
                    {innings.runs}
                    {innings.dismissal === "not out" && "*"}
                  </div>
                  <div className="balls-display">({innings.balls})</div>
                </div>

                <div className="match-card-stats">
                  <div className="stat-item">
                    <span className="stat-label">SR</span>
                    <span className="stat-value">{innings.strike_rate.toFixed(1)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">4s</span>
                    <span className="stat-value">{innings.fours || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">6s</span>
                    <span className="stat-value">{innings.sixes || 0}</span>
                  </div>
                </div>

                <div className="match-card-details">
                  <div className="match-opponent">
                    <Trophy size={14} />
                    vs {innings.opponent}
                  </div>
                  <div className="match-venue">
                    <MapPin size={14} />
                    {innings.venue.split(",")[0]}
                  </div>
                  <div className="match-date">
                    <Calendar size={14} />
                    {formatDate(innings.date)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {visibleInnings.length < filteredInnings.length && (
          <div className="match-load-more">
            <button
              type="button"
              className="load-more-btn"
              onClick={() => setVisibleCount((prev) => prev + 20)}
            >
              Load More Innings
              <TrendingUp size={18} />
            </button>
          </div>
        )}

        {filteredInnings.length === 0 && (
          <div className="no-results">
            <AlertCircle size={48} />
            <p>No innings found matching your filters</p>
          </div>
        )}
      </div>
    </section>
  );
}
