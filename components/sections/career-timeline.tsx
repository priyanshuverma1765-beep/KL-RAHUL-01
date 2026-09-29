"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CareerEra = {
  id: string;
  number: string;
  period: string;
  title: string;
  shortTitle: string;
  description: string;
  format: string;
  keyStats: string;
  image: string;
  alt: string;
  imagePosition?: string;
};

const careerEras: readonly CareerEra[] = [
  {
    id: "early-years",
    number: "01",
    period: "2010–2014",
    title: "Karnataka Foundations",
    shortTitle: "Early Years",
    description: "From Karnataka's age-group system to first-class cricket — the foundations built through long innings and patient opening methods in domestic cricket.",
    format: "DOMESTIC",
    keyStats: "Ranji Trophy · First-class cricket",
    image: "/images/rahul/verified/30-karnataka-domestic-trophies.webp",
    alt: "KL Rahul with Karnataka domestic trophies",
    imagePosition: "center 42%",
  },
  {
    id: "india-debut",
    number: "02",
    period: "2014–2015",
    title: "India Debut & Sydney Breakthrough",
    shortTitle: "India Debut",
    description: "A difficult Test debut at the MCG (3 & 1) followed by redemption at the SCG with 110 in only his second Test. The first defining hundred of an international career.",
    format: "TEST",
    keyStats: "Test debut · 110 vs Australia · Sydney",
    image: "/images/rahul/archive/gallery/01_early_career/kl-rahul-early-career-3627.webp",
    alt: "KL Rahul raising his bat during his Sydney Test century",
    imagePosition: "center 30%",
  },
  {
    id: "multi-format-rise",
    number: "03",
    period: "2016–2019",
    title: "Multi-Format Breakthrough",
    shortTitle: "Breakthrough",
    description: "ODI debut century, T20I hundreds, Test 199 at Chennai, World Cup 111. Rahul became the adaptable player teams could reimagine across formats and positions.",
    format: "ALL FORMATS",
    keyStats: "3 formats · 100 on ODI debut · 199 vs England",
    image: "/images/rahul/verified/42-chennai-2016-199-bcci.jpg",
    alt: "KL Rahul celebrating his 199 against England at Chennai",
    imagePosition: "center 34%",
  },
  {
    id: "overseas-test-craft",
    number: "04",
    period: "2018–2022",
    title: "Overseas Test Craft",
    shortTitle: "Test Opener",
    description: "Built for difficult days abroad. Lord's 2021, Centurion centuries, adapting to new-ball movement and long spells. The technique kept finding a way forward.",
    format: "TEST",
    keyStats: "Lord's 149 · Centurion hundreds · Overseas opener",
    image: "/images/rahul/archive/gallery/04_captaincy_and_lsg/kl-rahul-captaincy-and-lsg-3656.webp",
    alt: "KL Rahul raising his bat at Lord's",
    imagePosition: "center 26%",
  },
  {
    id: "ipl-leadership",
    number: "05",
    period: "2020–2023",
    title: "IPL Leadership & Orange Cap",
    shortTitle: "IPL Captain",
    description: "Punjab captain, 2020 Orange Cap with 670 runs including 132* vs RCB. Founded LSG leadership, then injury and surgery interrupted the franchise chapter.",
    format: "IPL",
    keyStats: "Orange Cap · 670 runs · Punjab & LSG captain",
    image: "/images/rahul/verified/18-punjab-kings-2020-ipl-action.webp",
    alt: "KL Rahul celebrating IPL century for Punjab",
    imagePosition: "center 26%",
  },
  {
    id: "keeper-evolution",
    number: "06",
    period: "2023",
    title: "Wicketkeeper-Batter Evolution",
    shortTitle: "WK Evolution",
    description: "Post-injury return as middle-order keeper. 111* vs Pakistan at Asia Cup, 452 runs at World Cup 2023 final run. A role change that reshaped his white-ball value.",
    format: "ODI",
    keyStats: "WK/BAT · 111* vs Pakistan · World Cup finalist",
    image: "/images/rahul/verified/36-asia-cup-2023-pakistan-111.webp",
    alt: "KL Rahul celebrating 111 not out against Pakistan",
    imagePosition: "center 26%",
  },
  {
    id: "champions-trophy",
    number: "07",
    period: "2025",
    title: "Champions Trophy Winner",
    shortTitle: "ICC Trophy",
    description: "First senior ICC title. Middle-order finisher with 140 runs, 34* in the final chase with Jadeja. The silverware that had stayed out of reach finally arrived.",
    format: "ODI",
    keyStats: "Champions Trophy winner · 140 runs · 34* in final",
    image: "/images/rahul/combined/original-collection/old-04-64e66dfd4d7fecb8f7eca85270c858d2.webp",
    alt: "KL Rahul with Champions Trophy winners medal",
    imagePosition: "center 64%",
  },
  {
    id: "england-renewal",
    number: "08",
    period: "2025",
    title: "Red-Ball Renewal in England",
    shortTitle: "Test Renewal",
    description: "Back at the top of the Test order. 532 runs across five Tests in England, centuries at Headingley and Lord's. Red-ball value re-established.",
    format: "TEST",
    keyStats: "532 runs · Headingley & Lord's hundreds",
    image: "/images/rahul/archive/gallery/06_current_chapter/kl-rahul-current-chapter-3698.webp",
    alt: "KL Rahul celebrating Test century in England",
    imagePosition: "center 28%",
  },
  {
    id: "current-chapter",
    number: "09",
    period: "2025–2026",
    title: "Delhi Resurgence & 152*",
    shortTitle: "Current Era",
    description: "Delhi Capitals switch brought IPL resurgence: 539 runs at SR 149.72 in 2025, then 152* (67) in 2026—the highest IPL score by an Indian. The comeback statement.",
    format: "IPL / T20",
    keyStats: "152* · Indian IPL record · 9 sixes · Still writing",
    image: "/images/rahul/archive/gallery/06_current_chapter/kl-rahul-current-chapter-3691.webp",
    alt: "KL Rahul celebrating his record-breaking IPL innings",
    imagePosition: "center 24%",
  },
];

export function CareerTimelineSection() {
  const [activeEra, setActiveEra] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navigate = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setActiveEra((prev) => (prev > 0 ? prev - 1 : careerEras.length - 1));
    } else {
      setActiveEra((prev) => (prev < careerEras.length - 1 ? prev + 1 : 0));
    }
  };

  const selectedEra = careerEras[activeEra];

  return (
    <section id="journey" className="timeline-section" aria-labelledby="timeline-title">
      <div className="timeline-intro">
        <div className="eyebrow">01 / Career in Motion</div>
        <h2 id="timeline-title">
          THE <i>JOURNEY</i>
        </h2>
        <p>
          Nine defining eras from Karnataka foundations to record-breaking comeback. Click any milestone to explore
          that chapter of the story.
        </p>
      </div>

      <div className="timeline-container" ref={timelineRef}>
        {/* Timeline Rail */}
        <div className="timeline-rail" role="tablist" aria-label="Career timeline milestones">
          {careerEras.map((era, index) => (
            <button
              key={era.id}
              type="button"
              role="tab"
              aria-selected={activeEra === index}
              aria-controls={`era-panel-${era.id}`}
              className={`timeline-milestone ${activeEra === index ? "active" : ""}`}
              onClick={() => setActiveEra(index)}
            >
              <span className="milestone-dot" aria-hidden="true" />
              <span className="milestone-year">{era.period.split("–")[0]}</span>
              <span className="milestone-label">{era.shortTitle}</span>
            </button>
          ))}
          <div className="timeline-track" aria-hidden="true" />
          <motion.div
            className="timeline-progress"
            initial={false}
            animate={{
              width: `${(activeEra / (careerEras.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          />
        </div>

        {/* Era Details */}
        <div className="timeline-content">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selectedEra.id}
              id={`era-panel-${selectedEra.id}`}
              role="tabpanel"
              className="era-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="era-image">
                <Image
                  src={selectedEra.image}
                  alt={selectedEra.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  style={{ objectPosition: selectedEra.imagePosition ?? "center" }}
                  priority={activeEra === 0}
                />
                <div className="era-image-overlay" />
                <span className="era-number">{selectedEra.number}</span>
              </div>
              <div className="era-details">
                <span className="era-format">{selectedEra.format}</span>
                <h3>{selectedEra.title}</h3>
                <p className="era-period">{selectedEra.period}</p>
                <p className="era-description">{selectedEra.description}</p>
                <div className="era-stats">
                  <span>{selectedEra.keyStats}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="timeline-navigation">
            <button
              type="button"
              onClick={() => navigate("prev")}
              aria-label="Previous era"
              className="timeline-nav-button"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <span className="timeline-counter" aria-live="polite">
              {String(activeEra + 1).padStart(2, "0")} / {String(careerEras.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => navigate("next")}
              aria-label="Next era"
              className="timeline-nav-button"
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
