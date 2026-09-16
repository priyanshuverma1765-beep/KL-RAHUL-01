from __future__ import annotations

import json
import os
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS = ROOT / "backend" / "artifacts"
DATA = ROOT / "backend" / "data" / "processed" / "kl_rahul_innings_features.csv"
FEATURES = ["prev5_avg", "prev10_avg", "recent_strike_rate", "career_average_before", "career_strike_rate_before", "opponent_average_before", "venue_average_before", "format_average_before", "year", "innings_number", "batting_position", "chasing"]
CATEGORICAL = ["format", "opponent", "venue", "team"]

app = FastAPI(title="KLR01 Analytics API", version="1.0.0")
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "KLR_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class PredictionRequest(BaseModel):
    format: str = Field(pattern="^(Test|ODI|T20I|IPL)$")
    opponent: str
    venue: str
    batting_position: int = Field(ge=1, le=11)
    innings_number: int = Field(default=1, ge=1, le=4)
    chasing: bool = False


class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=500)


def load_assets():
    if not DATA.exists():
        raise HTTPException(503, "Run backend/ml/pipeline.py before starting the API")
    df = pd.read_csv(DATA)
    models = {"runs": joblib.load(ARTIFACTS / "runs_regressor.joblib")}
    models.update({str(t): joblib.load(ARTIFACTS / f"classifier_{t}.joblib") for t in (30, 50, 100)})
    return df, models


@app.get("/health")
def health(): return {"status": "ok", "artifacts": ARTIFACTS.exists()}


@app.get("/stats")
def stats():
    path = ROOT / "public" / "data" / "klr-archive.json"
    if not path.exists(): raise HTTPException(503, "Processed web data is unavailable")
    return json.loads(path.read_text(encoding="utf-8"))


@app.post("/predict")
def predict(request: PredictionRequest):
    df, models = load_assets()
    history = df.iloc[-1]
    opponent_history = df[df["opponent"] == request.opponent]
    venue_history = df[df["venue"] == request.venue]
    format_history = df[df["format"] == request.format]
    row = {
        "prev5_avg": df.tail(5)["runs"].mean(), "prev10_avg": df.tail(10)["runs"].mean(),
        "recent_strike_rate": 100 * df.tail(5)["runs"].sum() / max(df.tail(5)["balls"].sum(), 1),
        "career_average_before": df["runs"].sum() / max(df["dismissed"].sum(), 1),
        "career_strike_rate_before": 100 * df["runs"].sum() / max(df["balls"].sum(), 1),
        "opponent_average_before": opponent_history["runs"].mean() if len(opponent_history) else history["opponent_average_before"],
        "venue_average_before": venue_history["runs"].mean() if len(venue_history) else history["venue_average_before"],
        "format_average_before": format_history["runs"].mean(), "year": pd.Timestamp.today().year,
        "innings_number": request.innings_number, "batting_position": request.batting_position, "chasing": request.chasing,
        "format": request.format, "opponent": request.opponent, "venue": request.venue,
        "team": "India" if request.format != "IPL" else str(format_history.iloc[-1]["team"]),
    }
    x = pd.DataFrame([row])[FEATURES + CATEGORICAL]
    predicted_runs = max(0.0, float(models["runs"].predict(x)[0]))
    raw_probabilities = {t: float(models[str(t)].predict_proba(x)[0, 1]) for t in (30, 50, 100)}
    # Threshold events are nested by definition. Independent classifiers are
    # calibrated separately, then projected to a coherent monotonic sequence.
    p30 = raw_probabilities[30]
    p50 = min(raw_probabilities[50], p30)
    p100 = min(raw_probabilities[100], p50)
    probabilities = {"probability_30_plus": round(p30, 4), "probability_50_plus": round(p50, 4), "probability_100_plus": round(p100, 4)}
    residual_mae = json.loads((ARTIFACTS / "metrics.json").read_text())["regression"][json.loads((ARTIFACTS / "metrics.json").read_text())["selected_regressor"]]["mae"]
    return {"predicted_runs": round(predicted_runs, 1), "expected_range": [round(max(0, predicted_runs - residual_mae), 1), round(predicted_runs + residual_mae, 1)], **probabilities, "probability_method": "Five-fold sigmoid calibration with monotonic threshold projection.", "disclaimer": "Machine-learning estimate based on historical Cricsheet innings; not a certainty."}


def innings_summary(group: pd.DataFrame) -> dict:
    runs = int(group["runs"].sum())
    balls = int(group["balls"].sum())
    outs = int(group["dismissed"].sum())
    return {
        "innings": int(len(group)), "runs": runs,
        "average": round(runs / outs, 2) if outs else None,
        "strike_rate": round(100 * runs / balls, 2) if balls else None,
        "hundreds": int(group["runs"].ge(100).sum()),
        "fifties": int(group["runs"].between(50, 99).sum()),
        "highest": int(group["runs"].max()) if len(group) else None,
    }


@app.post("/ask")
def ask_klr(request: AskRequest):
    if not DATA.exists(): raise HTTPException(503, "Processed innings data is unavailable")
    df = pd.read_csv(DATA)
    q = request.question.lower().strip()
    evidence: list[dict] = []

    formats = {"test": "Test", "tests": "Test", "odi": "ODI", "odis": "ODI", "t20i": "T20I", "t20": "T20I", "ipl": "IPL"}
    selected_format = next((value for key, value in formats.items() if key in q), None)
    scope = df[df["format"] == selected_format] if selected_format else df

    if "opener" in q or "batting position" in q or "no. 5" in q or "number 5" in q or "no 5" in q:
        if "opener" in q:
            opener = scope[scope["batting_position"].isin([1, 2])]
            if len(opener): evidence.append({"label": "Opener (positions 1-2)", **innings_summary(opener)})
            if "5" in q:
                number_five = scope[scope["batting_position"] == 5]
                if len(number_five): evidence.append({"label": "No. 5", **innings_summary(number_five)})
        else:
            for position in sorted(scope["batting_position"].dropna().astype(int).unique()):
                group = scope[scope["batting_position"] == position]
                if len(group): evidence.append({"label": f"No. {position}", **innings_summary(group)})
        if not evidence: return {"answer": "The supplied data has no innings for that batting-position and format combination.", "evidence": [], "status": "unavailable"}
        details = "; ".join(f"{e['label']}: {e['runs']} runs from {e['innings']} innings, average {e['average']}" for e in evidence)
        return {"answer": f"Across the requested Cricsheet scope, {details}. Batting position is derived from first appearance in the delivery sequence.", "evidence": evidence, "status": "answered"}

    if "most runs" in q and ("opponent" in q or "against" in q):
        grouped = [(opponent, group) for opponent, group in scope.groupby("opponent")]
        opponent, group = max(grouped, key=lambda item: item[1]["runs"].sum())
        summary = {"label": opponent, **innings_summary(group)}; evidence.append(summary)
        return {"answer": f"KL Rahul has the most runs against {opponent} in this dataset scope: {summary['runs']} runs from {summary['innings']} innings, with {summary['hundreds']} hundreds and a highest score of {summary['highest']}.", "evidence": evidence, "status": "answered"}

    if ("highest" in q and "score" in q) or "best innings" in q or "top innings" in q:
        ranked = scope.sort_values(["runs", "impact_score"], ascending=[False, False]).head(10)
        evidence = ranked[["date", "format", "runs", "balls", "opponent", "venue", "result", "impact_score"]].to_dict("records")
        leader = ranked.iloc[0]
        return {"answer": f"His highest score in the requested scope is {int(leader['runs'])} against {leader['opponent']} at {leader['venue']}. The innings came from {int(leader['balls'])} balls and has a KLR Impact Score of {leader['impact_score']}.", "evidence": evidence, "status": "answered"}

    if "impact" in q:
        ranked = scope.nlargest(10, "impact_score")
        evidence = ranked[["date", "format", "runs", "balls", "opponent", "venue", "result", "impact_score"]].to_dict("records")
        leader = ranked.iloc[0]
        return {"answer": f"The highest KLR Impact Score in this scope is {leader['impact_score']} for {int(leader['runs'])} against {leader['opponent']}. Impact Score is the documented KLR10 metric, not an official cricket statistic.", "evidence": evidence, "status": "answered"}

    if "recent form" in q or "last 5" in q or "last five" in q or "last 10" in q or "last ten" in q:
        count = 10 if "10" in q or "ten" in q else 5
        recent = scope.sort_values(["date", "match_id"]).tail(count)
        summary = innings_summary(recent)
        evidence = recent[["date", "format", "runs", "balls", "opponent", "venue", "form_index"]].sort_values("date", ascending=False).to_dict("records")
        return {"answer": f"Across his latest {len(recent)} innings in this scope, KL Rahul scored {summary['runs']} runs at an average of {summary['average']} and strike rate of {summary['strike_rate']}. These are the latest innings available in the supplied dataset, ending {recent['date'].max()}.", "evidence": evidence, "status": "answered"}

    if "form index" in q or "form score" in q:
        latest = scope.sort_values(["date", "match_id"]).iloc[-1]
        history = scope.sort_values(["date", "match_id"]).tail(10)
        evidence = history[["date", "format", "runs", "opponent", "form_index"]].sort_values("date", ascending=False).to_dict("records")
        return {"answer": f"The latest available KLR Form Index is {latest['form_index']} after the innings on {latest['date']}. This is a proprietary trailing-ten metric, not an official statistic.", "evidence": evidence, "status": "answered"}

    if "dismiss" in q or "gotten out" in q or "gets out" in q:
        dismissed = scope[scope["dismissed"] == True]
        patterns = dismissed.groupby("dismissal_kind").size().sort_values(ascending=False)
        evidence = [{"label": str(kind), "dismissals": int(count), "share_percent": round(100 * count / len(dismissed), 1)} for kind, count in patterns.items()]
        leader = evidence[0]
        return {"answer": f"The most frequent recorded dismissal in this scope is {leader['label']}: {leader['dismissals']} dismissals ({leader['share_percent']}% of recorded outs).", "evidence": evidence, "status": "answered"}

    venue = next((name for name in sorted(df["venue"].dropna().unique(), key=len, reverse=True) if name.lower() in q), None)
    if venue:
        group = scope[scope["venue"] == venue]
        summary = {"label": venue, **innings_summary(group)}; evidence.append(summary)
        return {"answer": f"At {venue}, KL Rahul scored {summary['runs']} runs in {summary['innings']} innings at an average of {summary['average']} and strike rate of {summary['strike_rate']}; his highest was {summary['highest']}.", "evidence": evidence, "status": "answered"}

    opponent = next((name for name in sorted(df["opponent"].dropna().unique(), key=len, reverse=True) if name.lower() in q), None)
    if opponent:
        group = scope[scope["opponent"] == opponent]
        if not len(group): return {"answer": f"No {selected_format or 'requested'} innings against {opponent} exist in the supplied coverage.", "evidence": [], "status": "unavailable"}
        summary = {"label": opponent, **innings_summary(group)}; evidence.append(summary)
        return {"answer": f"Against {opponent}, KL Rahul scored {summary['runs']} runs in {summary['innings']} innings at an average of {summary['average']} and strike rate of {summary['strike_rate']}. He made {summary['hundreds']} hundreds and {summary['fifties']} fifties; his highest was {summary['highest']}.", "evidence": evidence, "status": "answered"}

    if "centur" in q or "hundred" in q:
        centuries = scope[scope["runs"] >= 100].sort_values(["runs", "date"], ascending=[False, False])
        if not len(centuries): return {"answer": "No centuries match that format or context in the supplied data.", "evidence": [], "status": "unavailable"}
        evidence = centuries.head(10)[["date", "format", "runs", "balls", "opponent", "venue", "result"]].to_dict("records")
        return {"answer": f"I found {len(centuries)} {selected_format or 'regulation'} centuries. The highest in this scope is {int(centuries.iloc[0]['runs'])} against {centuries.iloc[0]['opponent']} at {centuries.iloc[0]['venue']}.", "evidence": evidence, "status": "answered"}

    if "season" in q or ("ipl" in q and ("best" in q or "year" in q)):
        ipl = df[df["format"] == "IPL"]
        seasons = []
        for season, group in ipl.groupby("season"):
            seasons.append({"label": str(season), **innings_summary(group)})
        seasons.sort(key=lambda row: row["runs"], reverse=True)
        evidence = seasons[:5]
        return {"answer": "By runs in the supplied IPL coverage, his leading seasons are " + ", ".join(f"{e['label']} ({e['runs']})" for e in evidence) + ".", "evidence": evidence, "status": "answered"}

    if "role" in q or "changed" in q or "evolution" in q:
        role_scope = df[df["format"] == (selected_format or "ODI")].copy()
        yearly = role_scope.groupby("year").agg(innings=("runs", "size"), average_position=("batting_position", "mean"), runs=("runs", "sum")).reset_index()
        evidence = [{"label": str(int(row.year)), "innings": int(row.innings), "average_batting_position": round(float(row.average_position), 2), "runs": int(row.runs)} for row in yearly.itertuples()]
        return {"answer": f"The {selected_format or 'ODI'} role history shows his average recorded batting position moving from {evidence[0]['average_batting_position']} in {evidence[0]['label']} to {evidence[-1]['average_batting_position']} in {evidence[-1]['label']}. Use the yearly evidence below to see the progression; this describes position, not tactical intent.", "evidence": evidence, "status": "answered"}

    if "england" in q and "overseas" in q:
        return {"answer": "Cricsheet identifies opponents and venues but does not provide a reliable universal home/away country field for every archive. I can answer performance against England, but I will not label every innings as overseas without a verified venue-country mapping.", "evidence": [], "status": "limited"}

    if selected_format:
        summary = innings_summary(scope); evidence.append({"label": selected_format, **summary})
        return {"answer": f"In {selected_format}s within the supplied Cricsheet coverage, KL Rahul scored {summary['runs']} runs from {summary['innings']} innings at an average of {summary['average']} and strike rate of {summary['strike_rate']}, with {summary['hundreds']} hundreds and {summary['fifties']} fifties.", "evidence": evidence, "status": "answered"}

    return {"answer": "I could not map that question to a supported statistical query. Ask about a format, opponent, venue, centuries, highest scores, recent form, Form Index, Impact Score, dismissals, IPL seasons, batting position, or role evolution.", "evidence": [], "status": "unavailable"}
