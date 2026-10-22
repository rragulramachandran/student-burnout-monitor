# Student Burnout Monitor

A browser-based well-being tracking prototype for recording daily check-ins, viewing trends, and calculating a transparent, rule-based burnout-risk indicator.

## Features

- Daily check-ins for mood, stress, sleep, study hours, and motivation
- Rule-based indicator and explanatory recommendations
- Weekly and monthly trend views
- Searchable check-in history
- Streaks and achievements
- JSON/CSV export
- Light/dark mode and responsive layout
- Browser-local data persistence

## How it works

```text
Browser interface
      ↓
Vanilla JavaScript
      ↓
Local scoring and recommendation logic
      ↓
Browser LocalStorage
```

This version uses HTML, CSS, vanilla JavaScript, and browser LocalStorage. It has no backend, database, cloud synchronisation, or external AI service. Records are stored in the current browser profile and may be lost if its site data is cleared.

## Risk indicator and limitations

The prototype normalises its rule-based score to a 0–100 range:

| Score | Application label |
| ---: | --- |
| 0–39 | Healthy |
| 40–69 | Moderate Risk |
| 70–100 | High Risk |

These are **application-defined labels**, not clinically validated thresholds. The score is informational only and must not be used as a medical or psychological diagnosis or as a substitute for professional support.

## Run locally

From the repository root, start a local static server:

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Then open [http://127.0.0.1:8765/index.html](http://127.0.0.1:8765/index.html).

If your system uses `python3`, run `python3 -m http.server 8765 --bind 127.0.0.1` instead.

## Project status

Prototype / learning project. Planned future work includes optional backend persistence, secure multi-user storage, improved trend analysis, explainable recommendations, automated tests, and deployment. These are roadmap items, not claims about the current implementation.
