const STORAGE_KEY = "hydration-data-v1";

const dailyGoalInput = document.getElementById("dailyGoal");
const saveGoalButton = document.getElementById("saveGoal");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const addWaterButtons = document.querySelectorAll(".add-water");
const customAmountForm = document.getElementById("customAmountForm");
const customAmountInput = document.getElementById("customAmount");
const resetTodayButton = document.getElementById("resetToday");
const historyList = document.getElementById("historyList");

const todayKey = getDateKey(new Date());

let state = loadState();
ensureToday();
render();

saveGoalButton.addEventListener("click", () => {
  const newGoal = Number(dailyGoalInput.value);
  if (!Number.isFinite(newGoal) || newGoal < 250) {
    alert("Please enter a valid goal (minimum 250 ml).");
    return;
  }

  state.goal = Math.round(newGoal);
  saveState();
  render();
});

addWaterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    addWater(Number(button.dataset.amount));
  });
});

customAmountForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const amount = Number(customAmountInput.value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return;
  }

  addWater(amount);
  customAmountInput.value = "";
});

resetTodayButton.addEventListener("click", () => {
  state.entries[todayKey] = 0;
  saveState();
  render();
});

function addWater(amount) {
  ensureToday();
  state.entries[todayKey] += Math.round(amount);
  saveState();
  render();
}

function ensureToday() {
  if (!(todayKey in state.entries)) {
    state.entries[todayKey] = 0;
  }

  pruneOldEntries(30);
  saveState();
}

function render() {
  const todayTotal = state.entries[todayKey] ?? 0;
  const percentage = Math.min(100, (todayTotal / state.goal) * 100);

  dailyGoalInput.value = state.goal;
  progressText.textContent = `${todayTotal} ml / ${state.goal} ml`;
  progressFill.style.width = `${percentage}%`;

  renderHistory();
}

function renderHistory() {
  const dates = Object.keys(state.entries).sort().reverse().slice(0, 7);
  historyList.innerHTML = "";

  if (dates.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No history yet.";
    historyList.appendChild(emptyItem);
    return;
  }

  dates.forEach((date) => {
    const total = state.entries[date];
    const item = document.createElement("li");

    const left = document.createElement("span");
    left.textContent = date === todayKey ? `${date} (Today)` : date;

    const right = document.createElement("strong");
    right.textContent = `${total} ml`;

    item.append(left, right);
    historyList.appendChild(item);
  });
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function pruneOldEntries(keepDays) {
  const sortedDates = Object.keys(state.entries).sort().reverse();
  sortedDates.slice(keepDays).forEach((date) => {
    delete state.entries[date];
  });
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      goal: 2000,
      entries: {},
    };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      goal: Number(parsed.goal) >= 250 ? Number(parsed.goal) : 2000,
      entries: typeof parsed.entries === "object" && parsed.entries ? parsed.entries : {},
    };
  } catch {
    return {
      goal: 2000,
      entries: {},
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
