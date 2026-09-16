"use client";

import Image from "next/image";
import { ArrowUpRight, Bot, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import archiveData from "@/public/data/klr-archive.json";

type FormatName = keyof typeof archiveData.formats;
type Prediction = {
  predicted_runs: number;
  expected_range: number[];
  probability_30_plus: number;
  probability_50_plus: number;
  probability_100_plus: number;
  disclaimer: string;
};

export function AnalyticsSection() {
  const formats = Object.entries(archiveData.formats) as [FormatName, (typeof archiveData.formats)[FormatName]][];
  const opponents = useMemo(() => [...new Set(archiveData.opponents.map((item) => item.opponent))].sort(), []);
  const venues = useMemo(() => [...new Set(archiveData.centuries.map((item) => item.venue))].sort(), []);
  const [format, setFormat] = useState<FormatName>("ODI");
  const [opponent, setOpponent] = useState(opponents[0]);
  const [venue, setVenue] = useState(venues[0]);
  const [position, setPosition] = useState(4);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const selectedModel = archiveData.modelMetrics.selected_regressor as keyof typeof archiveData.modelMetrics.regression;
  const modelMetric = archiveData.modelMetrics.regression[selectedModel];

  async function runPrediction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setPrediction(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 14_000);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, opponent, venue, batting_position: position, innings_number: 1, chasing: false }),
        signal: controller.signal,
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "The estimate could not be generated.");
      setPrediction(body);
      setStatus("success");
    } catch (reason) {
      setStatus("error");
      setError(reason instanceof Error && reason.name !== "AbortError" ? reason.message : "The prediction service timed out. Please try again.");
    } finally {
      clearTimeout(timeout);
    }
  }

  return (
    <section id="analytics" className="analytics-section section-photo" aria-labelledby="analytics-title">
      <Image src="/images/rahul/verified/09-india-blue-editorial-portrait.webp" alt="" fill sizes="100vw" loading="lazy" quality={68} aria-hidden="true" />
      <div className="section-photo-scrim analytics-scrim" />
      <div className="section-heading analytics-heading">
        <div className="eyebrow">04 / Analytics lab</div>
        <h2 id="analytics-title">READ THE <i>GAME</i></h2>
        <p>Official career totals through 26 August 2026, a documented impact score and a deliberately cautious machine-learning estimate.</p>
      </div>
      <div className="record-wall">
        {formats.map(([name, stats]) => (
          <article key={name}>
            <span>{name}</span>
            <strong>{stats.runs.toLocaleString("en-IN")}</strong>
            <p>runs · {stats.innings} innings</p>
            <dl>
              <div><dt>High</dt><dd>{stats.highest}</dd></div>
              <div><dt>Avg</dt><dd>{stats.average}</dd></div>
              <div><dt>SR</dt><dd>{stats.strikeRate}</dd></div>
              <div><dt>100s</dt><dd>{stats.hundreds}</dd></div>
            </dl>
          </article>
        ))}
      </div>
      <div className="analytics-grid">
        <div className="impact-panel">
          <span>Dataset-derived ranking</span>
          <h3>TOP IMPACT INNINGS</h3>
          <div className="impact-list">
            {archiveData.topImpact.slice(0, 6).map((innings, index) => (
              <article key={`${innings.date}-${innings.runs}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{innings.runs}</b>
                <p>vs {innings.opponent}<small>{innings.format} · {innings.date}</small></p>
                <strong>{innings.impact_score}</strong>
              </article>
            ))}
          </div>
          <p className="formula-note">KLR10 is a site-defined metric, not an official cricket statistic. Formula: {archiveData.formulae.impactScore}</p>
        </div>
        <form className="predict-panel" onSubmit={runPrediction} aria-labelledby="predict-title">
          <div className="predict-kicker"><Sparkles aria-hidden="true" /> Experimental model lab</div>
          <h3 id="predict-title">PREDICT THE NEXT INNINGS</h3>
          <p>Historical context in, calibrated estimate out. Cricket remains highly uncertain.</p>
          <div className="predict-output" aria-live="polite">
            {status === "loading" ? (
              <div className="prediction-loading"><RefreshCw aria-hidden="true" /> Calculating historical features…</div>
            ) : prediction ? (
              <>
                <strong>{prediction.predicted_runs}</strong>
                <span>estimated runs · range {prediction.expected_range[0]}–{prediction.expected_range[1]}</span>
                <div className="probabilities">
                  <div><b>{Math.round(prediction.probability_30_plus * 100)}%</b><span>30+</span></div>
                  <div><b>{Math.round(prediction.probability_50_plus * 100)}%</b><span>50+</span></div>
                  <div><b>{Math.round(prediction.probability_100_plus * 100)}%</b><span>100+</span></div>
                </div>
              </>
            ) : (
              <><strong>—</strong><span>Select a verified match context</span></>
            )}
          </div>
          <div className="predict-fields">
            <label>Format<select value={format} onChange={(event) => setFormat(event.target.value as FormatName)}>{Object.keys(archiveData.formats).map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Batting position<input type="number" min="1" max="11" value={position} onChange={(event) => setPosition(Number(event.target.value))} /></label>
            <label>Opponent<select value={opponent} onChange={(event) => setOpponent(event.target.value)}>{opponents.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Venue<select value={venue} onChange={(event) => setVenue(event.target.value)}>{venues.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          {error && <div className="inline-error" role="alert">{error}</div>}
          <button className="primary-action" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Generating estimate" : status === "error" ? "Retry estimate" : "Generate estimate"}<ArrowUpRight aria-hidden="true" />
          </button>
          <small>Chronological holdout: {archiveData.modelMetrics.split.test_start} to {archiveData.modelMetrics.split.test_end}. Selected {selectedModel.replaceAll("_", " ")} MAE {modelMetric.mae}, R² {modelMetric.r2}. This is not betting or selection advice.</small>
        </form>
      </div>
    </section>
  );
}

type AskResponse = {
  answer: string;
  evidence: Array<Record<string, string | number | null>>;
  status: "answered" | "limited" | "unavailable";
  source: string;
};

const suggestedQuestions = [
  "What did Rahul do in the 2025 Champions Trophy?",
  "When did KL Rahul last play a T20I?",
  "How has KL Rahul performed against England?",
  "Compare KL Rahul as opener vs No. 5",
  "Which opponent has he scored most runs against?",
  "What are his best IPL seasons?",
  "Show his Test centuries",
  "What is his recent form?",
];

export function AskKlrSection() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask(text = question) {
    const clean = text.trim();
    if (clean.length < 3 || loading) return;
    setQuestion(clean);
    setLoading(true);
    setError("");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    try {
      const request = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: clean }),
        signal: controller.signal,
      });
      const body = await request.json();
      if (!request.ok) throw new Error(body.error || "Ask KLR could not answer that question.");
      setResponse(body);
    } catch (reason) {
      setResponse(null);
      setError(reason instanceof Error && reason.name !== "AbortError" ? reason.message : "Ask KLR timed out. Please try again.");
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <section id="ask-klr" className="ask-section" aria-labelledby="ask-title">
      <div className="ask-heading">
        <div className="eyebrow">06 / Grounded fan assistant</div>
        <div className="assistant-label"><Bot aria-hidden="true" /> AI FAN ASSISTANT · NOT KL RAHUL</div>
        <h2 id="ask-title">ASK <i>KLR</i></h2>
        <p>This independent AI fan assistant answers from official career totals, verified milestone facts and the local innings archive. It does not speak for, impersonate or represent KL Rahul.</p>
        <div className="grounding-note"><ShieldCheck aria-hidden="true" /><span>No invented scores or match context. Unsupported requests are clearly declined.</span></div>
      </div>
      <div className="ask-console">
        <div className="ask-suggestions" aria-label="Suggested questions">
          {suggestedQuestions.map((suggestion) => <button type="button" onClick={() => ask(suggestion)} disabled={loading} key={suggestion}>{suggestion}</button>)}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); ask(); }}>
          <label htmlFor="ask-question">Your question</label>
          <div className="ask-field">
            <input
              id="ask-question"
              value={question}
              maxLength={300}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="e.g. Which opponent has he scored most runs against?"
              aria-describedby="ask-helper"
            />
            <button type="submit" disabled={loading || question.trim().length < 3}>{loading ? "Searching…" : "Ask"}<ArrowUpRight aria-hidden="true" /></button>
          </div>
          <small id="ask-helper">Ask about verified milestones, formats, opponents, venues, centuries, recent form, IPL seasons, dismissals, roles or batting positions.</small>
        </form>
        {error && <div className="ask-error" role="alert"><strong>Unable to answer</strong><p>{error}</p><button type="button" onClick={() => ask()}>Try again</button></div>}
        <div className={`ask-answer ${response?.status ?? "idle"}`} aria-live="polite" aria-busy={loading}>
          {loading ? (
            <div className="answer-loading"><RefreshCw aria-hidden="true" /> Searching verified innings…</div>
          ) : response ? (
            <>
              <span>{response.status}</span>
              <p>{response.answer}</p>
              {response.evidence.length > 0 && (
                <div className="evidence-list">
                  {response.evidence.slice(0, 10).map((row, index) => (
                    <div key={index}>
                      {Object.entries(row).slice(0, 6).map(([key, value]) => (
                        <span key={key}><small>{key.replaceAll("_", " ")}</small><b>{String(value ?? "—")}</b></span>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              <small className="answer-source">Source: {response.source}</small>
            </>
          ) : (
            <p>Choose a prompt or ask your own question. Answers stay inside the supported dataset.</p>
          )}
        </div>
      </div>
    </section>
  );
}
