# Data sources

The site statistics are derived from the user-supplied official Cricsheet male JSON archives for IPL, ODIs, T20 internationals and Tests. The original ZIP files remain unchanged under `backend/data/raw/`.

Implemented pipeline:

1. Stream every JSON entry directly from each ZIP.
2. Match `KL Rahul` through Cricsheet playing-lineup metadata.
3. Derive batting order, runs, legal balls faced, true boundaries, dismissals, innings totals and outcomes delivery by delivery.
4. Retain super overs separately and exclude them from regulation aggregates and ML.
5. Generate chronological, prior-only features, model artifacts and a dated frontend snapshot.

Public deployment should retain Cricsheet attribution and verify aggregate totals against an independent scorecard source. Shot direction, pitch/weather, injury context and consistent home/away labels are not present and are not fabricated.
