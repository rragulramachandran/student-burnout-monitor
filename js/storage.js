const B_KEYS = {
  users: "burnout_users",
  currentUser: "burnout_current_user",
  checkins: "burnout_checkins",
  achievements: "burnout_achievements",
  preferences: "burnout_preferences"
};

const MOODS = [
  { label: "Very Low", score: 1 },
  { label: "Low", score: 2 },
  { label: "Okay", score: 3 },
  { label: "Good", score: 4 },
  { label: "Very Good", score: 5 }
];

function readStore(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getUsers() { return readStore(B_KEYS.users, []); }
function saveUsers(users) { writeStore(B_KEYS.users, users); }
function getCheckins() { return readStore(B_KEYS.checkins, []); }
function saveCheckins(checkins) { writeStore(B_KEYS.checkins, checkins); }
function getAchievements() { return readStore(B_KEYS.achievements, []); }
function saveAchievements(items) { writeStore(B_KEYS.achievements, items); }
function getPreferences() { return readStore(B_KEYS.preferences, { theme: "light" }); }
function savePreferences(prefs) { writeStore(B_KEYS.preferences, prefs); }

function setCurrentUser(id) {
  writeStore(B_KEYS.currentUser, { id });
}

function clearCurrentUser() {
  localStorage.removeItem(B_KEYS.currentUser);
}

function getCurrentUser() {
  const session = readStore(B_KEYS.currentUser, null);
  if (!session) return null;
  return getUsers().find(user => user.id === session.id) || null;
}

function requireLogin() {
  if (!getCurrentUser()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function logout() {
  clearCurrentUser();
  window.location.href = "login.html";
}

function moodScore(label) {
  return MOODS.find(item => item.label === label)?.score || 3;
}

function calculateBurnoutScore(entry) {
  const stress = (Number(entry.stress) - 1) / 9 * 28;
  const motivation = (10 - Number(entry.motivation)) / 9 * 20;
  const mood = (5 - Number(entry.moodScore)) / 4 * 18;
  const sleep = Math.max(0, (7 - Number(entry.sleepHours)) / 7) * 22;
  const study = Math.max(0, (Number(entry.studyHours) - 7) / 7) * 12;
  return Math.max(0, Math.min(100, Math.round(stress + motivation + mood + sleep + study)));
}

function riskLevel(score) {
  if (score >= 70) return "High Risk";
  if (score >= 40) return "Moderate Risk";
  return "Healthy";
}

function userCheckins(userId) {
  return getCheckins()
    .filter(item => item.userId === userId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function latestCheckin(userId) {
  return userCheckins(userId).at(-1) || null;
}

function recentCheckins(userId, count = 7) {
  return userCheckins(userId).slice(-count);
}

function average(items, field) {
  const values = items.map(item => Number(item[field])).filter(value => !Number.isNaN(value));
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateStreak(checkins) {
  const days = [...new Set(checkins.map(item => item.date))].sort().reverse();
  if (!days.length) return { current: 0, longest: 0 };
  const toDay = value => Math.floor(new Date(`${value}T00:00:00`).getTime() / 86400000);
  const numeric = days.map(toDay).sort((a, b) => b - a);
  const today = toDay(todayISO());
  let expected = numeric[0] === today ? today : today - 1;
  let current = 0;
  for (const day of numeric) {
    if (day === expected) {
      current += 1;
      expected -= 1;
    } else if (day < expected) {
      break;
    }
  }
  let longest = 1;
  let run = 1;
  for (let i = 1; i < numeric.length; i += 1) {
    if (numeric[i - 1] - numeric[i] === 1) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
  }
  return { current, longest };
}

function buildRecommendation(checkins) {
  if (!checkins.length) return "Complete your first check-in to receive a recommendation based on your own records.";
  const recent = checkins.slice(-7);
  const sleepAvg = average(recent, "sleepHours");
  const stressAvg = average(recent, "stress");
  const studyAvg = average(recent, "studyHours");
  const motivationAvg = average(recent, "motivation");
  const latest = recent.at(-1);
  const previous = recent.at(-2);

  if (latest.burnoutScore >= 70) return "Your recorded pattern indicates higher burnout risk. Consider reducing pressure where possible, protecting rest, and talking to someone you trust if stress feels difficult to manage.";
  if (sleepAvg < 6) return "Your recent sleep average is below 6 hours. Consider protecting a consistent sleep window tonight.";
  if (stressAvg >= 7) return "Your stress level has been elevated recently. Try reducing workload temporarily and taking regular breaks.";
  if (studyAvg > 9) return "Your recent study hours have been unusually high. Consider adding short breaks between study sessions.";
  if (motivationAvg < 5) return "Your motivation has been lower than usual. Try starting with one small, manageable task.";
  if (previous && latest.burnoutScore - previous.burnoutScore >= 12) return "Your recorded burnout risk increased recently. Take a moment to review your sleep, stress, and study pattern.";
  return "Your recent pattern looks relatively steady. Keep maintaining a balanced routine with regular rest and manageable study sessions.";
}

function riskExplanation(checkins) {
  if (!checkins.length) return "No check-in has been recorded yet.";
  const latest = checkins.at(-1);
  const recent = checkins.slice(-7);
  const parts = [];
  if (average(recent, "stress") >= 7) parts.push("stress has been high recently");
  if (average(recent, "sleepHours") < 6) parts.push("average sleep has been low");
  if (average(recent, "studyHours") > 9) parts.push("study hours have been heavy");
  if (average(recent, "motivation") < 5) parts.push("motivation has been lower");
  if (!parts.length) return `Your current risk is ${latest.riskLevel.toLowerCase()} because your recent sleep, stress, study, mood, and motivation records are relatively stable.`;
  return `Your current risk is ${latest.riskLevel.toLowerCase()} because ${parts.join(", ")}.`;
}

function addAchievement(userId, title, description) {
  const items = getAchievements();
  if (items.some(item => item.userId === userId && item.title === title)) return;
  items.push({ id: makeId("ach"), userId, title, description, earnedAt: todayISO() });
  saveAchievements(items);
}

function checkAchievements(userId) {
  const checkins = userCheckins(userId);
  const streak = calculateStreak(checkins);
  if (checkins.length >= 1) addAchievement(userId, "First Check-In", "Complete your first daily well-being check-in.");
  if (checkins.length >= 7) addAchievement(userId, "One Week Aware", "Record 7 total check-ins.");
  if (streak.current >= 7 || streak.longest >= 7) addAchievement(userId, "Seven Day Streak", "Maintain a 7-day check-in streak.");
  if (streak.current >= 14 || streak.longest >= 14) addAchievement(userId, "Two-Week Tracker", "Complete a 14-day streak.");
  if (checkins.some(item => item.riskLevel === "Healthy")) addAchievement(userId, "Balanced Day", "Record a check-in with a healthy risk indicator.");
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
