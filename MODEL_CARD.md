# Model Card — KLR01 Runs Predictor

## Status

Trained baseline release. Artifacts are generated from 421 regulation innings extracted from the supplied Cricsheet archives. Five super-over innings are retained in the raw cleaned export but excluded from modelling and normal career aggregates.

## Intended objective

Estimate a distribution for runs in a future innings and calibrated probabilities for 30+, 50+, and 100+. Output must be described as an estimate, never certainty.

## Features

Format, opponent, venue, team, batting position, innings number, chase state, year, previous-five and previous-ten runs averages, recent strike rate, career average/strike rate before the innings, and opponent/venue/format averages before the innings. Every historical aggregate is shifted before expanding or rolling calculations.

## Evaluation

The first ten innings initialize rolling history. The remaining observations use an 80/20 chronological split: 328 training innings and 83 test innings from 5 May 2024 through 15 August 2026.

Runs models compared: median dummy, Ridge, random forest and gradient boosting. Ridge was selected by MAE: **25.623 runs**, RMSE **34.365**, R² **−0.014**. Random forest had the best R² (**0.028**) but worse MAE (**26.032**). This confirms low point-prediction skill and high outcome variance.

The selected 30+, 50+ and 100+ classifiers are five-fold sigmoid-calibrated versions of the strongest ROC-AUC candidate. Their API probabilities receive a monotonic projection so `P(100+) ≤ P(50+) ≤ P(30+)`.

## Limitations

Cricket scores are high variance and sensitive to selection, pitch, weather, match situation, injury, and tactical role. Historical data can encode era, opponent, venue, and selection biases. A model cannot know future match conditions with certainty.

The held-out test contains only six 100+ innings, so century-probability evaluation is especially unstable. Venue histories are sparse, franchise teams change, and Cricsheet does not consistently encode pitch, weather, injury, expected batting role or universal home/away context. The model is a portfolio demonstration, not a betting or selection tool.

## Leakage safeguards

All rolling and career aggregates must be shifted by one innings. Random row splits are prohibited. Future result, final team score, and post-innings context cannot be prediction features.
