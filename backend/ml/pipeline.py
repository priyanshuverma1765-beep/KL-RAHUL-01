"""KLR01 Cricsheet ETL, leakage-safe features, model training, and web exports."""

from __future__ import annotations

import json
import math
import zipfile
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.calibration import CalibratedClassifierCV
from sklearn.dummy import DummyClassifier, DummyRegressor
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor, RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import accuracy_score, f1_score, mean_absolute_error, mean_squared_error, precision_score, r2_score, recall_score, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "backend" / "data" / "raw"
PROCESSED = ROOT / "backend" / "data" / "processed"
ARTIFACTS = ROOT / "backend" / "artifacts"
WEB_DATA = ROOT / "public" / "data"
PLAYER = "KL Rahul"

ARCHIVES = {
    "ipl_male_json.zip": "IPL",
    "odis_male_json.zip": "ODI",
    "t20s_male_json.zip": "T20I",
    "tests_male_json.zip": "Test",
}

NOT_OUT_KINDS = {"retired hurt", "retired not out"}


def safe_date(value: object) -> str | None:
    if value is None:
        return None
    return str(value)


def match_result(outcome: dict, team: str) -> str:
    if outcome.get("winner"):
        return "win" if outcome["winner"] == team else "loss"
    if outcome.get("result") == "tie":
        return "tie"
    return "no_result"


def batting_order(innings: dict) -> list[str]:
    order: list[str] = []
    for over in innings.get("overs", []):
        for delivery in over.get("deliveries", []):
            for player in (delivery.get("batter"), delivery.get("non_striker")):
                if player and player not in order:
                    order.append(player)
    return order


def team_totals(innings: dict) -> tuple[int, int]:
    runs = 0
    wickets = 0
    for over in innings.get("overs", []):
        for delivery in over.get("deliveries", []):
            runs += int(delivery.get("runs", {}).get("total", 0))
            wickets += sum(w.get("kind") not in NOT_OUT_KINDS for w in delivery.get("wickets", []))
    return runs, wickets


def player_innings(match_id: str, source: str, fmt: str, match: dict) -> list[dict]:
    info = match.get("info", {})
    players = info.get("players", {})
    team = next((team for team, names in players.items() if PLAYER in names), None)
    if team is None:
        return []
    opponent = next((name for name in info.get("teams", []) if name != team), "Unknown")
    date = safe_date((info.get("dates") or [None])[0])
    outcome = info.get("outcome", {})
    rows: list[dict] = []
    all_innings = match.get("innings", [])

    for number, innings in enumerate(all_innings, start=1):
        if innings.get("team") != team:
            continue
        order = batting_order(innings)
        if PLAYER not in order:
            continue
        runs = balls = fours = sixes = dots = 0
        dismissals: list[dict] = []
        for over in innings.get("overs", []):
            for delivery in over.get("deliveries", []):
                if delivery.get("batter") == PLAYER:
                    batter_runs = int(delivery.get("runs", {}).get("batter", 0))
                    runs += batter_runs
                    if "wides" not in delivery.get("extras", {}):
                        balls += 1
                        dots += batter_runs == 0
                    non_boundary = bool(delivery.get("runs", {}).get("non_boundary", False))
                    fours += batter_runs == 4 and not non_boundary
                    sixes += batter_runs == 6 and not non_boundary
                dismissals.extend(w for w in delivery.get("wickets", []) if w.get("player_out") == PLAYER)

        team_score, team_wickets = team_totals(innings)
        dismissal = dismissals[0] if dismissals else {}
        kind = dismissal.get("kind")
        is_out = bool(kind and kind not in NOT_OUT_KINDS)
        winner = outcome.get("winner")
        target = innings.get("target", {})
        rows.append(
            {
                "match_id": match_id,
                "source_archive": source,
                "date": date,
                "format": fmt,
                "team": team,
                "opponent": opponent,
                "venue": info.get("venue") or "Unknown",
                "city": info.get("city") or "Unknown",
                "event": info.get("event", {}).get("name") or "Unknown",
                "season": str(info.get("season", "Unknown")),
                "innings_number": number,
                "super_over": bool(innings.get("super_over", False)),
                "batting_position": order.index(PLAYER) + 1,
                "runs": runs,
                "balls": balls,
                "fours": fours,
                "sixes": sixes,
                "dots": dots,
                "strike_rate": round(100 * runs / balls, 2) if balls else 0.0,
                "dismissed": is_out,
                "not_out": not is_out,
                "dismissal_kind": kind or "not out",
                "fielder": (dismissal.get("fielders") or [{}])[0].get("name"),
                "team_score": team_score,
                "team_wickets": team_wickets,
                "team_run_share": round(runs / team_score, 4) if team_score else 0.0,
                "chasing": bool(target),
                "target_runs": target.get("runs"),
                "winner": winner,
                "result": match_result(outcome, team),
                "outcome_method": outcome.get("method"),
            }
        )
    return rows


def extract() -> tuple[pd.DataFrame, pd.DataFrame]:
    innings_rows: list[dict] = []
    match_rows: list[dict] = []
    for archive_name, fmt in ARCHIVES.items():
        path = RAW / archive_name
        with zipfile.ZipFile(path) as archive:
            for entry in archive.namelist():
                if not entry.endswith(".json"):
                    continue
                match = json.loads(archive.read(entry))
                info = match.get("info", {})
                team = next((t for t, names in info.get("players", {}).items() if PLAYER in names), None)
                if team is None:
                    continue
                opponent = next((t for t in info.get("teams", []) if t != team), "Unknown")
                date = safe_date((info.get("dates") or [None])[0])
                rows = player_innings(Path(entry).stem, archive_name, fmt, match)
                innings_rows.extend(rows)
                match_rows.append(
                    {
                        "match_id": Path(entry).stem,
                        "date": date,
                        "format": fmt,
                        "team": team,
                        "opponent": opponent,
                        "venue": info.get("venue") or "Unknown",
                        "result": match_result(info.get("outcome", {}), team),
                        "batted": bool(rows),
                    }
                )
    innings = pd.DataFrame(innings_rows)
    matches = pd.DataFrame(match_rows)
    innings["date"] = pd.to_datetime(innings["date"])
    matches["date"] = pd.to_datetime(matches["date"])
    innings = innings.sort_values(["date", "match_id", "innings_number"]).reset_index(drop=True)
    matches = matches.sort_values(["date", "match_id"]).reset_index(drop=True)
    return innings, matches


def prior_ratio(num: pd.Series, den: pd.Series) -> pd.Series:
    return num.shift(1).cumsum() / den.shift(1).cumsum().replace(0, np.nan)


def grouped_prior_average(df: pd.DataFrame, group: str) -> pd.Series:
    shifted_runs = df.groupby(group, sort=False)["runs"].shift(1)
    return shifted_runs.groupby(df[group]).expanding().mean().reset_index(level=0, drop=True)


def features(innings: pd.DataFrame) -> pd.DataFrame:
    df = innings.loc[~innings["super_over"]].copy().reset_index(drop=True)
    df["year"] = df["date"].dt.year
    df["prev5_avg"] = df["runs"].shift(1).rolling(5, min_periods=1).mean()
    df["prev10_avg"] = df["runs"].shift(1).rolling(10, min_periods=1).mean()
    prev_runs = df["runs"].shift(1).rolling(5, min_periods=1).sum()
    prev_balls = df["balls"].shift(1).rolling(5, min_periods=1).sum()
    df["recent_strike_rate"] = 100 * prev_runs / prev_balls.replace(0, np.nan)
    df["career_average_before"] = prior_ratio(df["runs"], df["dismissed"].astype(int))
    df["career_strike_rate_before"] = 100 * prior_ratio(df["runs"], df["balls"])
    df["opponent_average_before"] = grouped_prior_average(df, "opponent")
    df["venue_average_before"] = grouped_prior_average(df, "venue")
    df["format_average_before"] = grouped_prior_average(df, "format")

    # KLR Form Index: documented, unofficial 0-100 trailing-ten metric.
    roll_runs = df["runs"].rolling(10, min_periods=1)
    roll_balls = df["balls"].rolling(10, min_periods=1).sum()
    avg_score = (roll_runs.mean() / 60).clip(0, 1)
    sr_score = ((100 * roll_runs.sum() / roll_balls.replace(0, np.nan)) / 150).clip(0, 1)
    freq30 = df["runs"].ge(30).rolling(10, min_periods=1).mean()
    freq50 = df["runs"].ge(50).rolling(10, min_periods=1).mean()
    consistency = (1 - roll_runs.std(ddof=0) / (roll_runs.mean() + 20)).clip(0, 1)
    df["form_index"] = (35 * avg_score + 25 * sr_score + 20 * freq30 + 15 * freq50 + 5 * consistency).round(1)

    format_par = df["format"].map({"Test": 55.0, "ODI": 90.0, "T20I": 125.0, "IPL": 130.0})
    run_component = (df["runs"] / 100).clip(0, 1) * 45
    tempo_component = (df["strike_rate"] / format_par).clip(0, 1.5) / 1.5 * 20
    share_component = (df["team_run_share"] / 0.5).clip(0, 1) * 20
    result_component = df["result"].eq("win").astype(int) * 10
    milestone_component = np.select([df["runs"].ge(100), df["runs"].ge(50), df["runs"].ge(30)], [5, 3, 1], default=0)
    df["impact_score"] = (run_component + tempo_component + share_component + result_component + milestone_component).clip(0, 100).round(1)
    return df


FEATURES = ["prev5_avg", "prev10_avg", "recent_strike_rate", "career_average_before", "career_strike_rate_before", "opponent_average_before", "venue_average_before", "format_average_before", "year", "innings_number", "batting_position", "chasing"]
CATEGORICAL = ["format", "opponent", "venue", "team"]


def preprocessor() -> ColumnTransformer:
    numeric = Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())])
    categorical = Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))])
    return ColumnTransformer([("numeric", numeric, FEATURES), ("categorical", categorical, CATEGORICAL)])


def regression_metrics(y: pd.Series, pred: np.ndarray) -> dict:
    return {"mae": round(mean_absolute_error(y, pred), 3), "rmse": round(math.sqrt(mean_squared_error(y, pred)), 3), "r2": round(r2_score(y, pred), 3)}


def classification_metrics(y: pd.Series, pred: np.ndarray, probability: np.ndarray) -> dict:
    result = {
        "accuracy": round(accuracy_score(y, pred), 3),
        "precision": round(precision_score(y, pred, zero_division=0), 3),
        "recall": round(recall_score(y, pred, zero_division=0), 3),
        "f1": round(f1_score(y, pred, zero_division=0), 3),
    }
    result["roc_auc"] = round(roc_auc_score(y, probability), 3) if y.nunique() == 2 else None
    return result


def train_models(df: pd.DataFrame) -> dict:
    usable = df.iloc[10:].copy()  # allow rolling context to initialize
    split = int(len(usable) * 0.8)
    train, test = usable.iloc[:split], usable.iloc[split:]
    xcols = FEATURES + CATEGORICAL
    x_train, x_test = train[xcols], test[xcols]
    y_train, y_test = train["runs"], test["runs"]
    regression = {
        "dummy_median": DummyRegressor(strategy="median"),
        "ridge": Ridge(alpha=10.0),
        "random_forest": RandomForestRegressor(n_estimators=350, min_samples_leaf=4, random_state=42, n_jobs=-1),
        "gradient_boosting": GradientBoostingRegressor(n_estimators=180, learning_rate=0.035, max_depth=2, random_state=42, loss="huber"),
    }
    report: dict = {"split": {"method": "chronological_80_20", "train_rows": len(train), "test_rows": len(test), "test_start": str(test["date"].min().date()), "test_end": str(test["date"].max().date())}, "regression": {}, "classification": {}}
    fitted_regression: dict[str, Pipeline] = {}
    for name, estimator in regression.items():
        pipe = Pipeline([("preprocess", preprocessor()), ("model", estimator)])
        pipe.fit(x_train, y_train)
        fitted_regression[name] = pipe
        report["regression"][name] = regression_metrics(y_test, pipe.predict(x_test))
    best_reg = min(report["regression"], key=lambda name: report["regression"][name]["mae"])
    joblib.dump(fitted_regression[best_reg], ARTIFACTS / "runs_regressor.joblib")
    report["selected_regressor"] = best_reg

    for threshold in (30, 50, 100):
        ytr = y_train.ge(threshold).astype(int)
        yte = y_test.ge(threshold).astype(int)
        models = {
            "dummy_prior": DummyClassifier(strategy="prior"),
            "logistic": LogisticRegression(max_iter=3000, class_weight="balanced"),
            "random_forest": RandomForestClassifier(n_estimators=350, min_samples_leaf=4, class_weight="balanced", random_state=42, n_jobs=-1),
            "gradient_boosting": GradientBoostingClassifier(n_estimators=150, learning_rate=0.035, max_depth=2, random_state=42),
        }
        scores: dict = {}
        fitted: dict[str, Pipeline] = {}
        for name, estimator in models.items():
            pipe = Pipeline([("preprocess", preprocessor()), ("model", estimator)])
            pipe.fit(x_train, ytr)
            pred = pipe.predict(x_test)
            probability = pipe.predict_proba(x_test)[:, 1]
            scores[name] = classification_metrics(yte, pred, probability)
            fitted[name] = pipe
        eligible = [name for name in scores if scores[name]["roc_auc"] is not None]
        best = max(eligible, key=lambda name: scores[name]["roc_auc"])
        calibrated = CalibratedClassifierCV(
            Pipeline([("preprocess", preprocessor()), ("model", models[best])]),
            method="sigmoid", cv=5,
        )
        calibrated.fit(x_train, ytr)
        calibrated_pred = calibrated.predict(x_test)
        calibrated_probability = calibrated.predict_proba(x_test)[:, 1]
        scores[f"{best}_sigmoid_calibrated"] = classification_metrics(yte, calibrated_pred, calibrated_probability)
        joblib.dump(calibrated, ARTIFACTS / f"classifier_{threshold}.joblib")
        report["classification"][f"{threshold}_plus"] = {"positive_train": int(ytr.sum()), "positive_test": int(yte.sum()), "models": scores, "selected": f"{best}_sigmoid_calibrated"}
    return report


def aggregate(group: pd.DataFrame) -> dict:
    outs = int(group["dismissed"].sum())
    runs = int(group["runs"].sum())
    balls = int(group["balls"].sum())
    return {
        "matches": int(group["match_id"].nunique()), "innings": len(group), "runs": runs,
        "average": round(runs / outs, 2) if outs else None, "strikeRate": round(100 * runs / balls, 2) if balls else None,
        "highest": int(group["runs"].max()), "hundreds": int(group["runs"].ge(100).sum()),
        "fifties": int(group["runs"].between(50, 99).sum()), "thirties": int(group["runs"].ge(30).sum()),
        "fours": int(group["fours"].sum()), "sixes": int(group["sixes"].sum()), "notOuts": int(group["not_out"].sum()),
    }


def web_export(df: pd.DataFrame, matches: pd.DataFrame, metrics: dict) -> dict:
    by_format = {fmt: aggregate(group) for fmt, group in df.groupby("format", sort=False)}
    overall = aggregate(df)
    centuries = df[df["runs"] >= 100].sort_values(["runs", "date"], ascending=[False, False])
    century_rows = centuries[["match_id", "date", "format", "opponent", "venue", "innings_number", "batting_position", "runs", "balls", "fours", "sixes", "strike_rate", "result", "dismissal_kind", "team_score", "impact_score"]].copy()
    century_rows["date"] = century_rows["date"].dt.strftime("%Y-%m-%d")
    years = []
    for (fmt, year), group in df.groupby(["format", "year"]):
        row = aggregate(group); row.update({"format": fmt, "year": int(year)}); years.append(row)
    opponents = []
    for (fmt, opponent), group in df.groupby(["format", "opponent"]):
        row = aggregate(group); row.update({"format": fmt, "opponent": opponent}); opponents.append(row)
    top_impact = df.nlargest(8, "impact_score")[["date", "format", "opponent", "venue", "runs", "balls", "result", "impact_score"]].copy()
    top_impact["date"] = top_impact["date"].dt.strftime("%Y-%m-%d")
    form = df.tail(60)[["date", "format", "runs", "form_index"]].copy(); form["date"] = form["date"].dt.strftime("%Y-%m-%d")
    return {
        "lastUpdated": str(df["date"].max().date()),
        "coverage": {"start": str(df["date"].min().date()), "end": str(df["date"].max().date()), "matches": int(matches["match_id"].nunique()), "innings": len(df)},
        "overall": overall, "formats": by_format, "centuries": century_rows.to_dict("records"),
        "yearly": years, "opponents": opponents, "topImpact": top_impact.to_dict("records"),
        "formHistory": form.to_dict("records"), "modelMetrics": metrics,
        "formulae": {
            "formIndex": "35% trailing-10 average, 25% trailing strike rate, 20% 30+ frequency, 15% 50+ frequency, 5% consistency; normalized to 0–100.",
            "impactScore": "45% runs, 20% format-adjusted tempo, 20% team-run share, 10% win context, 5% milestone bonus; capped at 100.",
        },
    }


def main() -> None:
    for directory in (PROCESSED, ARTIFACTS, WEB_DATA): directory.mkdir(parents=True, exist_ok=True)
    innings, matches = extract()
    engineered = features(innings)
    innings.to_csv(PROCESSED / "kl_rahul_innings_all.csv", index=False)
    matches.to_csv(PROCESSED / "kl_rahul_matches.csv", index=False)
    engineered.to_csv(PROCESSED / "kl_rahul_innings_features.csv", index=False)
    metrics = train_models(engineered)
    (ARTIFACTS / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    export = web_export(engineered, matches, metrics)
    (WEB_DATA / "klr-archive.json").write_text(json.dumps(export, indent=2, default=str), encoding="utf-8")
    print(json.dumps({"raw_innings": len(innings), "model_innings": len(engineered), "matches": len(matches), "centuries": len(export["centuries"]), "selected_regressor": metrics["selected_regressor"]}, indent=2))


if __name__ == "__main__":
    main()
