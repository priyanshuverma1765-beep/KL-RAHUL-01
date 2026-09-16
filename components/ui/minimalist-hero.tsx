"use client";

import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

export function MinimalistHero() {
  const heroRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const mainScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.05]);
  const circleScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.1]);
  const leftX = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -55]);
  const rightX = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 55]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -36]);
  const microOpacity = useTransform(scrollYProgress, [0, .65], [1, 0]);
  const ghostLeftX = useTransform(pointerX, (value) => value * 3);
  const ghostRightX = useTransform(pointerX, (value) => value * -3);
  const haloX = useTransform(pointerX, (value) => value * 5);
  const haloY = useTransform(pointerY, (value) => value * 5);
  const athleteX = useTransform(pointerX, (value) => value * 8);
  const athleteY = useTransform(pointerY, (value) => value * 8);
  const ease = [0.22, 1, 0.36, 1] as const;

  function handlePointer(event: React.PointerEvent<HTMLElement>) {
    if (reduce || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - .5);
    pointerY.set((event.clientY - rect.top) / rect.height - .5);
  }

  function resetPointer() { pointerX.set(0); pointerY.set(0); }

  return (
    <section ref={heroRef} id="home" className="hero-new" aria-labelledby="hero-title" onPointerMove={handlePointer} onPointerLeave={resetPointer}>
      <motion.div className="hero-stadium" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .75, delay: .1 }} />
      <div className="hero-vignette" aria-hidden="true" /><div className="hero-grain" aria-hidden="true" />
      <motion.div className="hero-ghost hero-ghost-left" style={{ y: bgY, x: ghostLeftX }} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .8, delay: .55 }}><Image src="/images/rahul/hero/kl-test-bg.png" alt="" fill sizes="(max-width: 900px) 72vw, 36vw" loading="eager" decoding="async" quality={70} aria-hidden="true" /></motion.div>
      <motion.div className="hero-ghost hero-ghost-right" style={{ y: bgY, x: ghostRightX }} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .8, delay: .65 }}><Image src="/images/rahul/hero/kl-odi-bg.png" alt="" fill sizes="(max-width: 900px) 72vw, 36vw" loading="eager" decoding="async" quality={70} aria-hidden="true" /></motion.div>
      <motion.div className="hero-word hero-word-kl" style={{ x: leftX }} initial={reduce ? false : { opacity: 0, x: -70 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .8, delay: .3, ease }} aria-hidden="true">KL</motion.div>
      <motion.div className="hero-word hero-word-rahul" style={{ x: rightX }} initial={reduce ? false : { opacity: 0, x: 70 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .8, delay: .4, ease }} aria-hidden="true">RAHUL<span>.</span></motion.div>
      <h1 id="hero-title" className="sr-only">KL Rahul — The Rahul Archive</h1>
      <motion.div className="hero-halo" style={{ scale: circleScale, x: haloX, y: haloY }} initial={reduce ? false : { opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .9, delay: .2, ease }} aria-hidden="true" />
      <motion.div className="hero-athlete" style={{ scale: mainScale, x: athleteX, y: athleteY }} initial={reduce ? false : { y: 18 }} animate={{ y: 0 }} transition={{ duration: .8, delay: .12, ease }}><Image src="/images/rahul/hero/kl-main-centered-v5.png" alt="KL Rahul representing India" fill preload sizes="(max-width: 900px) 100vw, 66vw" quality={85} /></motion.div>
      <motion.div className="hero-left-copy" style={{ opacity: microOpacity }} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, delay: .75 }}><p>Technique.<br />Resilience.<br />Class.</p><i aria-hidden="true" /><div className="hero-note"><b>“</b><span>A career shaped by patience,<br />precision, and reinvention.</span><small>— THE RAHUL ARCHIVE</small></div></motion.div>
      <motion.div className="hero-name-script" style={{ opacity: microOpacity }} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .55, delay: .78 }}><Image src="/images/rahul/hero/kl-signature-transparent-v4.png" alt="KL Rahul signature" width={236} height={162} loading="eager" /></motion.div>
      <motion.div className="hero-bottom" style={{ opacity: microOpacity }} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, delay: .82 }}><div className="hero-origin"><span className="india-flag" aria-label="India flag"><i /><i /><i /></span><span>INDIA <b>·</b> KARNATAKA <b>·</b> DELHI CAPITALS</span></div><a href="#journey">Explore the journey <ArrowRight aria-hidden="true" size={19} /></a></motion.div>
    </section>
  );
}
