"use client";

import Image from "next/image";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, ArrowUpRight, Menu, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { MinimalistHero } from "@/components/ui/minimalist-hero";
import { CareerTimelineSection } from "@/components/sections/career-timeline";
import { CareerSnapshotSection } from "@/components/sections/career-snapshot";
import { StatsSection } from "@/components/sections/journey-stats";
import { CenturyVaultSection, GallerySection } from "@/components/sections/century-gallery";
import { AnalyticsEnhancedSection } from "@/components/sections/analytics-enhanced";
import { MatchExplorerSection } from "@/components/sections/match-explorer";
import { CareerRecordsSection } from "@/components/sections/career-records";
import { PlayerComparisonSection } from "@/components/sections/player-comparison";
import { AskKlrSection } from "@/components/sections/analytics-ask";

const navigation = [
  { id: "home", label: "Home" },
  { id: "journey", label: "Journey" },
  { id: "stats", label: "Stats" },
  { id: "analytics", label: "Analytics" },
  { id: "centuries", label: "Centuries" },
  { id: "records", label: "Records" },
  { id: "matches", label: "Matches" },
  { id: "gallery", label: "Gallery" },
  { id: "ask-klr", label: "Ask KLR" },
] as const;

function Navigation() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const sections = navigation.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: "-42% 0px -50%", threshold: 0.01 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-nav">
        <a className="wordmark" href="#home" aria-label="KLR01 — Home">KLR<span>01</span></a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a className={active === item.id ? "active" : ""} href={`#${item.id}`} aria-current={active === item.id ? "location" : undefined} key={item.id}>{item.label}</a>
          ))}
        </nav>
        <span className="fan-mark">Independent fan archive</span>
        <button
          className="menu-button"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </header>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.32 }}
          >
            <span>Navigate the archive</span>
            {navigation.map((item, index) => (
              <motion.a
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.035 }}
                key={item.id}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>{item.label}
              </motion.a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

function Finale() {
  return (
    <section className="finale section-photo" aria-labelledby="finale-title">
      <Image src="/images/rahul/verified/01-current-india-odi-bat-raise.webp" alt="KL Rahul raising his bat in India's current ODI era" fill sizes="100vw" loading="lazy" quality={68} />
      <div className="section-photo-scrim finale-scrim" />
      <div className="finale-content">
        <span><Sparkles aria-hidden="true" /> KLR01 · AN OPEN CHAPTER</span>
        <h2 id="finale-title">STILL WRITING <i>HISTORY.</i></h2>
        <p>From early setbacks to centuries in unfamiliar roles, Rahul’s career has never followed one straight line. The present chapter carries the same signatures as the first: patience, reinvention and the nerve to begin again.</p>
        <div className="finale-actions">
          <a className="finale-primary" href="#gallery">Explore the Gallery <ArrowRight aria-hidden="true" /></a>
          <a href="#ask-klr">Ask KLR <ArrowUpRight aria-hidden="true" /></a>
        </div>
        <small>Independent fan archive · Ask KLR is an AI fan assistant, not KL Rahul.</small>
      </div>
      <motion.svg className="finale-open-path" viewBox="0 0 1000 180" preserveAspectRatio="none" aria-hidden="true">
        <motion.path d="M-40 128 C180 8 320 185 520 92 S820 14 1050 110" initial={{ pathLength: 0.2 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 1.5 }} />
        <path d="M1022 94 L1050 110 L1020 124" />
      </motion.svg>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className="footer-brand"><b>KLR01</b><span>THE RAHUL ARCHIVE</span></div>
      <nav aria-label="Footer navigation">
        {navigation.slice(1).map((item) => <a href={`#${item.id}`} key={item.id}>{item.label}</a>)}
      </nav>
      <div className="footer-notes">
        <p>Independent fan-made project. Not affiliated with or endorsed by KL Rahul, BCCI, IPL or any franchise. Ask KLR is an AI fan assistant—not the real KL Rahul.</p>
        <p>Career totals are reconciled through 26 August 2026; detailed innings analytics use the supplied Cricsheet archive. Imagery remains subject to its respective ownership and must be rights-cleared before public deployment.</p>
      </div>
      <a className="back-top" href="#home">Back to top <ArrowUpRight aria-hidden="true" /></a>
    </footer>
  );
}

export function ArchiveExperience() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });

  return (
    <>
      <motion.div className="progress" style={{ scaleX }} aria-hidden="true" />
      <Navigation />
      <main id="main-content">
        <MinimalistHero />
        <CareerSnapshotSection />
        <CareerTimelineSection />
        <StatsSection />
        <CenturyVaultSection />
        <AnalyticsEnhancedSection />
        <CareerRecordsSection />
        <MatchExplorerSection />
        <PlayerComparisonSection />
        <GallerySection />
        <AskKlrSection />
        <Finale />
      </main>
      <Footer />
    </>
  );
}
