"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Trophy, Target, Star, Award, Crown, Shield, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

const careerStations = [
  {
    id: 1,
    year: "2013-2014",
    title: "Early Days",
    subtitle: "Karnataka & Debut",
    icon: Target,
    color: "#8B7355",
    achievements: ["First-class debut for Karnataka", "Ranji Trophy performances", "India A selection"],
    stats: { matches: 12, runs: "856", avg: "42.80" },
  },
  {
    id: 2,
    year: "2014-2015",
    title: "Test Debut",
    subtitle: "Boxing Day Century",
    icon: Star,
    color: "#D4AF37",
    achievements: ["Test debut vs Australia at MCG", "110 on debut - Boxing Day Test", "Second Indian to score century on debut in Australia"],
    stats: { matches: 8, runs: "435", avg: "36.25" },
  },
  {
    id: 3,
    year: "2016-2018",
    title: "Breakthrough",
    subtitle: "199 & T20 Rise",
    icon: Trophy,
    color: "#FF6B35",
    achievements: ["199 vs England in Chennai (career-best Test score)", "T20I debut - 110* vs West Indies", "Emerged as T20 specialist"],
    stats: { matches: 45, runs: "1,842", avg: "38.77" },
  },
  {
    id: 4,
    year: "2018-2019",
    title: "ODI Evolution",
    subtitle: "World Cup Campaign",
    icon: Award,
    color: "#4ECDC4",
    achievements: ["Established as opener in ODIs", "World Cup 2019: 361 runs", "112* vs New Zealand at Bay Oval"],
    stats: { matches: 52, runs: "2,268", avg: "47.25" },
  },
  {
    id: 5,
    year: "2020-2021",
    title: "IPL Orange Cap",
    subtitle: "Punjab Kings Era",
    icon: Crown,
    color: "#FFA500",
    achievements: ["IPL Orange Cap 2020: 670 runs", "Captain of Punjab Kings", "132* - joint-highest by Indian in IPL"],
    stats: { matches: 42, runs: "1,456", avg: "48.53" },
  },
  {
    id: 6,
    year: "2021-2023",
    title: "Leadership",
    subtitle: "LSG Captain",
    icon: Shield,
    color: "#9B59B6",
    achievements: ["Lucknow Super Giants captain", "Led LSG to playoffs", "Consistent middle-order performances"],
    stats: { matches: 68, runs: "2,847", avg: "44.48" },
  },
  {
    id: 7,
    year: "2024-2025",
    title: "T20 WC Champion",
    subtitle: "World Cup Glory",
    icon: Trophy,
    color: "#00B894",
    achievements: ["T20 World Cup 2024 Winner", "Champions Trophy 2025 Winner", "Key contributor in both tournaments"],
    stats: { matches: 38, runs: "1,624", avg: "42.74" },
  },
  {
    id: 8,
    year: "2025-2026",
    title: "Current Era",
    subtitle: "Delhi Capitals",
    icon: TrendingUp,
    color: "#0066CC",
    achievements: ["Moved to Delhi Capitals", "152* - Highest IPL 2026 score", "Test series centuries vs England"],
    stats: { matches: 45, runs: "1,934", avg: "45.68" },
  },
];

export function CareerTimelineSection() {
  const [selected, setSelected] = useState(1);
  const currentStation = careerStations.find((s) => s.id === selected) || careerStations[0];
  const StationIcon = currentStation.icon;

  return (
    <section id="journey" className="career-metro-section">
      <div className="career-metro-container">
        <div className="career-metro-header">
          <div className="eyebrow">Career Journey</div>
          <h2>CAREER IN <i>MOTION</i></h2>
          <p>Navigate through KL Rahul's cricket journey across different eras and milestones</p>
        </div>

        {/* Metro Line Map */}
        <div className="metro-line-wrapper">
          <div className="metro-line">
            {careerStations.map((station, index) => (
              <div key={station.id} className={`metro-station ${selected === station.id ? "active" : ""} ${selected > station.id ? "passed" : ""}`}>
                <button
                  type="button"
                  className="station-dot"
                  style={{ backgroundColor: selected >= station.id ? station.color : "transparent", borderColor: station.color }}
                  onClick={() => setSelected(station.id)}
                  aria-label={`View ${station.title} era`}
                >
                  <span className="station-number">{station.id}</span>
                </button>
                <div className="station-label">
                  <span className="station-year">{station.year}</span>
                  <span className="station-name">{station.title}</span>
                </div>
                {index < careerStations.length - 1 && (
                  <div
                    className={`metro-connector ${selected > station.id ? "active" : ""}`}
                    style={{ background: selected > station.id ? `linear-gradient(90deg, ${station.color}, ${careerStations[index + 1].color})` : undefined }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Station Details */}
        <motion.div key={currentStation.id} className="metro-station-details" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="station-details-header">
            <div className="station-icon" style={{ backgroundColor: `${currentStation.color}20`, color: currentStation.color }}>
              <StationIcon size={32} />
            </div>
            <div className="station-title-group">
              <h3>{currentStation.title}</h3>
              <p>{currentStation.subtitle}</p>
              <span className="station-year-badge">{currentStation.year}</span>
            </div>
          </div>

          <div className="station-content">
            <div className="station-achievements">
              <h4>Key Achievements</h4>
              <ul>
                {currentStation.achievements.map((achievement, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    {achievement}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="station-stats-cards">
              <div className="stat-card-metro">
                <span className="stat-label-metro">Matches</span>
                <span className="stat-value-metro">{currentStation.stats.matches}</span>
              </div>
              <div className="stat-card-metro">
                <span className="stat-label-metro">Runs</span>
                <span className="stat-value-metro">{currentStation.stats.runs}</span>
              </div>
              <div className="stat-card-metro">
                <span className="stat-label-metro">Average</span>
                <span className="stat-value-metro">{currentStation.stats.avg}</span>
              </div>
            </div>
          </div>

          <div className="station-navigation">
            <button type="button" className="nav-btn prev" onClick={() => setSelected(Math.max(1, selected - 1))} disabled={selected === 1}>
              <ChevronLeft size={20} /> Previous Era
            </button>
            <button type="button" className="nav-btn next" onClick={() => setSelected(Math.min(careerStations.length, selected + 1))} disabled={selected === careerStations.length}>
              Next Era <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
