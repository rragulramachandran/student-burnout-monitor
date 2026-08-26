# Student Burnout Monitor

> A frontend-only well-being tracking prototype for recording daily habits, visualising trends, and generating rule-based burnout-risk indicators.

## What it does

Student Burnout Monitor lets students record:

- Mood
- Stress
- Sleep duration
- Study hours
- Motivation

It then turns those records into dashboards, historical trends, risk indicators, recommendations, streaks, achievements, and exportable data.

> **Important:** the burnout score is an application-level informational indicator. It is not clinically validated and is **not a medical or psychological diagnosis**.

## Features

- Account creation and local login flow
- Daily well-being check-ins
- Burnout-risk scoring from user-entered data
- Risk explanations
- Rule-based recommendations
- Weekly and monthly trend views
- Check-in history with search/filtering
- Streaks and achievements
- JSON/CSV export
- Light/dark mode
- Responsive interface
- Local browser persistence

## How the score works

The current prototype uses a deterministic weighted formula based on stress, motivation, mood, sleep, and study hours. The result is normalised to **0–100** and grouped into:

| Score | Indicator |
|---:|---|
| 0–39 | Healthy |
| 40–69 | Moderate Risk |
| 70–100 | High Risk |

This is a product prototype, not a clinically validated assessment.

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

There is currently **no backend, database, external AI service, or cloud persistence**. All records and analysis remain in the browser.

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser LocalStorage

## Run locally

Clone the repository and open `index.html` in a modern browser, or serve the directory locally:

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Then visit `http://127.0.0.1:8765/index.html`.

## Roadmap

The prototype is a foundation for a more robust well-being analytics application. Planned engineering work includes:

- Real backend authentication and persistence
- Secure multi-user data storage
- Longitudinal trend analysis
- Better explainability for recommendations
- Optional AI-assisted summaries of user-entered patterns
- Privacy-conscious anonymised institutional analytics
- Automated tests and CI

## Project status

**Prototype / active learning project.** The current version intentionally keeps the architecture simple so the product and scoring workflow can be explored quickly.
