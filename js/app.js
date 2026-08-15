const PAGES = {
  dashboard: "Home",
  checkin: "Check-In",
  history: "History",
  insights: "Insights",
  analytics: "Analytics",
  achievements: "Achievements",
  profile: "Profile",
  settings: "Settings"
};

document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
  document.querySelectorAll("button[data-theme]").forEach(button => button.addEventListener("click", toggleTheme));
  const page = document.body.dataset.page;
  if (page === "login") initLogin();
  if (page === "register") initRegister();
  if (page && PAGES[page]) initAppPage(page);
});

function applyTheme() {
  document.documentElement.dataset.theme = getPreferences().theme || "light";
}

function toggleTheme() {
  const prefs = getPreferences();
  prefs.theme = prefs.theme === "dark" ? "light" : "dark";
  savePreferences(prefs);
  applyTheme();
}

function toast(text) {
  const root = document.getElementById("toast-root");
  if (!root) return;
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = text;
  root.appendChild(item);
  setTimeout(() => item.remove(), 2600);
}

function initLogin() {
  if (getCurrentUser()) window.location.href = "dashboard.html";
  const form = document.getElementById("loginForm");
  const message = document.getElementById("loginMessage");
  form.addEventListener("submit", event => {
    event.preventDefault();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const user = getUsers().find(item => item.email.toLowerCase() === email && item.password === password);
    if (!user) {
      message.textContent = "Invalid email or password.";
      return;
    }
    setCurrentUser(user.id);
    window.location.href = "dashboard.html";
  });
}

function initRegister() {
  if (getCurrentUser()) window.location.href = "dashboard.html";
  const form = document.getElementById("registerForm");
  const message = document.getElementById("registerMessage");
  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const users = getUsers();
    const email = (data.email || "").trim().toLowerCase();
    if (!data.name || !email || !data.password || !data.confirmPassword) {
      message.textContent = "Please fill every required field.";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.textContent = "Please enter a valid email.";
      return;
    }
    if (users.some(user => user.email.toLowerCase() === email)) {
      message.textContent = "This email is already registered.";
      return;
    }
    if (data.password.length < 6) {
      message.textContent = "Password must be at least 6 characters.";
      return;
    }
    if (data.password !== data.confirmPassword) {
      message.textContent = "Passwords do not match.";
      return;
    }
    users.push({
      id: makeId("user"),
      name: data.name.trim(),
      email,
      password: data.password,
      course: data.course?.trim() || "",
      academicYear: data.academicYear?.trim() || "",
      institution: data.institution?.trim() || "",
      profileImage: "",
      createdAt: todayISO()
    });
    saveUsers(users);
    message.textContent = "Account created. Redirecting to login.";
    setTimeout(() => window.location.href = "login.html", 700);
  });
}

function initAppPage(page) {
  if (!requireLogin()) return;
  buildHeader(page);
  checkAchievements(getCurrentUser().id);
  const renderers = { dashboard: renderDashboard, checkin: renderCheckin, history: renderHistory, insights: renderInsights, analytics: renderAnalytics, achievements: renderAchievements, profile: renderProfile, settings: renderSettings };
  renderers[page]();
}

function buildHeader(page) {
  const header = document.getElementById("appHeader");
  header.innerHTML = `
    <a class="brand" href="dashboard.html"><span class="brand-mark">${icon("leaf")}</span><span>WellTrack</span></a>
    <nav class="nav" aria-label="Main navigation">
      ${Object.entries(PAGES).map(([key, label]) => `<a class="${key === page ? "active" : ""}" href="${key}.html">${label}</a>`).join("")}
      <button type="button" data-theme>Theme</button>
      <button type="button" data-logout>Logout</button>
    </nav>`;
  header.querySelector("button[data-theme]").addEventListener("click", toggleTheme);
  header.querySelector("[data-logout]").addEventListener("click", logout);
}

function icon(name) {
  const icons = {
    leaf: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 4c-7.5.4-12.7 3.3-14.7 8.3C3.7 16.2 6.2 20 10.4 20c5.4 0 8.8-5.3 9.6-16Z" stroke="currentColor" stroke-width="2"/><path d="M5 19c3-5.2 6.9-8.4 12-10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    moon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.7 8.7 0 1 0 20 15.5Z" stroke="currentColor" stroke-width="2"/></svg>',
    book: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4V4Z" stroke="currentColor" stroke-width="2"/><path d="M5 16V4" stroke="currentColor" stroke-width="2"/></svg>',
    pulse: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 12h4l2-5 4 10 2-5h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    spark: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l2.4 6.1L21 12l-6.6 2.9L12 21l-2.4-6.1L3 12l6.6-2.9L12 3Z" stroke="currentColor" stroke-width="2"/></svg>'
  };
  return icons[name] || "";
}

function pageTitle(title, text, action = "") {
  return `<div class="page-title"><div><h1>${title}</h1><p>${text}</p></div><div>${action}</div></div>`;
}

function empty(text) {
  return `<div class="empty">${text}</div>`;
}

function renderDashboard() {
  const user = getCurrentUser();
  const checkins = userCheckins(user.id);
  const latest = checkins.at(-1);
  const streak = calculateStreak(checkins);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  document.getElementById("app").innerHTML = `
    ${pageTitle(`${greeting}, ${user.name.split(" ")[0]}.`, "Here's a quick look at how you're doing.", `<a class="button" href="checkin.html">Daily Check-In</a>`)}
    ${latest && checkins.at(-2) && latest.burnoutScore - checkins.at(-2).burnoutScore >= 12 ? `<div class="notice">Your recorded burnout risk has increased recently. Review your sleep, stress, and study pattern.</div>` : ""}
    <section class="grid dashboard-grid" style="margin-top:18px">
      <div class="card soft">
        <h2>Burnout Risk</h2>
        ${riskRing(latest)}
        <p>${riskExplanation(checkins)}</p>
        <p class="muted">Burnout Risk is an informational indicator from your recorded sleep, stress, study, mood, and motivation. It is not a medical diagnosis.</p>
      </div>
      <div class="grid">
        ${metric("Sleep", latest ? `${latest.sleepHours}h` : "No data", icon("moon"))}
        ${metric("Study", latest ? `${latest.studyHours}h` : "No data", icon("book"))}
        ${metric("Stress", latest ? `${latest.stress}/10` : "No data", icon("pulse"))}
        ${metric("Motivation", latest ? `${latest.motivation}/10` : "No data", icon("spark"))}
      </div>
    </section>
    <section class="grid two" style="margin-top:18px">
      <div class="card"><h2>Weekly Well-Being Trend</h2>${lineChart(recentCheckins(user.id, 7), ["stress", "motivation"])}</div>
      <div class="card"><h2>Today's Recommendation</h2><p>${buildRecommendation(checkins)}</p><div class="grid two">${metric("Current Streak", `${streak.current} day`, "")}${metric("Longest Streak", `${streak.longest} day`, "")}</div></div>
    </section>
    <section class="grid two" style="margin-top:18px">
      <div class="card"><h2>Recent Check-In</h2>${latest ? checkinItem(latest, false) : empty("Nothing recorded yet. Complete today's check-in to start understanding your patterns.")}</div>
      <div class="card"><h2>Weekly Summary</h2>${summaryBlock(checkins.slice(-7))}</div>
    </section>`;
}

function metric(label, value, iconMarkup) {
  return `<div class="card"><div class="label">${iconMarkup || ""} ${label}</div><div class="metric">${value}</div></div>`;
}

function riskRing(entry) {
  const score = entry ? entry.burnoutScore : 0;
  const level = entry ? entry.riskLevel : "No data yet";
  const color = level === "High Risk" ? "var(--high-risk)" : level === "Moderate Risk" ? "var(--moderate)" : "var(--healthy)";
  return `<div class="risk-ring" style="--score:${score};--risk-color:${color}"><div><strong>${entry ? score : "--"}</strong><span>${level}</span></div></div>`;
}

function renderCheckin() {
  const user = getCurrentUser();
  const date = new URLSearchParams(location.search).get("date") || todayISO();
  const existing = userCheckins(user.id).find(item => item.date === date);
  document.getElementById("app").innerHTML = `
    ${pageTitle("Daily Check-In", existing ? "Today's check-in is already recorded. You can edit it here." : "Record today's sleep, stress, study, mood, and motivation.")}
    <form class="card" id="checkinForm">
      <div class="field"><label for="date">Date</label><input id="date" name="date" type="date" value="${date}"></div>
      <div class="field"><label>Mood</label><div class="choice-row">${MOODS.map(mood => `<button type="button" class="choice ${existing?.mood === mood.label ? "active" : ""}" data-mood="${mood.label}" aria-label="Mood ${mood.label}">${mood.label}</button>`).join("")}</div><input type="hidden" name="mood" value="${existing?.mood || ""}"></div>
      <div class="form-grid">
        ${numberField("Stress level", "stress", existing?.stress || "", 1, 10)}
        ${numberField("Motivation level", "motivation", existing?.motivation || "", 1, 10)}
        ${numberField("Study hours", "studyHours", existing?.studyHours || "", 0, 24, "0.5")}
        ${numberField("Sleep duration", "sleepHours", existing?.sleepHours || "", 0, 24, "0.5")}
        <div class="field wide"><label for="notes">Notes</label><textarea id="notes" name="notes">${existing?.notes || ""}</textarea></div>
      </div>
      <button class="button" type="submit">${existing ? "Update Check-In" : "Save Check-In"}</button>
      <p class="message" id="checkinMessage"></p>
    </form>`;
  document.querySelectorAll("[data-mood]").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll("[data-mood]").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelector("input[name='mood']").value = button.dataset.mood;
  }));
  document.getElementById("checkinForm").addEventListener("submit", saveCheckin);
}

function numberField(label, name, value, min, max, step = "1") {
  return `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="number" min="${min}" max="${max}" step="${step}" value="${value}"></div>`;
}

function saveCheckin(event) {
  event.preventDefault();
  const user = getCurrentUser();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form).entries());
  const message = document.getElementById("checkinMessage");
  const required = ["date", "mood", "stress", "motivation", "studyHours", "sleepHours"];
  if (required.some(key => data[key] === "")) {
    message.textContent = "Please complete all required check-in fields.";
    return;
  }
  const stress = Number(data.stress);
  const motivation = Number(data.motivation);
  const studyHours = Number(data.studyHours);
  const sleepHours = Number(data.sleepHours);
  if (stress < 1 || stress > 10 || motivation < 1 || motivation > 10 || studyHours < 0 || studyHours > 24 || sleepHours < 0 || sleepHours > 24 || !data.date) {
    message.textContent = "Please enter practical values for stress, motivation, sleep, and study hours.";
    return;
  }
  const checkins = getCheckins();
  const existing = checkins.find(item => item.userId === user.id && item.date === data.date);
  const entry = {
    id: existing?.id || makeId("checkin"),
    userId: user.id,
    date: data.date,
    mood: data.mood,
    moodScore: moodScore(data.mood),
    stress,
    studyHours,
    sleepHours,
    motivation,
    notes: data.notes.trim(),
    createdAt: existing?.createdAt || todayISO(),
    updatedAt: todayISO()
  };
  entry.burnoutScore = calculateBurnoutScore(entry);
  entry.riskLevel = riskLevel(entry.burnoutScore);
  if (existing) saveCheckins(checkins.map(item => item.id === existing.id ? entry : item));
  else saveCheckins([...checkins, entry]);
  checkAchievements(user.id);
  toast(existing ? "Check-in updated." : "Check-in saved.");
  window.location.href = "dashboard.html";
}

function renderHistory() {
  const user = getCurrentUser();
  document.getElementById("app").innerHTML = `
    ${pageTitle("History", "Review, filter, edit, or delete your recorded check-ins.")}
    <div class="card"><div class="form-grid">${numberField("Minimum risk", "filterRisk", "", 0, 100)}<div class="field"><label for="filterLevel">Risk level</label><select id="filterLevel"><option value="">All levels</option><option>Healthy</option><option>Moderate Risk</option><option>High Risk</option></select></div></div></div>
    <section class="card" style="margin-top:18px"><div class="table-wrap"><table><thead><tr><th>Date</th><th>Mood</th><th>Stress</th><th>Sleep</th><th>Study</th><th>Risk</th><th>Actions</th></tr></thead><tbody id="historyRows"></tbody></table></div></section>`;
  const update = () => {
    const minRisk = Number(document.getElementById("filterRisk").value || 0);
    const level = document.getElementById("filterLevel").value;
    const rows = userCheckins(user.id).filter(item => item.burnoutScore >= minRisk && (!level || item.riskLevel === level)).reverse();
    document.getElementById("historyRows").innerHTML = rows.length ? rows.map(item => `<tr><td>${formatDate(item.date)}</td><td>${item.mood}</td><td>${item.stress}/10</td><td>${item.sleepHours}h</td><td>${item.studyHours}h</td><td>${item.burnoutScore} - ${item.riskLevel}</td><td><a class="button small secondary" href="checkin.html?date=${item.date}">Edit</a> <button class="button small danger" data-delete="${item.id}">Delete</button></td></tr>`).join("") : `<tr><td colspan="7">Your check-in history will appear here.</td></tr>`;
    document.querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", () => deleteCheckin(button.dataset.delete)));
  };
  document.getElementById("filterRisk").addEventListener("input", update);
  document.getElementById("filterLevel").addEventListener("change", update);
  update();
}

function deleteCheckin(id) {
  saveCheckins(getCheckins().filter(item => item.id !== id));
  toast("Record deleted.");
  renderHistory();
}

function renderInsights() {
  const user = getCurrentUser();
  const checkins = userCheckins(user.id);
  const latest = checkins.at(-1);
  const recent = checkins.slice(-7);
  const previous = checkins.slice(-14, -7);
  const riskChange = previous.length ? average(recent, "burnoutScore") - average(previous, "burnoutScore") : null;
  document.getElementById("app").innerHTML = `
    ${pageTitle("Insights", "Understand patterns without medical claims.")}
    ${!checkins.length ? empty("Complete a few check-ins to unlock personalized trend insights.") : `<section class="grid two">
      <div class="card soft"><h2>Current Risk</h2>${riskRing(latest)}<p>${riskExplanation(checkins)}</p></div>
      <div class="card"><h2>Main Concern</h2><p>${mainConcern(recent)}</p><h2>Strongest Positive Pattern</h2><p>${positivePattern(recent)}</p></div>
      <div class="card"><h2>Recent Change</h2><p>${riskChange === null ? "More records are needed to compare this week with the previous week." : `Average burnout risk ${riskChange > 2 ? "increased" : riskChange < -2 ? "decreased" : "stayed mostly stable"} by ${Math.abs(riskChange).toFixed(1)} points.`}</p></div>
      <div class="card"><h2>Recommendation</h2><p>${buildRecommendation(checkins)}</p></div>
    </section>`}`;
}

function mainConcern(items) {
  if (!items.length) return "No concern can be calculated yet.";
  if (average(items, "sleepHours") < 6) return "Sleep has been below the suggested range in your recent records.";
  if (average(items, "stress") >= 7) return "Stress has been high in your recent records.";
  if (average(items, "studyHours") > 9) return "Study hours have been heavy recently.";
  if (average(items, "motivation") < 5) return "Motivation has been lower recently.";
  return "No strong concern stands out in your recent records.";
}

function positivePattern(items) {
  if (!items.length) return "No positive pattern can be calculated yet.";
  if (average(items, "sleepHours") >= 7) return "Your sleep has been relatively stable.";
  if (average(items, "motivation") >= 7) return "Your motivation has been steady.";
  if (average(items, "stress") <= 5) return "Your stress has stayed manageable.";
  return "You are building self-awareness by recording your routine consistently.";
}

function renderAnalytics() {
  const user = getCurrentUser();
  const checkins = userCheckins(user.id);
  const month = checkins.filter(item => item.date.slice(0, 7) === todayISO().slice(0, 7));
  document.getElementById("app").innerHTML = `
    ${pageTitle("Analytics", "Charts are based only on your stored check-in records.")}
    <section class="grid cards">${metric("Avg Risk", checkins.length ? average(checkins, "burnoutScore").toFixed(1) : "No data", "")}${metric("Avg Stress", checkins.length ? `${average(checkins, "stress").toFixed(1)}/10` : "No data", "")}${metric("Avg Sleep", checkins.length ? `${average(checkins, "sleepHours").toFixed(1)}h` : "No data", "")}${metric("This Month", month.length, "")}</section>
    <section class="grid two" style="margin-top:18px">
      <div class="card"><h2>Burnout Trend</h2>${lineChart(checkins.slice(-12), ["burnoutScore"])}</div>
      <div class="card"><h2>Stress and Motivation</h2>${lineChart(checkins.slice(-12), ["stress", "motivation"])}</div>
      <div class="card"><h2>Sleep Trend</h2>${lineChart(checkins.slice(-12), ["sleepHours"])}</div>
      <div class="card"><h2>Study Trend</h2>${lineChart(checkins.slice(-12), ["studyHours"])}</div>
      <div class="card"><h2>Mood Trend</h2>${lineChart(checkins.slice(-12), ["moodScore"])}</div>
      <div class="card"><h2>Risk Distribution</h2>${riskDistribution(checkins)}</div>
    </section>`;
}

function lineChart(items, fields) {
  if (!items.length) return empty("No chart data yet.");
  const maxByField = { burnoutScore: 100, stress: 10, motivation: 10, sleepHours: 12, studyHours: 12, moodScore: 5 };
  const width = 640;
  const height = 210;
  const pad = 24;
  const x = index => pad + (items.length === 1 ? 0 : index * ((width - pad * 2) / (items.length - 1)));
  const y = (value, max) => height - pad - (Number(value) / max) * (height - pad * 2);
  const classes = { stress: "line-stress", motivation: "line-motivation", burnoutScore: "line-risk", sleepHours: "line-motivation", studyHours: "line-stress", moodScore: "line-motivation" };
  const lines = fields.map(field => {
    const points = items.map((item, index) => `${x(index)},${y(item[field], maxByField[field])}`).join(" ");
    const circles = items.map((item, index) => `<circle class="point" cx="${x(index)}" cy="${y(item[field], maxByField[field])}" r="4" stroke="currentColor"></circle>`).join("");
    return `<polyline class="${classes[field]}" points="${points}"></polyline>${circles}`;
  }).join("");
  return `<div class="chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Trend chart">${[0,1,2,3].map(i => `<line class="chart-grid" x1="${pad}" x2="${width - pad}" y1="${pad + i * 52}" y2="${pad + i * 52}"></line>`).join("")}${lines}</svg><div class="tags">${fields.map(f => `<span class="tag">${f}</span>`).join("")}</div></div>`;
}

function riskDistribution(items) {
  const levels = ["Healthy", "Moderate Risk", "High Risk"];
  const max = Math.max(1, ...levels.map(level => items.filter(item => item.riskLevel === level).length));
  return levels.map(level => {
    const count = items.filter(item => item.riskLevel === level).length;
    return `<p><strong>${level}</strong> ${count} days</p><div class="bar"><span style="width:${count / max * 100}%"></span></div>`;
  }).join("");
}

function summaryBlock(items) {
  if (!items.length) return empty("No weekly data yet.");
  return `<div class="list">
    <div>Average Stress <strong>${average(items, "stress").toFixed(1)} / 10</strong></div>
    <div>Average Sleep <strong>${average(items, "sleepHours").toFixed(1)}h</strong></div>
    <div>Average Study <strong>${average(items, "studyHours").toFixed(1)}h</strong></div>
    <div>Average Motivation <strong>${average(items, "motivation").toFixed(1)} / 10</strong></div>
    <div>Burnout Risk <strong>${average(items, "burnoutScore").toFixed(1)}</strong></div>
  </div>`;
}

function checkinItem(item, actions = true) {
  return `<div class="item"><div><strong>${formatDate(item.date)}</strong><p class="muted">${item.mood} mood, stress ${item.stress}/10, sleep ${item.sleepHours}h, study ${item.studyHours}h</p><span class="tag">${item.burnoutScore} - ${item.riskLevel}</span></div>${actions ? `<a class="button small secondary" href="checkin.html?date=${item.date}">Edit</a>` : ""}</div>`;
}

function renderAchievements() {
  const user = getCurrentUser();
  checkAchievements(user.id);
  const items = getAchievements().filter(item => item.userId === user.id);
  document.getElementById("app").innerHTML = `${pageTitle("Achievements", "Small milestones for consistent self-monitoring.")}<section class="grid three">${items.length ? items.map(item => `<div class="card"><div class="metric">○</div><h2>${item.title}</h2><p>${item.description}</p><p class="muted">${formatDate(item.earnedAt)}</p></div>`).join("") : empty("Your first achievement is waiting. Complete your first check-in.")}</section>`;
}

function renderProfile() {
  const user = getCurrentUser();
  const checkins = userCheckins(user.id);
  const streak = calculateStreak(checkins);
  document.getElementById("app").innerHTML = `
    ${pageTitle("Profile", "Keep only the details needed for this well-being tracker.")}
    <section class="grid two"><form class="card" id="profileForm"><div class="form-grid">${textField("Name", "name", user.name)}${textField("Email", "email", user.email, "email")}${textField("Course", "course", user.course)}${textField("Academic Year", "academicYear", user.academicYear)}${textField("Institution", "institution", user.institution, "text", "wide")}</div><button class="button" type="submit">Save Profile</button><p class="message" id="profileMessage"></p></form>
    <div class="card soft"><h2>${user.name}</h2><p>${user.email}</p><p class="muted">${user.institution || "Institution not added"}</p><div class="grid two">${metric("Total Check-ins", checkins.length, "")}${metric("Current Streak", streak.current, "")}${metric("Longest Streak", streak.longest, "")}${metric("Avg Risk", checkins.length ? average(checkins, "burnoutScore").toFixed(1) : "No data", "")}</div></div></section>`;
  document.getElementById("profileForm").addEventListener("submit", event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    const users = getUsers();
    if (!data.name || !data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      document.getElementById("profileMessage").textContent = "Please enter a valid name and email.";
      return;
    }
    if (users.some(item => item.id !== user.id && item.email.toLowerCase() === data.email.toLowerCase())) {
      document.getElementById("profileMessage").textContent = "This email is already registered.";
      return;
    }
    Object.assign(user, data, { email: data.email.toLowerCase() });
    saveUsers(users.map(item => item.id === user.id ? user : item));
    toast("Profile updated.");
    renderProfile();
  });
}

function textField(label, name, value = "", type = "text", extra = "") {
  return `<div class="field ${extra}"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${value || ""}"></div>`;
}

function renderSettings() {
  const user = getCurrentUser();
  document.getElementById("app").innerHTML = `
    ${pageTitle("Settings", "Manage theme and local records.")}
    <section class="grid two">
      <div class="card"><h2>Theme</h2><p class="muted">Your theme preference is stored locally.</p><button class="button" data-theme>Switch Theme</button></div>
      <div class="card"><h2>Data</h2><div class="tags"><button class="button secondary" data-export-json>Export JSON</button><button class="button secondary" data-export-csv>Export CSV</button><button class="button danger" data-clear>Clear Personal Records</button></div></div>
    </section>
    <div class="modal" id="clearModal"><div class="card modal-box"><h2>Clear personal records?</h2><p>This removes your check-ins and achievements from this browser. Your account remains.</p><button class="button danger" data-confirm-clear>Clear Records</button> <button class="button secondary" data-cancel-clear>Cancel</button></div></div>`;
  document.querySelector("button[data-theme]").addEventListener("click", toggleTheme);
  document.querySelector("[data-export-json]").addEventListener("click", exportJson);
  document.querySelector("[data-export-csv]").addEventListener("click", exportCsv);
  const modal = document.getElementById("clearModal");
  document.querySelector("[data-clear]").addEventListener("click", () => modal.classList.add("open"));
  document.querySelector("[data-cancel-clear]").addEventListener("click", () => modal.classList.remove("open"));
  document.querySelector("[data-confirm-clear]").addEventListener("click", () => {
    saveCheckins(getCheckins().filter(item => item.userId !== user.id));
    saveAchievements(getAchievements().filter(item => item.userId !== user.id));
    modal.classList.remove("open");
    toast("Personal records cleared.");
  });
}

function exportJson() {
  const user = getCurrentUser();
  const checkins = userCheckins(user.id);
  const payload = { profile: user, checkins, achievements: getAchievements().filter(item => item.userId === user.id), streak: calculateStreak(checkins), analytics: { averageRisk: average(checkins, "burnoutScore"), averageStress: average(checkins, "stress"), averageSleep: average(checkins, "sleepHours") }, preferences: getPreferences() };
  downloadBlob(`welltrack-${user.name.replaceAll(" ", "-").toLowerCase()}.json`, JSON.stringify(payload, null, 2), "application/json");
  toast("Data exported.");
}

function exportCsv() {
  const user = getCurrentUser();
  const rows = [["Date", "Mood", "Mood Score", "Stress", "Study Hours", "Sleep Hours", "Motivation", "Burnout Score", "Risk Level", "Notes"], ...userCheckins(user.id).map(item => [item.date, item.mood, item.moodScore, item.stress, item.studyHours, item.sleepHours, item.motivation, item.burnoutScore, item.riskLevel, item.notes])];
  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  downloadBlob(`welltrack-checkins.csv`, csv, "text/csv");
  toast("CSV exported.");
}
