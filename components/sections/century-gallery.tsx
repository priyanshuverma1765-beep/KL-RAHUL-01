"use client";

import Image from "next/image";
import { ChevronRight, Expand, Images } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import archiveData from "@/public/data/klr-archive.json";
import imageManifest from "@/data/merged-image-manifest.json";
import { MediaDialog } from "@/components/ui/media-dialog";

type FormatName = keyof typeof archiveData.formats;
type CenturyFilter = "ALL" | FormatName;

type CenturyImage = { src: string; alt: string; context: string; position?: string };

const centuryImageByDate: Record<string, CenturyImage> = {
  "2015-01-06": { src: "/images/rahul/archive/gallery/01_early_career/kl-rahul-early-career-3627.webp", alt: "KL Rahul celebrates his first Test century at the SCG", context: "Exact-event photograph from the Sydney Test hundred", position: "center 30%" },
  "2015-08-20": { src: "/images/rahul/verified/13-early-test-century-celebration.webp", alt: "KL Rahul celebrates an early-career Test hundred for India", context: "High-resolution early Test celebration; no match-specific claim is attached", position: "center 28%" },
  "2016-07-30": { src: "/images/rahul/archive/gallery/01_early_career/kl-rahul-early-career-3630.webp", alt: "KL Rahul celebrates his 158 against West Indies at Sabina Park", context: "Exact-event photograph from the Sabina Park Test hundred", position: "center 28%" },
  "2016-12-16": { src: "/images/rahul/verified/42-chennai-2016-199-bcci.jpg", alt: "KL Rahul celebrates his 199 against England during the Chennai Test in December 2016", context: "Exact-event BCCI-credited photograph from the Chennai 199", position: "center 34%" },
  "2018-09-07": { src: "/images/rahul/archive/gallery/03_established_india/kl-rahul-established-india-3645.webp", alt: "KL Rahul acknowledges the crowd during the 2018 England Test series", context: "Verified 2018 England Test-series photograph; no tighter match claim is attached", position: "center 28%" },
  "2021-08-12": { src: "/images/rahul/archive/gallery/04_captaincy_and_lsg/kl-rahul-captaincy-and-lsg-3656.webp", alt: "KL Rahul raises his bat after his Lord's Test century in 2021", context: "Exact-event photograph from the Lord's Test hundred", position: "center 26%" },
  "2021-12-26": { src: "/images/rahul/archive/gallery/04_captaincy_and_lsg/kl-rahul-captaincy-and-lsg-3659.webp", alt: "KL Rahul celebrates his Boxing Day Test century at Centurion", context: "Exact-event photograph from the Centurion Test hundred", position: "center 30%" },
  "2023-12-26": { src: "/images/rahul/archive/gallery/06_current_chapter/kl-rahul-current-chapter-3682.webp", alt: "KL Rahul celebrates his 2023 Boxing Day Test century at Centurion", context: "Exact-event photograph from the Centurion Test hundred", position: "center 26%" },
  "2025-06-20": { src: "/images/rahul/archive/gallery/06_current_chapter/kl-rahul-current-chapter-3698.webp", alt: "KL Rahul celebrates his 137 against England at Headingley", context: "Exact-event photograph from the Headingley Test hundred", position: "center 28%" },
  "2025-07-10": { src: "/images/rahul/archive/gallery/06_current_chapter/kl-rahul-current-chapter-3697.webp", alt: "KL Rahul celebrates reaching 100 at Lord's during India's 2025 England Test series", context: "Event-specific England Cricket century graphic from the Lord's Test hundred", position: "center 30%" },
  "2025-10-02": { src: "/images/rahul/archive/gallery/06_current_chapter/kl-rahul-current-chapter-3699.webp", alt: "KL Rahul raises his bat after a Test century against West Indies in Ahmedabad", context: "Exact-event photograph from the Ahmedabad Test hundred", position: "center 24%" },
  "2016-06-11": { src: "/images/rahul/verified/10-india-white-ball-2016-zimbabwe-era.webp", alt: "KL Rahul celebrates his ODI debut century against Zimbabwe in Harare", context: "Zimbabwe-series photograph matched to the ODI debut-century phase", position: "center 26%" },
  "2019-07-06": { src: "/images/rahul/archive/gallery/03_established_india/kl-rahul-established-india-3649.webp", alt: "KL Rahul raises his bat after his 111 against Sri Lanka at the 2019 World Cup", context: "Exact-event photograph from the 2019 World Cup hundred against Sri Lanka", position: "center 30%" },
  "2019-12-18": { src: "/images/rahul/archive/gallery/03_established_india/kl-rahul-established-india-3647.webp", alt: "KL Rahul raises his bat for India during the 2019 ODI season", context: "High-resolution 2019 India ODI photograph; no match-specific claim is attached", position: "center 28%" },
  "2020-02-11": { src: "/images/rahul/archive/gallery/03_established_india/kl-rahul-established-india-3652.webp", alt: "KL Rahul celebrates his 112 against New Zealand at Bay Oval", context: "Exact-event photograph from the Bay Oval ODI hundred", position: "center 24%" },
  "2021-03-26": { src: "/images/rahul/archive/gallery/03_established_india/kl-rahul-established-india-3653.webp", alt: "KL Rahul celebrates his ODI century against England in Pune", context: "Exact-event photograph from the Pune ODI hundred", position: "center 24%" },
  "2023-09-10": { src: "/images/rahul/verified/36-asia-cup-2023-pakistan-111.webp", alt: "KL Rahul celebrates his unbeaten 111 against Pakistan at the 2023 Asia Cup", context: "Exact-event photograph from the 2023 Asia Cup hundred", position: "center 26%" },
  "2023-11-12": { src: "/images/rahul/verified/02-2019-world-cup-century-celebration.webp", alt: "KL Rahul celebrates his 102 against Netherlands at the 2023 World Cup", context: "Exact-event photograph from the Bengaluru World Cup hundred against Netherlands", position: "center 28%" },
  "2026-01-14": { src: "/images/rahul/archive/gallery/06_current_chapter/kl-rahul-current-chapter-3694.webp", alt: "KL Rahul acknowledges his ODI century against New Zealand in Rajkot", context: "Event-matched photograph from the Rajkot ODI hundred", position: "center 24%" },
  "2016-08-27": { src: "/images/rahul/archive/gallery/02_india_breakthrough/kl-rahul-india-breakthrough-3635.webp", alt: "KL Rahul celebrates his T20I century against West Indies in Florida", context: "Exact-event photograph from the Florida T20I hundred", position: "center 26%" },
  "2018-07-03": { src: "/images/rahul/archive/gallery/03_established_india/kl-rahul-established-india-3641.webp", alt: "KL Rahul celebrates his T20I century against England in Manchester", context: "Exact-event photograph from the Manchester T20I hundred", position: "center 24%" },
  "2019-04-10": { src: "/images/rahul/archive/gallery/03_established_india/kl-rahul-established-india-3642.webp", alt: "KL Rahul raises his bat for Punjab during the 2019 IPL season", context: "Punjab 2019 IPL photograph associated with the Mumbai innings", position: "center 24%" },
  "2020-09-24": { src: "/images/rahul/verified/18-punjab-kings-2020-ipl-action.webp", alt: "KL Rahul celebrates his unbeaten 132 for Punjab against RCB", context: "Exact-event photograph from the Dubai IPL hundred", position: "center 26%" },
  "2022-04-16": { src: "/images/rahul/archive/gallery/04_captaincy_and_lsg/kl-rahul-captaincy-and-lsg-3661.webp", alt: "KL Rahul celebrates an IPL century for LSG against Mumbai Indians", context: "Event-specific LSG century photograph from the 2022 Mumbai fixtures", position: "center 28%" },
  "2022-04-24": { src: "/images/rahul/archive/gallery/04_captaincy_and_lsg/kl-rahul-captaincy-and-lsg-3663.webp", alt: "KL Rahul raises his bat after an IPL century for LSG against Mumbai Indians", context: "Event-specific LSG century photograph from the 2022 Mumbai fixtures", position: "center 25%" },
  "2025-05-18": { src: "/images/rahul/archive/gallery/06_current_chapter/kl-rahul-current-chapter-3687.webp", alt: "KL Rahul celebrates his unbeaten 112 for Delhi Capitals against Gujarat Titans", context: "Exact-event photograph from the Delhi IPL hundred", position: "center 24%" },
  "2026-04-25": { src: "/images/rahul/archive/gallery/06_current_chapter/kl-rahul-current-chapter-3691.webp", alt: "KL Rahul celebrates his unbeaten 152 for Delhi Capitals against Punjab Kings", context: "Exact-event photograph from the Delhi IPL hundred", position: "center 24%" },
  "2026-06-06": { src: "/images/rahul/verified/21-current-test-century-with-gill.webp", alt: "KL Rahul celebrates his Test century against Afghanistan with Shubman Gill", context: "Exact-event photograph from the Afghanistan one-off Test", position: "center 32%" },
};

function centuryImage(date: string) {
  return centuryImageByDate[date] ?? { src: "/images/rahul/archive/gallery/01_early_career/kl-rahul-early-career-3627.webp", alt: "KL Rahul celebrates a Test century for India", context: "Archive photograph; exact innings unverified" };
}

function longDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export function CenturyVaultSection() {
  const [filter, setFilter] = useState<CenturyFilter>("ALL");
  const [selected, setSelected] = useState(0);
  const [visibleCount, setVisibleCount] = useState(9);
  const [dialogOpen, setDialogOpen] = useState(false);
  const filtered = useMemo(() => archiveData.centuries
    .filter((century) => filter === "ALL" || century.format === filter)
    .sort((left, right) => right.runs - left.runs || right.date.localeCompare(left.date)), [filter]);
  const currentIndex = Math.min(selected, Math.max(filtered.length - 1, 0));
  const current = filtered[currentIndex];
  const currentImage = current ? centuryImage(current.date) : centuryImage("");

  useEffect(() => {
    setSelected(0);
    setVisibleCount(9);
  }, [filter, filtered.length]);

  function move(step: number) {
    setSelected((value) => (value + step + filtered.length) % filtered.length);
  }

  return (
    <section id="centuries" className="century-section" aria-labelledby="century-title">
      <div className="section-heading split-heading">
        <div className="eyebrow">03 / {archiveData.centuries.length} verified career centuries</div>
        <h2 id="century-title">CENTURY <i>VAULT</i></h2>
        <p>Career scores are reconciled through 26 August 2026. Photographs are exact-event only where independently verified; every other image is labelled at format or era level.</p>
      </div>
      <div className="format-tabs" role="tablist" aria-label="Century format">
        {(["ALL", "Test", "ODI", "T20I", "IPL"] as CenturyFilter[]).map((item) => (
          <button type="button" role="tab" aria-selected={filter === item} onClick={() => setFilter(item)} key={item}>{item}</button>
        ))}
      </div>
      {current && (
        <div className="century-feature">
          <button className="century-feature-image" type="button" onClick={() => setDialogOpen(true)} aria-label={`Open details for ${current.runs} against ${current.opponent}`}>
            <Image
              key={currentImage.src}
              src={currentImage.src}
              alt={currentImage.alt}
              fill
              sizes="(max-width: 900px) 92vw, 62vw"
              loading="lazy"
              style={{ objectPosition: currentImage.position ?? "center" }}
            />
            <span><Expand aria-hidden="true" /> Open innings</span>
          </button>
          <div className="century-feature-score">
            <span>{current.format} · {longDate(current.date)}</span>
            <strong>{current.runs}</strong>
            <h3>vs {current.opponent}</h3>
            <p>{current.venue}</p>
            <div className="innings-context">
              <span><strong>{current.balls}</strong> balls</span>
              <span>SR <strong>{current.strike_rate}</strong></span>
              <span><strong>{current.fours}</strong>×4 · <strong>{current.sixes}</strong>×6</span>
              <span className="impact-badge">KLR01 Impact: <strong>{current.impact_score}</strong></span>
            </div>
            {"match_context" in current && <small className="century-match-context">{current.match_context} · {current.milestone}</small>}
            <small className="image-context-note">{currentImage.context}</small>
          </div>
        </div>
      )}
      <div className="century-grid">
        {filtered.slice(0, visibleCount).map((century, index) => {
          const image = centuryImage(century.date);
          return (
            <button
              className={index === currentIndex ? "century-card selected" : "century-card"}
              type="button"
              onClick={() => {
                setSelected(index);
                setDialogOpen(true);
              }}
              key={`${century.match_id}-${century.innings_number}`}
            >
              <div>
                <Image src={image.src} alt="" fill sizes="(max-width: 680px) 92vw, (max-width: 1100px) 46vw, 30vw" loading="lazy" aria-hidden="true" style={{ objectPosition: image.position ?? "center" }} />
              </div>
              <span>{String(index + 1).padStart(2, "0")} · {century.format}</span>
              <strong>{century.runs}</strong>
              <p>vs {century.opponent}</p>
              <small>{century.date}</small>
              <ChevronRight aria-hidden="true" />
            </button>
          );
        })}
      </div>
      {visibleCount < filtered.length && (
        <button className="outline-action" type="button" onClick={() => setVisibleCount(filtered.length)}>
          Show all {filtered.length} innings <ChevronRight aria-hidden="true" />
        </button>
      )}
      {current && (
        <MediaDialog open={dialogOpen} titleId="century-dialog-title" onClose={() => setDialogOpen(false)} onPrevious={() => move(-1)} onNext={() => move(1)}>
          <div className="century-dialog-image">
            <Image src={currentImage.src} alt={currentImage.alt} fill sizes="90vw" style={{ objectPosition: currentImage.position ?? "center" }} />
          </div>
          <div className="century-dialog-copy">
            <span>{current.format} · {longDate(current.date)}</span>
            <h2 id="century-dialog-title">{current.runs} <i>vs {current.opponent}</i></h2>
            <p>{current.venue}</p>
            <dl>
              <div><dt>Balls</dt><dd>{current.balls}</dd></div>
              <div><dt>Strike rate</dt><dd>{current.strike_rate}</dd></div>
              <div><dt>Boundaries</dt><dd>{current.fours}×4 · {current.sixes}×6</dd></div>
              <div><dt>Result</dt><dd>{current.result}</dd></div>
            </dl>
            {"match_context" in current && <p className="century-dialog-milestone">{current.match_context} · {current.milestone}</p>}
            <small>Career data is reconciled through 26 August 2026. {currentImage.context}.</small>
          </div>
        </MediaDialog>
      )}
    </section>
  );
}

export function GallerySection() {
  const [filter, setFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(10);
  const [selected, setSelected] = useState<number | null>(null);
  const gallery = useMemo(() => imageManifest.records, []);
  const filtered = useMemo(() => filter === "All" ? gallery : gallery.filter((image) => image.galleryCategories.includes(filter)), [filter, gallery]);
  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const active = selected === null ? null : visible[selected];

  useEffect(() => {
    setVisibleCount(10);
    setSelected(null);
  }, [filter]);

  function move(step: number) {
    if (selected === null) return;
    setSelected((selected + step + visible.length) % visible.length);
  }

  const categories = ["All", "International", "Test", "ODI", "T20I", "IPL", "Domestic/Early Career", "Wicketkeeping", "Centuries/Celebrations", "Off Field"];

  return (
    <section id="gallery" className="gallery-section" aria-labelledby="gallery-title">
      <div className="section-heading gallery-heading">
        <div className="eyebrow">05 / {gallery.length} restored + supplemental photographs</div>
        <h2 id="gallery-title">FRAME <i>BY FRAME</i></h2>
        <p>All valid originals and supplemental photographs share one audited manifest. Filter by format, role or context; ten photographs load at a time and every visible item opens in the keyboard-accessible lightbox.</p>
      </div>
      <div className="gallery-toolbar" aria-label="Gallery category filter">
        {categories.map((category) => {
          const count = category === "All" ? gallery.length : gallery.filter((image) => image.galleryCategories.includes(category)).length;
          const activePrimary = filter === category || (category === "IPL" && ["RCB", "Punjab Kings", "LSG", "Delhi Capitals"].includes(filter));
          return <button type="button" aria-pressed={activePrimary} onClick={() => setFilter(category)} key={category}>{category} <span>{count}</span></button>;
        })}
      </div>
      {(filter === "IPL" || ["RCB", "Punjab Kings", "LSG", "Delhi Capitals"].includes(filter)) && (
        <div className="gallery-subtoolbar" aria-label="IPL franchise filter">
          <span>Franchise</span>
          {["RCB", "Punjab Kings", "LSG", "Delhi Capitals"].map((franchise) => (
            <button type="button" aria-pressed={filter === franchise} disabled={!gallery.some((image) => image.galleryCategories.includes(franchise))} onClick={() => setFilter(franchise)} key={franchise}>
              {franchise} <span>{gallery.filter((image) => image.galleryCategories.includes(franchise)).length}</span>
            </button>
          ))}
        </div>
      )}
      <p className="gallery-counter" role="status" aria-live="polite">Showing {visible.length} of {filtered.length}</p>
      <div className="masonry-gallery">
        {visible.map((image, index) => (
          <figure className="gallery-item" style={{ maxWidth: `${image.maxRecommendedCssWidthPx ?? Math.min(image.width, 1080)}px` }} key={image.id}>
            <button type="button" onClick={() => setSelected(index)} aria-label={`Open ${image.caption.toLowerCase()} archive image ${index + 1}`}>
              <Image
                src={image.currentPath}
                alt={`KL Rahul — ${image.caption}`}
                width={image.width}
                height={image.height}
                sizes="(max-width: 560px) 92vw, (max-width: 960px) 46vw, 30vw"
                loading="lazy"
              />
              <span><Expand aria-hidden="true" /></span>
            </button>
            <figcaption><span>{String(index + 1).padStart(2, "0")}</span><b>{image.caption}</b><small>{image.collectionSource} · {image.verificationConfidence}</small></figcaption>
          </figure>
        ))}
      </div>
      {visibleCount < filtered.length && (
        <button className="outline-action gallery-more" type="button" onClick={() => setVisibleCount((value) => Math.min(value + 10, filtered.length))}>
          <Images aria-hidden="true" /> Load next 10 <span>{visible.length} / {filtered.length}</span>
        </button>
      )}
      {active && (
        <MediaDialog open={selected !== null} titleId="gallery-dialog-title" onClose={() => setSelected(null)} onPrevious={() => move(-1)} onNext={() => move(1)}>
          <div className="lightbox-image">
            <Image src={active.currentPath} alt={`KL Rahul — ${active.caption}`} width={active.width} height={active.height} sizes="96vw" style={{ maxWidth: `${active.maxRecommendedCssWidthPx ?? Math.min(active.width, 1080)}px` }} />
          </div>
          <div className="lightbox-caption">
            <span>{String((selected ?? 0) + 1).padStart(2, "0")} / {visible.length}</span>
            <h2 id="gallery-dialog-title">{active.caption}</h2>
            <p>{active.verificationConfidence}. {active.eventVerified ? "The event label follows the merged audit." : "No match-specific claim is attached beyond the verified era, team or format."}</p>
          </div>
        </MediaDialog>
      )}
    </section>
  );
}
