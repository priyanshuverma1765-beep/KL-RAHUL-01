"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Calendar, MapPin, Trophy, ChevronRight } from "lucide-react";
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
  notOut?: boolean;
};

export function MatchExplorerSection() {
  const [selectedFormat, setSelectedFormat] = useState<FormatName | "IPL" | "ALL">("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

  // Extract match data from centuries (in real app, would use full innings dataset)
  const matches = useMemo<MatchInning[]>(() => {
    return archiveData.centuries.map((century) => ({
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
      notOut: century.runs >= 100,
    }));
  }, []);

  const years = useMemo(() => {
    const yearSet = new Set(matches.map((m) => m.date.split("-")[0]));
    return ["ALL", ...Array.from(yearSet).sort().reverse()];
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const formatMatch = selectedFormat === "ALL" || match.format === selectedFormat;
      const yearMatch = selectedYear === "ALL" || match.date.startsWith(selectedYear);
      const searchMatch =
        searchQuery === "" ||
        match.opponent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.venue.toLowerCase().includes(searchQuery.toLowerCase());

      return formatMatch && yearMatch && searchMatch;
    });
  }, [matches, selectedFormat, selectedYear, searchQuery]);

  const visibleMatches = filteredMatches.slice(0, visibleCount);

  const formatDate = (date: string) => {
    return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <section id="matches" className="match-explorer-section" aria-labelledby="matches-title">
      <div className="match-explorer-container">
        <div className="section-heading-matches">
          <div className="eyebrow">Match Explorer</div>
          <h2 id="matches-title">
            EVERY <i>INNINGS</i>
          </h2>
          <p>
            Explore KL Rahul's career match-by-match. Filter by format, year, opponent or venue. {matches.length}{" "}
            major innings documented.
          </p>
        </div>

        <div className="match-explorer-filters">
          <div className="filter-search">
            <Search aria-hidden="true" />
            <input
              type="search"
              placeholder="Search opponent or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search matches"
            />
          </div>

          <div className="filter-group">
            <Filter aria-hidden="true" />
            <label htmlFor="format-filter">Format:</label>
            <select
              id="format-filter"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as FormatName | "IPL" | "ALL")}
            >
              <option value="ALL">All Formats</option>
              <option value="Test">Test</option>
              <option value="ODI">ODI</option>
              <option value="T20I">T20I</option>
              <option value="IPL">IPL</option>
            </select>

            <label htmlFor="year-filter">Year:</label>
            <select id="year-filter" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year === "ALL" ? "All Years" : year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="match-results-header">
          <span>
            Showing {visibleMatches.length} of {filteredMatches.length} matches
          </span>
        </div>

        <AnimatePresence mode="sync">
          <motion.div className="match-grid" layout>
            {visibleMatches.map((match, index) => (
              <motion.article
                key={`${match.date}-${index}`}
                className="match-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                layout
              >
                <div className="match-card-header">
                  <span className="match-format">{match.format}</span>
                  <span className="match-date">
                    <Calendar aria-hidden="true" size={14} />
                    {formatDate(match.date)}
                  </span>
                </div>

                <div className="match-score-display">
                  <strong className="match-runs">{match.runs}{match.notOut ? "*" : ""}</strong>
                  <span className="match-balls">({match.balls})</span>
                </div>

                <div className="match-details">
                  <div className="match-opponent">
                    <Trophy aria-hidden="true" size={14} />
                    <span>vs {match.opponent}</span>
                  </div>
                  <div className="match-venue">
                    <MapPin aria-hidden="true" size={14} />
                    <span>{match.venue}</span>
                  </div>
                </div>

                <div className="match-stats">
                  <div className="match-stat">
                    <span>SR</span>
                    <strong>{match.strike_rate.toFixed(1)}</strong>
                  </div>
                  <div className="match-stat">
                    <span>4s</span>
                    <strong>{match.fours ?? 0}</strong>
                  </div>
                  <div className="match-stat">
                    <span>6s</span>
                    <strong>{match.sixes ?? 0}</strong>
                  </div>
                </div>

                <div className="match-result">
                  <span className={`result-badge ${match.result === "won" ? "won" : "lost"}`}>
                    {match.result.toUpperCase()}
                  </span>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>

        {visibleCount < filteredMatches.length && (
          <button
            className="match-load-more"
            onClick={() => setVisibleCount((prev) => Math.min(prev + 12, filteredMatches.length))}
          >
            Load More Matches <ChevronRight aria-hidden="true" />
          </button>
        )}

        {filteredMatches.length === 0 && (
          <div className="match-no-results">
            <p>No matches found with the current filters.</p>
            <button
              onClick={() => {
                setSelectedFormat("ALL");
                setSelectedYear("ALL");
                setSearchQuery("");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
