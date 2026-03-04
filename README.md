# Budget & Salary Calculator

A lightweight web app to replace manual budgeting spreadsheets.

## Features

- Add and remove monthly income sources.
- Add and remove fixed monthly expenses.
- Add and remove fixed monthly savings/investment contributions.
- Auto-calculate remaining monthly money after expenses and savings.
- Estimate after-tax salary for every U.S. state + D.C.
  - Uses **projected 2026** federal tax brackets for single filers.
  - Uses projected 2026 standard deduction and Social Security wage base.
  - Uses simplified state effective tax rates.
  - Includes Social Security + Medicare (FICA).

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000/` (recommended)
- if you see "Not Found", open `http://localhost:8000/index.html`
