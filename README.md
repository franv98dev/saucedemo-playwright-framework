# SauceDemo · Playwright Test Automation Framework

[![Playwright Tests](https://github.com/franv98dev/saucedemo-playwright-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/franv98dev/saucedemo-playwright-framework/actions/workflows/playwright.yml)
[![Test Report](https://img.shields.io/badge/report-live-2ea44f?logo=playwright)](https://franv98dev.github.io/saucedemo-playwright-framework/)
![Playwright](https://img.shields.io/badge/Playwright-1.63-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

End-to-end test automation framework for [SauceDemo](https://www.saucedemo.com), a demo
e-commerce site, built with **Playwright** and **TypeScript**.

The goal of this project is to show how I approach test automation in a real team: a
maintainable architecture, meaningful coverage, fast and reliable tests, and a CI pipeline
that anyone can read. It also documents [**11 defects**](docs/BUG_REPORTS.md) found while
testing the application.

📊 **[Latest test report](https://franv98dev.github.io/saucedemo-playwright-framework/)**, published automatically from `main`.

---

## Highlights

| Area                           | What it shows                                                                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Page Object Model**          | One class per page plus a reusable `HeaderComponent`; locators are defined once and tests read like user stories.                             |
| **Custom fixtures**            | Page objects are injected into tests (`async ({ cartPage }) => …`): no `new Page()` boilerplate in specs.                                     |
| **Authentication once**        | A `setup` project logs in and saves the session (`storageState`); the rest of the suite starts already logged in.                             |
| **State setup without the UI** | The `seedCart` fixture writes the cart directly to `localStorage`, so cart and checkout tests don't depend on clicking through the inventory. |
| **Data-driven tests**          | Login errors, form validation, sorting, protected routes and order totals are parameterized from typed data.                                  |
| **Independent test oracle**    | Order totals (subtotal, 8% tax, total) are calculated in code and compared to what the app displays.                                          |
| **Accessibility**              | Automated WCAG 2.1 A/AA scans with axe-core on every main page; full results attached to the report.                                          |
| **Known-issue tracking**       | Defects are covered by `test.fail()` tests that turn red when a bug gets fixed. See [Bug Reports](docs/BUG_REPORTS.md).                       |
| **Cross-browser & mobile**     | Chromium, Firefox and WebKit, plus smoke tests on a mobile viewport (Pixel 7).                                                                |
| **CI/CD**                      | GitHub Actions: quality gate → sharded parallel runs → merged HTML report deployed to GitHub Pages. Nightly scheduled run.                    |
| **Code quality**               | Strict TypeScript, ESLint (with `eslint-plugin-playwright`), Prettier and Dependabot.                                                         |

## Tech stack

- [Playwright Test](https://playwright.dev) 1.63 · TypeScript (strict) · Node.js 22
- [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm) for accessibility checks
- [@faker-js/faker](https://fakerjs.dev) for realistic test data
- ESLint · Prettier · GitHub Actions · GitHub Pages

## Project structure

```
.
├── .github/
│   ├── workflows/playwright.yml   # CI pipeline
│   └── dependabot.yml
├── docs/
│   └── BUG_REPORTS.md             # Defects found, with steps to reproduce
├── src/
│   ├── data/                      # Users, product catalog, messages, test data builders
│   ├── fixtures/test.ts           # Custom fixtures: page objects, seedCart, axe builder
│   ├── pages/                     # Page Object Model
│   │   ├── components/HeaderComponent.ts
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── ProductDetailsPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutInformationPage.ts
│   │   ├── CheckoutOverviewPage.ts
│   │   └── CheckoutCompletePage.ts
│   └── utils/price.ts             # Price parsing and order total calculation
├── tests/
│   ├── auth.setup.ts              # Logs in once and stores the session
│   ├── a11y/                      # Accessibility scans
│   ├── auth/                      # Login, logout, access control
│   ├── cart/
│   ├── checkout/                  # Form validation and order totals
│   ├── e2e/                       # Full purchase journey and navigation
│   ├── inventory/                 # Catalog, sorting, product details
│   └── known-issues/              # Documented defects (test.fail)
├── playwright.config.ts
└── package.json
```

## Getting started

### Prerequisites

- Node.js 22 or newer (see `.nvmrc`)
- Git

### Installation

```bash
git clone https://github.com/franv98dev/saucedemo-playwright-framework.git
cd saucedemo-playwright-framework
npm ci
npx playwright install --with-deps
cp .env.example .env   # optional: defaults already point to saucedemo.com
```

### Running the tests

| Command                   | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| `npm test`                | Full suite on every browser                           |
| `npm run test:chromium`   | Full suite on Chromium only (fastest feedback)        |
| `npm run test:smoke`      | Critical paths only (`@smoke`)                        |
| `npm run test:regression` | Regression suite (`@regression`)                      |
| `npm run test:a11y`       | Accessibility scans (`@a11y`)                         |
| `npm run test:headed`     | Run with a visible browser                            |
| `npm run test:ui`         | Playwright UI mode: watch, time-travel and debug      |
| `npm run test:debug`      | Step through a test with the Playwright Inspector     |
| `npm run report`          | Open the last HTML report                             |
| `npm run check`           | Typecheck + lint + format check (same as the CI gate) |

Run a single file or test:

```bash
npx playwright test tests/checkout
npx playwright test -g "calculates item total"
```

## Test coverage

**88 tests per desktop browser**, plus 10 smoke tests on mobile.

| Suite         | Tag            | Tests | Covers                                                                                                                  |
| ------------- | -------------- | ----: | ----------------------------------------------------------------------------------------------------------------------- |
| Smoke         | `@smoke`       |    10 | Login, logout, catalog, add to cart, cart, checkout, full purchase journey                                              |
| Regression    | `@regression`  |    61 | Login errors, access control on 6 protected routes, sorting, product details, cart, form validation, totals, navigation |
| Accessibility | `@a11y`        |     6 | WCAG 2.1 A/AA on login, inventory, product details, cart and checkout pages                                             |
| Known issues  | `@known-issue` |    11 | Defects documented in [BUG_REPORTS.md](docs/BUG_REPORTS.md)                                                             |

### Test design techniques used

- **Equivalence partitioning & boundary cases:** empty fields, wrong credentials, case-sensitive
  usernames, whitespace-only input, unknown product IDs, empty cart.
- **Decision tables:** checkout form validation order (first name → last name → postal code).
- **State transitions:** add/remove to cart across inventory, details page, cart and reloads.
- **Negative & security testing:** every protected route is checked for anonymous access;
  the session cookie must be cleared on logout.
- **Exploratory testing:** used the special SauceDemo accounts (`problem_user`, `error_user`,
  `visual_user`, `performance_glitch_user`) to find and document defects.

## Bugs found

11 defects are documented with steps to reproduce, expected/actual results, severity and
priority in **[docs/BUG_REPORTS.md](docs/BUG_REPORTS.md)**. Highlights:

- **Critical:** `problem_user` cannot complete checkout because typing in _Last Name_ overwrites _First Name_.
- **Critical:** `error_user` cannot finish an order; the _Finish_ button does nothing.
- **Critical:** `visual_user` sees random, wrong prices in the catalog.
- **Medium:** any user can complete an order with an empty cart ($0.00).

Each defect has an automated test marked with `test.fail()`. The suite stays green while the
bug exists and turns red the moment it is fixed, which is the signal to promote the test to
the regular regression suite.

## CI/CD pipeline

```
push / PR / nightly
        │
        ▼
┌──────────────────┐     ┌─────────────────────────────────────────┐     ┌──────────────────────┐
│ quality          │ ──▶ │ test (7 parallel jobs)                  │ ──▶ │ report               │
│ typecheck        │     │ chromium · firefox · webkit × 2 shards  │     │ merge blob reports   │
│ eslint           │     │ + mobile-chrome smoke                   │     │ → HTML report        │
│ prettier         │     │ retries: 2 · trace on first retry       │     │ → GitHub Pages       │
└──────────────────┘     └─────────────────────────────────────────┘     └──────────────────────┘
```

- **Quality gate first:** tests don't run if the code doesn't compile or lint.
- **Sharding:** each browser is split across 2 machines to keep feedback fast.
- **Debuggable failures:** traces, screenshots and videos are kept only for failed or retried tests.
- **Nightly run:** detects changes in the application under test even without new commits.

## Design decisions

- **`data-test` attributes as test IDs.** SauceDemo exposes them on every interactive element,
  so they are configured as Playwright's `testIdAttribute`. They are stable, independent of
  styling, and make intent obvious (`getByTestId('checkout')`). Role-based locators are used where
  they read better (e.g. the menu buttons).
- **Assertions stay in the specs.** Page objects expose actions and locators; business
  assertions live in the tests so a reader can see what is being verified. The only helpers in
  page objects are generic checks such as `expectToBeOpen()`.
- **No hard waits.** Only web-first assertions (`toHaveText`, `toBeVisible`, `expect.poll`) that
  retry automatically. There is not a single `waitForTimeout` in the codebase.
- **Long runs stay authenticated.** SauceDemo's session cookie expires after 10 minutes, so the
  setup project extends it; otherwise tests that start late in a full cross-browser run would
  silently land on the login page.
- **Tests are independent.** Every test gets a fresh browser context, so tests can run in any
  order and fully in parallel.
- **Test data is generated**, not hard-coded (`buildCustomer()` with Faker), while expected
  values (catalog, messages) live in one typed source of truth under `src/data`.

## Possible next steps

- API-level tests for a service with a real backend (e.g. Restful-Booker) in a separate repo.
- Visual regression tests with `toHaveScreenshot()` running inside the official Playwright Docker image.
- Allure reporting with historical trends.

## Author

**Francisco Varela**, QA Automation Engineer

- LinkedIn: [linkedin.com/in/francisco-varela-qa](https://www.linkedin.com/in/francisco-varela-qa)
- GitHub: [@franv98dev](https://github.com/franv98dev)

## License

[MIT](LICENSE)
