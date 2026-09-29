"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import archiveData from "@/public/data/klr-archive.json";

type StatCard = {
  value: number | string;
  label: string;
  formatter?: (val: number) => string;
};

function useCountUp(target: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * target));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };
          animate();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return { count, ref };
}

function StatCard({ value, label, formatter }: StatCard) {
  const numValue = typeof value === "number" ? value : 0;
  const { count, ref } = useCountUp(numValue, 1800);
  const displayValue = typeof value === "number" ? (formatter ? formatter(count) : count.toLocaleString("en-IN")) : value;

  return (
    <motion.div
      className="snapshot-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
      ref={ref}
    >
      <strong className="snapshot-value">{displayValue}</strong>
      <span className="snapshot-label">{label}</span>
    </motion.div>
  );
}

export function CareerSnapshotSection() {
  const stats: StatCard[] = [
    {
      value: archiveData.overall.matches,
      label: "Matches",
    },
    {
      value: archiveData.overall.runs,
      label: "Runs",
    },
    {
      value: archiveData.overall.hundreds,
      label: "Centuries",
    },
    {
      value: archiveData.overall.average,
      label: "Average",
      formatter: (val) => val.toFixed(2),
    },
  ];

  return (
    <section className="snapshot-section" aria-labelledby="snapshot-title">
      <div className="snapshot-container">
        <motion.h2
          id="snapshot-title"
          className="snapshot-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          CAREER SNAPSHOT
        </motion.h2>

        <div className="snapshot-grid">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <motion.div
          className="snapshot-update"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <strong>Data Last Updated:</strong> {new Date(archiveData.lastUpdated).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })} · Covers {archiveData.coverage.matches} matches · {archiveData.coverage.innings} regulation innings
        </motion.div>
      </div>
    </section>
  );
}
