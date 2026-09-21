# Bug Reports

Defects found in [SauceDemo](https://www.saucedemo.com) during exploratory testing.
Each one is covered by an automated test in
[`tests/known-issues/known-issues.spec.ts`](../tests/known-issues/known-issues.spec.ts),
marked with `test.fail()`: the test asserts the **expected** behaviour, so it will turn red
as soon as the defect is fixed and can be promoted to a regular regression test.

> SauceDemo is a demo application: several of these defects are intentionally built into
> specific test accounts. They are documented here the same way they would be reported in a
> real project.

**Environment:** https://www.saucedemo.com · Chromium, Firefox, WebKit (desktop) · Password `secret_sauce`

| ID                  | Title                                               | User                      | Severity | Priority |
| ------------------- | --------------------------------------------------- | ------------------------- | -------- | -------- |
| [BUG-001](#bug-001) | All products show the same broken image             | `problem_user`            | Medium   | Medium   |
| [BUG-002](#bug-002) | Sorting has no effect on the product list           | `problem_user`            | Medium   | Medium   |
| [BUG-003](#bug-003) | Half of the "Add to cart" buttons do nothing        | `problem_user`            | High     | High     |
| [BUG-004](#bug-004) | "Remove" button does nothing on the inventory page  | `problem_user`            | High     | High     |
| [BUG-005](#bug-005) | Typing in Last Name overwrites First Name           | `problem_user`            | Critical | High     |
| [BUG-006](#bug-006) | "Finish" button does not complete the order         | `error_user`              | Critical | High     |
| [BUG-007](#bug-007) | Inventory displays wrong, random prices             | `visual_user`             | Critical | High     |
| [BUG-008](#bug-008) | Login takes ~5 seconds                              | `performance_glitch_user` | Medium   | Medium   |
| [BUG-009](#bug-009) | "Remove" buttons stay visible after Reset App State | `standard_user`           | Low      | Low      |
| [BUG-010](#bug-010) | Whitespace-only values pass checkout validation     | `standard_user`           | Medium   | Medium   |
| [BUG-011](#bug-011) | Checkout can be started with an empty cart          | `standard_user`           | Medium   | Medium   |

---

## BUG-001

**All products show the same broken image** · `problem_user` · Severity: Medium

**Steps to reproduce**

1. Log in as `problem_user`.
2. Look at the product images on the inventory page.

- **Expected:** each product shows its own picture.
- **Actual:** all six products point to the same placeholder image (`sl-404.jpg`).

---

## BUG-002

**Sorting has no effect on the product list** · `problem_user` · Severity: Medium

**Steps to reproduce**

1. Log in as `problem_user`.
2. Select **Name (Z to A)** in the sort dropdown.

- **Expected:** products are listed in reverse alphabetical order.
- **Actual:** the list keeps the default A→Z order. The same happens with `error_user`.

---

## BUG-003

**Half of the "Add to cart" buttons do nothing** · `problem_user` · Severity: High

**Steps to reproduce**

1. Log in as `problem_user`.
2. Click **Add to cart** on every product.

- **Expected:** the cart badge shows `6`.
- **Actual:** the badge shows `3`. Bolt T-Shirt, Fleece Jacket and the red T-Shirt cannot be added.

---

## BUG-004

**"Remove" button does nothing on the inventory page** · `problem_user` · Severity: High

**Steps to reproduce**

1. Log in as `problem_user`.
2. Click **Add to cart** on _Sauce Labs Backpack_, then click **Remove**.

- **Expected:** the product is removed and the badge disappears.
- **Actual:** the button stays as **Remove** and the badge still shows `1`.

---

## BUG-005

**Typing in Last Name overwrites First Name** · `problem_user` · Severity: Critical

**Steps to reproduce**

1. Log in as `problem_user` and add any product to the cart.
2. Go to checkout.
3. Type `Ada` in **First Name** and `Lovelace` in **Last Name**.

- **Expected:** First Name = `Ada`, Last Name = `Lovelace`.
- **Actual:** First Name = `Lovelace` (overwritten) and Last Name is empty, so the form can
  never be submitted: the user **cannot complete a purchase**.

---

## BUG-006

**"Finish" button does not complete the order** · `error_user` · Severity: Critical

**Steps to reproduce**

1. Log in as `error_user` and add any product to the cart.
2. Complete the checkout information and click **Continue**.
3. Click **Finish** on the overview page.

- **Expected:** the user lands on the order confirmation page.
- **Actual:** nothing happens; the user stays on the overview page. Purchase is blocked.

---

## BUG-007

**Inventory displays wrong, random prices** · `visual_user` · Severity: Critical

**Steps to reproduce**

1. Log in as `visual_user`.
2. Compare the prices shown on the inventory page with the catalog (e.g. Backpack = $29.99).

- **Expected:** catalog prices.
- **Actual:** prices are different and change on every page load (e.g. Backpack shown at $93.27).

---

## BUG-008

**Login takes ~5 seconds** · `performance_glitch_user` · Severity: Medium

**Steps to reproduce**

1. Log in as `performance_glitch_user`.
2. Measure the time between clicking **Login** and the inventory being displayed.

- **Expected:** under 2 seconds (the other accounts take ~100 ms).
- **Actual:** ~5 seconds. The measured time is attached to the test as an annotation.

---

## BUG-009

**"Remove" buttons stay visible after Reset App State** · `standard_user` · Severity: Low

**Steps to reproduce**

1. Log in as `standard_user` and add _Sauce Labs Backpack_ to the cart.
2. Open the side menu and click **Reset App State**.

- **Expected:** the cart is emptied and the product button changes back to **Add to cart**.
- **Actual:** the cart badge disappears, but the product still shows **Remove** until the page
  is reloaded, so the UI is out of sync with the cart.

---

## BUG-010

**Whitespace-only values pass checkout validation** · `standard_user` · Severity: Medium

**Steps to reproduce**

1. Log in as `standard_user` and add any product to the cart.
2. Go to checkout and enter three spaces in First Name, Last Name and Postal Code.
3. Click **Continue**.

- **Expected:** a validation error, as the fields are effectively empty.
- **Actual:** the form is accepted and the user moves on to the overview.

---

## BUG-011

**Checkout can be started with an empty cart** · `standard_user` · Severity: Medium

**Steps to reproduce**

1. Log in as `standard_user` with an empty cart.
2. Open the cart and click **Checkout**.

- **Expected:** the button is disabled or the user sees a message that the cart is empty.
- **Actual:** the checkout flow starts and an order with no items (Total: $0.00) can be completed.
