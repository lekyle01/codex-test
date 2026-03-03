const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const stateEffectiveRates = {
  AL: 0.035, AK: 0, AZ: 0.025, AR: 0.042, CA: 0.06, CO: 0.04, CT: 0.05, DE: 0.048,
  FL: 0, GA: 0.04, HI: 0.06, ID: 0.042, IL: 0.04, IN: 0.03, IA: 0.04, KS: 0.04,
  KY: 0.037, LA: 0.03, ME: 0.05, MD: 0.048, MA: 0.045, MI: 0.037, MN: 0.055,
  MS: 0.035, MO: 0.038, MT: 0.05, NE: 0.042, NV: 0, NH: 0, NJ: 0.055, NM: 0.04,
  NY: 0.06, NC: 0.0425, ND: 0.02, OH: 0.035, OK: 0.038, OR: 0.058, PA: 0.031,
  RI: 0.045, SC: 0.04, SD: 0, TN: 0, TX: 0, UT: 0.043, VT: 0.05, VA: 0.043,
  WA: 0, WV: 0.04, WI: 0.045, WY: 0, DC: 0.055
};

const stateNames = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado",
  CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia"
};

const federalBracketsSingle2024 = [
  [11600, 0.1],
  [47150, 0.12],
  [100525, 0.22],
  [191950, 0.24],
  [243725, 0.32],
  [609350, 0.35],
  [Infinity, 0.37]
];

const stateSelect = document.getElementById("state-select");
Object.keys(stateNames)
  .sort((a, b) => stateNames[a].localeCompare(stateNames[b]))
  .forEach((code) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${stateNames[code]} (${code})`;
    if (code === "CA") option.selected = true;
    stateSelect.append(option);
  });

const groups = {
  income: document.getElementById("income-list"),
  expense: document.getElementById("expense-list"),
  savings: document.getElementById("savings-list")
};

function createLineItem(type, name = "", amount = "") {
  const row = document.createElement("div");
  row.className = "line-item";
  row.innerHTML = `
    <input type="text" placeholder="Name" aria-label="${type} name" value="${name}" />
    <input type="number" min="0" step="0.01" placeholder="Amount" aria-label="${type} amount" value="${amount}" />
    <button type="button" class="delete-btn" aria-label="Delete ${type}">Delete</button>
  `;

  row.querySelectorAll("input").forEach((input) => input.addEventListener("input", updateBudgetTotals));
  row.querySelector(".delete-btn").addEventListener("click", () => {
    row.remove();
    updateBudgetTotals();
  });

  groups[type].append(row);
}

function getGroupTotal(type) {
  return [...groups[type].querySelectorAll('input[type="number"]')]
    .map((input) => Number(input.value) || 0)
    .reduce((sum, value) => sum + value, 0);
}

function updateBudgetTotals() {
  const income = getGroupTotal("income");
  const expenses = getGroupTotal("expense");
  const savings = getGroupTotal("savings");
  const remaining = income - expenses - savings;

  document.getElementById("total-income").textContent = usd.format(income);
  document.getElementById("total-expenses").textContent = usd.format(expenses);
  document.getElementById("total-savings").textContent = usd.format(savings);
  document.getElementById("remaining-money").textContent = usd.format(remaining);
}

document.getElementById("add-income-btn").addEventListener("click", () => createLineItem("income"));
document.getElementById("add-expense-btn").addEventListener("click", () => createLineItem("expense"));
document.getElementById("add-savings-btn").addEventListener("click", () => createLineItem("savings"));

function estimateFederalTax(taxableIncome) {
  let remaining = taxableIncome;
  let tax = 0;
  let lower = 0;

  for (const [upper, rate] of federalBracketsSingle2024) {
    if (remaining <= 0) break;
    const bracketTaxable = Math.min(remaining, upper - lower);
    tax += bracketTaxable * rate;
    remaining -= bracketTaxable;
    lower = upper;
  }

  return tax;
}

function calculateSalary() {
  const grossSalary = Number(document.getElementById("gross-salary").value) || 0;
  const preTaxContrib = Number(document.getElementById("pretax-contrib").value) || 0;
  const state = stateSelect.value;
  const standardDeduction = 14600;

  const adjustedGross = Math.max(0, grossSalary - preTaxContrib);
  const taxableIncome = Math.max(0, adjustedGross - standardDeduction);
  const federalTax = estimateFederalTax(taxableIncome);

  const socialSecurityTax = Math.min(adjustedGross, 168600) * 0.062;
  const medicareTax = adjustedGross * 0.0145;
  const fica = socialSecurityTax + medicareTax;

  const stateTaxRate = stateEffectiveRates[state] ?? 0;
  const stateTax = taxableIncome * stateTaxRate;

  const annualNet = adjustedGross - federalTax - fica - stateTax;
  const monthlyNet = annualNet / 12;

  document.getElementById("taxable-income").textContent = usd.format(taxableIncome);
  document.getElementById("federal-tax").textContent = usd.format(federalTax);
  document.getElementById("fica-tax").textContent = usd.format(fica);
  document.getElementById("state-tax").textContent = usd.format(stateTax);
  document.getElementById("annual-net").textContent = usd.format(annualNet);
  document.getElementById("monthly-net").textContent = usd.format(monthlyNet);
}

document.getElementById("calculate-salary-btn").addEventListener("click", calculateSalary);

createLineItem("income", "Primary paycheck", "5000");
createLineItem("income", "Side income", "500");
createLineItem("expense", "Rent/Mortgage", "1800");
createLineItem("expense", "Utilities", "250");
createLineItem("savings", "Emergency fund", "400");
createLineItem("savings", "Investments", "600");
updateBudgetTotals();
calculateSalary();
