# Student Burnout Monitor

> A frontend-only well-being tracking prototype for recording daily habits, visualising trends, and generating rule-based burnout-risk indicators.

## Overview

Student Burnout Monitor turns daily self-reported data into a simple personal dashboard. Users can record mood, stress, sleep, study hours, and motivation, then review trends and rule-based indicators over time.

> **Important:** The burnout score is an application-level informational indicator. It is not clinically validated and is not a medical or psychological diagnosis.

## Features

- Daily well-being check-ins
- Mood, stress, sleep, study-hour, and motivation tracking
- Rule-based burnout-risk scoring
- Risk explanations and recommendations
- Weekly and monthly trend views
- Searchable check-in history
- Streaks and achievements
- JSON/CSV data export
- Light/dark mode
- Responsive interface
- Browser-local persistence

## Risk scoring

The current prototype uses a deterministic weighted formula based on stress, motivation, mood, sleep, and study hours. The result is normalised to **0–100**:

| Score | Indicator |
|---:|---|
| 0–39 | Healthy |
| 40–69 | Moderate Risk |
| 70–100 | High Risk |

This scoring system is a product prototype and should not be interpreted as a clinical assessment.

## Architecture

```text
Browser UI
   ↓
Vanilla JavaScript modules
   ↓
LocalStorage
   ↓
Local scoring + recommendation engine
```

There is currently **no backend, database, external AI service, or cloud persistence**. User records remain in the browser.

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser LocalStorage

## Run locally

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8765/index.html` in a browser.

## Roadmap

- [ ] Add backend authentication and persistence
- [ ] Add secure multi-user storage
- [ ] Improve longitudinal trend analysis
- [ ] Improve recommendation explainability
- [ ] Add optional AI-assisted summaries
- [ ] Add privacy-conscious anonymised analytics
- [ ] Add automated tests and CI
- [ ] Deploy a public demo

## Project status

**Prototype / active learning project.** The current version intentionally keeps the architecture simple while exploring the product and scoring workflow.
