# Student Burnout Detection and Well-Being Monitoring System

A frontend-only student well-being monitoring application that helps students record daily habits, understand burnout risk patterns, track their well-being over time, and receive personalized recommendations based on their recorded data.

## Overview

The Student Burnout Detection and Well-Being Monitoring System provides a simple way for students to monitor their mood, stress, sleep, study hours, and motivation through daily check-ins.

The application analyzes these inputs using a deterministic burnout risk calculation and presents the results through dashboards, trends, insights, recommendations, streaks, and achievements.

The burnout score is an informational risk indicator based on user-provided data and is **not a medical diagnosis**.

## Features

- Student registration and login
- Personal profile management
- Daily well-being check-ins
- Mood tracking
- Stress level tracking
- Sleep duration tracking
- Study hour tracking
- Motivation tracking
- Burnout risk score calculation
- Healthy, Moderate Risk, and High Risk categories
- Risk explanations
- Personalized rule-based recommendations
- Weekly and monthly well-being trends
- Burnout trend analysis
- Learning and well-being consistency tracking
- Daily check-in streaks
- Longest streak tracking
- Achievement system
- Check-in history
- Search and filtering
- Edit and delete check-ins
- Basic analytics and insights
- JSON and CSV data export
- Light and dark mode
- Responsive design
- LocalStorage-based data persistence

## Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser LocalStorage
- Local image assets

No backend, database, framework, external chart library, or external service is used.

## Data Storage

The application uses the browser's LocalStorage to store:

- User profiles
- Authentication data
- Daily check-ins
- Burnout scores
- Risk categories
- Achievements
- Preferences
- Progress and consistency information

All analysis is performed locally in the browser.

## User Access

Users can:

- Create an account
- Manage their profile
- Record daily well-being information
- View their current burnout risk
- Monitor historical trends
- View personalized recommendations
- Track check-in consistency
- View achievements
- Export their personal records

There are no default student accounts. Users create their own accounts through the registration page.

## Burnout Risk Calculation

The burnout risk score is calculated locally using recorded:

- Mood
- Stress
- Sleep
- Study hours
- Motivation

The resulting score is normalized to a range of:

```text
0 – 100
```

Risk levels are categorized as:

```text
0–39     Healthy
40–69    Moderate Risk
70–100   High Risk
```

These categories are application-level indicators and are not clinically validated measurements.

## Project Structure

```text
student-burnout-monitor/
│
├── index.html
├── login.html
├── register.html
├── dashboard.html
├── checkin.html
├── history.html
├── insights.html
├── analytics.html
├── achievements.html
├── profile.html
├── settings.html
│
├── css/
│   ├── style.css
│   ├── auth.css
│   ├── dashboard.css
│   └── responsive.css
│
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── storage.js
│   ├── dashboard.js
│   ├── checkin.js
│   ├── history.js
│   ├── insights.js
│   ├── analytics.js
│   ├── achievements.js
│   ├── profile.js
│   └── settings.js
│
├── assets/
│   ├── images/
│   └── icons/
│
└── README.md
```

## How to Run

Download or clone the project.

Open the project folder and open:

```text
index.html
```

The application runs directly in a modern web browser.

### Optional Localhost Run

The project can also be run using Python's built-in HTTP server:

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8765/index.html
```

Stop the server with:

```text
Ctrl + C
```

## Important Note

This is a frontend-only student internship project.

The application is intended for self-monitoring and early awareness of behavioral patterns. The burnout risk score is based only on the information entered by the user and should not be considered a medical or psychological diagnosis.
