"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import archiveData from "@/public/data/klr-archive.json";

type FormatName = keyof typeof archiveData.formats;
const formats: FormatName[] = ["Test", "ODI", "T20I", "IPL"];

type JourneyStage = {
  number: string;
  period: string;
  title: string;
  image: string;
  alt: string;
  story: string;
  milestone: string;
  imagePosition?: string;
  portraitImage?: boolean;
};

const journeyStages: readonly JourneyStage[] = [
  {
    number: "01",
    period: "2010–2014",
    title: "Karnataka foundations",
    image: "/images/rahul/verified/30-karnataka-domestic-trophies.webp",
    alt: "KL Rahul with Karnataka domestic trophies",
    story: "Rahul's route began in Karnataka's age-group and first-class system, where long innings shaped a patient opening method. Strong domestic seasons, including a prolific 2013–14 campaign, pushed him into India's Test plans.",
    milestone: "Karnataka pathway · Ranji Trophy foundations",
  },
  {
    number: "02",
    period: "December 2014",
    title: "India call-up, difficult debut",
    image: "/images/rahul/archive/gallery/01_early_career/kl-rahul-early-career-3626.webp",
    alt: "KL Rahul receives congratulations during his first Test appearance at the MCG",
    story: "A first India Test call-up became a debut at the MCG on 26 December 2014. Scores of 3 and 1 made the opening step difficult, but the selectors kept faith and gave him another chance in Sydney.",
    milestone: "India Test cap · Melbourne · 26 December 2014",
    imagePosition: "center 46%",
  },
  {
    number: "03",
    period: "January 2015",
    title: "Sydney answers the doubt",
    image: "/images/rahul/archive/gallery/01_early_career/kl-rahul-early-career-3627.webp",
    alt: "KL Rahul raising his bat in India Test whites during his early Test career",
    story: "Promoted to open in only his second Test, Rahul made 110 at the SCG. The innings transformed a bruising debut into the first defining hundred of his international career.",
    milestone: "110 vs Australia · second Test · Sydney",
  },
  {
    number: "04",
    period: "11 June 2016",
    title: "A hundred on ODI debut",
    image: "/images/rahul/verified/10-india-white-ball-2016-zimbabwe-era.webp",
    alt: "KL Rahul batting against Zimbabwe during his 2016 ODI debut series",
    story: "Opening on ODI debut against Zimbabwe in Harare, Rahul finished 100 not out and sealed the chase with a six. He became the first Indian man to score a century on ODI debut as India won by nine wickets.",
    milestone: "100* vs Zimbabwe · first Indian with an ODI debut hundred",
    imagePosition: "center 36%",
    portraitImage: true,
  },
  {
    number: "05",
    period: "18 June–27 August 2016",
    title: "From T20I debut to 110*",
    image: "/images/rahul/archive/gallery/02_india_breakthrough/kl-rahul-india-breakthrough-3635.webp",
    alt: "KL Rahul raises his bat after his maiden T20I century against West Indies in Florida",
    story: "Rahul's T20I debut against Zimbabwe ended in a first-ball duck, not a century. In only his fourth T20I, he answered with an unbeaten 110 against West Indies in Florida—his first hundred in the format.",
    milestone: "T20I debut vs Zimbabwe · 110* vs West Indies in Florida",
    imagePosition: "center 30%",
  },
  {
    number: "06",
    period: "IPL 2016",
    title: "RCB emergence",
    image: "/images/rahul/archive/gallery/02_india_breakthrough/kl-rahul-india-breakthrough-3636.webp",
    alt: "KL Rahul batting for Royal Challengers Bangalore during IPL 2016",
    story: "A breakout season with Royal Challengers Bangalore brought Rahul wider IPL recognition. He combined top-order technique with middle-order flexibility as RCB reached the 2016 final.",
    milestone: "397 runs · RCB finalist · IPL 2016",
  },
  {
    number: "07",
    period: "2018–2019",
    title: "England 101* to World Cup 111",
    image: "/images/rahul/archive/gallery/03_established_india/kl-rahul-established-india-3649.webp",
    alt: "KL Rahul raises his bat after his 2019 ODI World Cup century against Sri Lanka",
    story: "An unbeaten 101 in Manchester in 2018 made Rahul a T20I centurion for the second time. At the 2019 ODI World Cup he adapted to an opening role and signed off the group stage with 111 against Sri Lanka.",
    milestone: "101* T20I · 111 at the 2019 ODI World Cup",
    imagePosition: "center 28%",
  },
  {
    number: "08",
    period: "2020–2021",
    title: "Punjab runs and responsibility",
    image: "/images/rahul/archive/gallery/04_captaincy_and_lsg/kl-rahul-captaincy-and-lsg-3655.webp",
    alt: "KL Rahul acknowledging the crowd in Punjab IPL colours",
    story: "Punjab entrusted Rahul with the captaincy while he remained the side's main run source. He won the 2020 Orange Cap with 670 runs, led by an unbeaten 132 against RCB.",
    milestone: "Punjab captain · 2020 Orange Cap · 670 runs",
  },
  {
    number: "09",
    period: "T20 World Cups 2021–2022",
    title: "Two difficult campaigns",
    image: "/images/rahul/verified/35-t20-world-cup-2021-shaheen-dismissal.webp",
    alt: "KL Rahul dismissed against Pakistan at the 2021 T20 World Cup",
    story: "India's 2021 campaign never recovered from early defeats despite Rahul's later group-stage fifties. In 2022 he made two more fifties, but India exited in the semi-final and his own five against England ended the tournament on a difficult note.",
    milestone: "2021 group-stage exit · 2022 semi-final exit",
  },
  {
    number: "10",
    period: "November 2022–present",
    title: "The T20I door stays closed",
    image: "/images/rahul/verified/19-india-white-ball-dismissal.webp",
    alt: "KL Rahul being dismissed during a difficult India white-ball phase",
    story: "The 2022 semi-final on 10 November remains Rahul's last T20I appearance. He has stayed outside India's shortest-format team since then, leaving a return as an unfinished personal objective.",
    milestone: "Last T20I · 10 November 2022",
  },
  {
    number: "11",
    period: "23 January 2023",
    title: "A home beyond cricket",
    image: "/images/rahul/combined/original-collection/old-01-1f65a1f37eaae9d258f8ad662632b0c4.webp",
    alt: "KL Rahul and Athiya Shetty during their wedding ceremony",
    story: "Rahul married actor Athiya Shetty in an intimate ceremony at her family home in Khandala. The personal milestone arrived during a demanding phase of franchise leadership and international transition.",
    milestone: "Married Athiya Shetty · Khandala · 23 January 2023",
    imagePosition: "center 62%",
    portraitImage: true,
  },
  {
    number: "12",
    period: "LSG 2022–May 2023",
    title: "Leadership, runs, then injury",
    image: "/images/rahul/archive/gallery/04_captaincy_and_lsg/kl-rahul-captaincy-and-lsg-3664.webp",
    alt: "KL Rahul receiving treatment after his 2023 IPL thigh injury",
    story: "Rahul captained Lucknow Super Giants from their first season and scored two IPL hundreds in 2022. A serious thigh injury in May 2023 required surgery and forced him into a long rehabilitation.",
    milestone: "LSG captain · 2023 thigh injury and surgery",
  },
  {
    number: "13",
    period: "September 2023",
    title: "111* on return",
    image: "/images/rahul/verified/36-asia-cup-2023-pakistan-111.webp",
    alt: "KL Rahul celebrating his 111 not out against Pakistan at the 2023 Asia Cup",
    story: "Returning against Pakistan at the Asia Cup, Rahul made 111 not out after months away. He came back as a middle-order batter and wicketkeeper, a role change that immediately strengthened India's ODI balance.",
    milestone: "111* vs Pakistan · 11 September 2023",
  },
  {
    number: "14",
    period: "ODI World Cup 2023",
    title: "Keeper, stabiliser, finalist",
    image: "/images/rahul/archive/gallery/05_comeback_and_world_cup/kl-rahul-comeback-and-world-cup-3674.webp",
    alt: "KL Rahul wicketkeeping for India during the 2023 ODI World Cup",
    story: "Rahul kept wicket and stabilised the middle order through India's run to the final. He scored 452 runs, including 102 against the Netherlands, before the campaign ended in defeat to Australia.",
    milestone: "452 runs · wicketkeeper-batter · finalist",
  },
  {
    number: "15",
    period: "2024–2026",
    title: "Watching India move on in T20Is",
    image: "/images/rahul/archive/gallery/06_current_chapter/kl-rahul-current-chapter-3692.webp",
    alt: "KL Rahul in India's current ODI kit while continuing his white-ball career outside the T20I side",
    story: "India won the 2024 T20 World Cup and retained the title in 2026 without Rahul in either squad. While the national T20I side moved forward, he used franchise and white-ball cricket to keep arguing for another opportunity.",
    milestone: "India's 2024 + 2026 titles · Rahul not in either squad",
  },
  {
    number: "16",
    period: "February–March 2025",
    title: "Champions Trophy winner",
    image: "/images/rahul/combined/original-collection/old-04-64e66dfd4d7fecb8f7eca85270c858d2.webp",
    alt: "KL Rahul takes a selfie while holding his 2025 Champions Trophy winners medal in his mouth",
    story: "As India's middle-order wicketkeeper-finisher, Rahul scored 140 runs in five matches at a strike rate of 97.90. His 34 not out helped complete the final chase with Ravindra Jadeja, making this his first senior ICC title as a winning squad member.",
    milestone: "140 runs · 34* in the final · Champions Trophy winner",
    imagePosition: "center 64%",
    portraitImage: true,
  },
  {
    number: "17",
    period: "IPL 2025",
    title: "Delhi resurgence",
    image: "/images/rahul/verified/03-delhi-capitals-2025-wave.webp",
    alt: "KL Rahul acknowledging the crowd for Delhi Capitals in 2025",
    story: "A move to Delhi Capitals brought a freer T20 approach and roles across the order. Rahul scored 539 runs in 13 innings at a strike rate of 149.72, including an unbeaten 112.",
    milestone: "539 runs · SR 149.72 · 112*",
  },
  {
    number: "18",
    period: "England Tests · June–July 2025",
    title: "Red-ball renewal",
    image: "/images/rahul/archive/gallery/06_current_chapter/kl-rahul-current-chapter-3698.webp",
    alt: "KL Rahul raising his bat in Test whites during his 2025 red-ball renewal",
    story: "Back at the top of the Test order in England, Rahul supplied control across a demanding five-match series. He made 532 runs and centuries at Headingley and Lord's, re-establishing his value in red-ball cricket.",
    milestone: "532 runs · hundreds at Headingley and Lord's",
  },
  {
    number: "19",
    period: "IPL 2026",
    title: "The 150 barrier falls",
    image: "/images/rahul/archive/gallery/06_current_chapter/kl-rahul-current-chapter-3691.webp",
    alt: "KL Rahul raising his Delhi Capitals helmet during his IPL resurgence",
    story: "Rahul's shortest-format case surged again with an unbeaten 152 from 67 balls for Delhi Capitals against Punjab Kings. It was the first 150-plus score by an Indian in IPL history and the highest IPL score by an Indian—a massive comeback statement even though Punjab completed the chase.",
    milestone: "152* (67) · 16 fours · 9 sixes · Indian IPL record",
  },
];

type JourneyPath = { id: string; d: string };

function JourneyRouteLine({ routeRef }: { routeRef: RefObject<HTMLDivElement | null> }) {
  const [paths, setPaths] = useState<JourneyPath[]>([]);

  const measure = useCallback(() => {
    const route = routeRef.current;
    if (!route) return;
    const routeBox = route.getBoundingClientRect();
    const cards = [...route.querySelectorAll<HTMLElement>("[data-journey-stage]")];
    const mobile = routeBox.width < 760;
    setPaths(cards.slice(0, -1).map((card, index) => {
      const next = cards[index + 1];
      const from = card.getBoundingClientRect();
      const to = next.getBoundingClientRect();
      const sameRow = !mobile && Math.abs(from.top - to.top) < Math.min(from.height, to.height) * 0.45;
      if (sameRow) {
        const movingRight = to.left > from.left;
        const x1 = (movingRight ? from.right : from.left) - routeBox.left;
        const y1 = from.top + from.height * 0.52 - routeBox.top;
        const x2 = (movingRight ? to.left : to.right) - routeBox.left;
        const y2 = to.top + to.height * 0.48 - routeBox.top;
        const bend = Math.max(36, Math.abs(x2 - x1) * 0.46);
        return { id: `${index}-${Math.round(x1)}-${Math.round(y1)}`, d: `M ${x1} ${y1} C ${x1 + (movingRight ? bend : -bend)} ${y1}, ${x2 + (movingRight ? -bend : bend)} ${y2}, ${x2} ${y2}` };
      }
      const x1 = from.left + from.width * 0.5 - routeBox.left;
      const y1 = from.bottom - routeBox.top;
      const x2 = to.left + to.width * 0.5 - routeBox.left;
      const y2 = to.top - routeBox.top;
      const vertical = Math.max(28, (y2 - y1) * 0.52);
      const drift = mobile ? Math.min(34, routeBox.width * 0.08) * (index % 2 ? -1 : 1) : 0;
      return { id: `${index}-${Math.round(x1)}-${Math.round(y1)}`, d: `M ${x1} ${y1} C ${x1 + drift} ${y1 + vertical}, ${x2 + drift} ${y2 - vertical}, ${x2} ${y2}` };
    }));
  }, [routeRef]);

  useEffect(() => {
    const route = routeRef.current;
    if (!route) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    const mutationObserver = new MutationObserver(schedule);
    observer.observe(route);
    route.querySelectorAll<HTMLElement>("[data-journey-stage]").forEach((card) => observer.observe(card));
    mutationObserver.observe(route, { childList: true });
    route.querySelectorAll("img").forEach((image) => image.addEventListener("load", schedule));
    document.fonts?.ready.then(schedule).catch(() => undefined);
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutationObserver.disconnect();
      route.querySelectorAll("img").forEach((image) => image.removeEventListener("load", schedule));
      window.removeEventListener("resize", schedule);
    };
  }, [measure, routeRef]);

  return (
    <svg className="journey-route-line" width="100%" height="100%" aria-hidden="true">
      <defs><marker id="journey-arrow" viewBox="0 0 11 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 1 1 L 10 5 L 1 9" /></marker></defs>
      {paths.map((path) => (
        <g key={path.id}>
          <path className="journey-route-ghost" d={path.d} />
          <path className="journey-route-sketch" d={path.d} markerEnd="url(#journey-arrow)" />
        </g>
      ))}
    </svg>
  );
}

export function JourneySection() {
  const routeRef = useRef<HTMLDivElement>(null);
  return (
    <section id="journey" className="journey-section" aria-labelledby="journey-title">
      <div className="journey-intro section-photo">
        <Image src="/images/rahul/archive/gallery/05_comeback_and_world_cup/kl-rahul-comeback-and-world-cup-3677.webp" alt="" fill sizes="100vw" loading="lazy" quality={75} aria-hidden="true" />
        <div className="section-photo-scrim" />
        <div className="eyebrow">01 / Follow the route</div>
        <h2 id="journey-title">A CAREER <i>IN MOTION</i></h2>
        <p>Follow nineteen connected chapters—from Karnataka's domestic grounds and a life-changing wedding to a record-breaking 2026 IPL comeback. Exact-event photographs are labelled only where independently verified.</p>
        <a className="journey-intro-cue" href="#journey-stage-01">Begin at Stage 01 <span aria-hidden="true">↓</span></a>
      </div>
      <div className="journey-route" ref={routeRef} aria-label="KL Rahul career chapters in chronological order">
        <JourneyRouteLine routeRef={routeRef} />
        {journeyStages.map((chapter, index) => (
          <article
            className={`journey-stage journey-stage-${index % 4 === 0 || index % 4 === 3 ? "left" : "right"}${index % 2 ? " journey-stage-reverse" : ""}`}
            id={`journey-stage-${chapter.number}`}
            key={chapter.number}
            data-journey-stage
          >
            <div className={`journey-stage-image${chapter.portraitImage ? " journey-stage-image-portrait" : ""}`}>
              <Image
                src={chapter.image}
                alt={chapter.alt}
                fill
                sizes="(max-width: 700px) 92vw, (max-width: 1180px) 38vw, 24vw"
                loading="lazy"
                style={{ objectPosition: chapter.imagePosition ?? "center 42%" }}
              />
              <span>{chapter.number}</span>
            </div>
            <div className="journey-stage-copy">
              <p>{chapter.period}</p>
              <h3>{chapter.title}</h3>
              <span>{chapter.story}</span>
              <small>{chapter.milestone}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function StatsSection() {
  const [format, setFormat] = useState<FormatName>("Test");
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const stats = archiveData.formats[format];
  const years = useMemo(
    () => archiveData.yearly.filter((row) => row.format === format).sort((left, right) => left.year - right.year),
    [format],
  );
  const plot = useMemo(() => {
    const width = 1000;
    const height = 310;
    const horizontal = 24;
    const vertical = 30;
    const peak = Math.max(...years.map((year) => year.runs), 1);
    const points = years.map((year, index) => ({
      ...year,
      x: years.length === 1 ? width / 2 : horizontal + (index / (years.length - 1)) * (width - horizontal * 2),
      y: height - vertical - (year.runs / peak) * (height - vertical * 2),
    }));
    return { width, height, peak, points, path: points.map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`).join(" ") };
  }, [years]);
  const selectedPoint = plot.points.find((point) => point.year === activePoint) ?? plot.points.at(-1);
  const statStrip = [
    { label: "Runs", value: stats.runs.toLocaleString("en-IN") },
    { label: "Average", value: stats.average?.toFixed(2) ?? "—" },
    { label: "Strike rate", value: stats.strikeRate?.toFixed(2) ?? "—" },
    { label: "100s / 50s", value: `${stats.hundreds} / ${stats.fifties}` },
  ];

  return (
    <section id="stats" className="stats-section" aria-labelledby="stats-title">
      <div className="section-heading dark-text">
        <div className="eyebrow">02 / Verified career numbers</div>
        <h2 id="stats-title">NUMBERS <i>DON’T LIE.</i></h2>
        <p>Official career totals reconciled with BCCI and IPL records through 26 August 2026; the yearly pulse uses the local innings archive.</p>
      </div>
      <div className="data-stamp">{archiveData.coverage.innings} REGULATION INNINGS · {archiveData.coverage.matches} MATCHES · UPDATED {archiveData.lastUpdated}</div>
      <div className="format-tabs format-tabs-dark" role="tablist" aria-label="Career format">
        {formats.map((item) => (
          <button
            type="button"
            role="tab"
            aria-selected={format === item}
            onClick={() => {
              setFormat(item);
              setActivePoint(null);
            }}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="stat-strip">
        {statStrip.map((stat) => (
          <article key={stat.label}>
            {stat.label === "100s / 50s" ? (
              <strong className="stat-nowrap"><span>{stats.hundreds}</span><i>/</i><span>{stats.fifties}</span></strong>
            ) : <strong>{stat.value}</strong>}
            <span>{stat.label} · {format}</span>
          </article>
        ))}
      </div>
      <div className="trend-panel">
        <div className="trend-copy">
          <span>Verified year-by-year runs</span>
          <h3>THE PULSE</h3>
          <p>{stats.innings} innings across {stats.matches} matches in the current dataset view.</p>
          {selectedPoint && (
            <div className="trend-tooltip" aria-live="polite">
              <b>{selectedPoint.year}</b>
              <strong>{selectedPoint.runs.toLocaleString("en-IN")}</strong>
              <span>runs · {selectedPoint.innings} innings</span>
            </div>
          )}
        </div>
        <div className="chart-area" aria-label={`${format} annual runs chart. Use the points to inspect exact values.`}>
          <svg viewBox={`0 0 ${plot.width} ${plot.height}`} role="img" aria-labelledby="trend-chart-title trend-chart-desc">
              <title id="trend-chart-title">{`${format} annual runs`}</title>
            <desc id="trend-chart-desc">A line chart of verified runs by year. An accessible table follows the chart.</desc>
            {[0.25, 0.5, 0.75].map((ratio) => <line key={ratio} x1="0" x2={plot.width} y1={plot.height * ratio} y2={plot.height * ratio} />)}
            <path className="trend-fill" d={`${plot.path} L${plot.points.at(-1)?.x},${plot.height} L${plot.points[0]?.x},${plot.height} Z`} />
            <path className="trend-line" d={plot.path} />
          </svg>
          <div className="chart-points" aria-hidden="false">
            {plot.points.map((point) => (
              <button
                type="button"
                key={point.year}
                aria-label={`${point.year}: ${point.runs} runs from ${point.innings} innings`}
                aria-pressed={selectedPoint?.year === point.year}
                onMouseEnter={() => setActivePoint(point.year)}
                onFocus={() => setActivePoint(point.year)}
                onClick={() => setActivePoint(point.year)}
                style={{ left: `${(point.x / plot.width) * 100}%`, top: `${(point.y / plot.height) * 100}%` }}
              />
            ))}
          </div>
          <div className="chart-axis"><span>{years[0]?.year}</span><b>PEAK {plot.peak.toLocaleString("en-IN")}</b><span>{years.at(-1)?.year}</span></div>
        </div>
      </div>
      <details className="data-table-disclosure">
        <summary>View annual data table</summary>
        <div className="table-scroll">
          <table>
            <caption>{format} runs and innings by year</caption>
            <thead><tr><th scope="col">Year</th><th scope="col">Runs</th><th scope="col">Innings</th></tr></thead>
            <tbody>{years.map((year) => <tr key={year.year}><th scope="row">{year.year}</th><td>{year.runs}</td><td>{year.innings}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
