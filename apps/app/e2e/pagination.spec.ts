import { expect, test } from "@playwright/test";
import { createTaskAndWaitForSync } from "./helpers";

// Assumes the currently-configured pagination mode is "paged" (offset,
// with a page-size/page-number toolbar). If FEATURES changes that, this
// spec's toolbar assertions no longer apply and need revisiting.
//
// Deliberately does not assert on which specific task appears where —
// new tasks share sort_order: 0 by default, tie-broken by a random id,
// so a freshly created task's position relative to other same-priority
// rows is not guaranteed. Assertions here only check counts/labels.

const runId = Date.now();
// Must exceed the smallest page size (10) tested below, or the range
// label can never actually read "1–10 of ..." — it would legitimately
// read "1–N of N" for any N <= 10. This is a hard requirement of what
// the test verifies, not a tunable for reducing load.
const TASK_COUNT = 12;

test("changing rows-per-page updates the visible task count", async ({ page }) => {
  await page.goto("/");
  await page
    .getByText(/No tasks yet|task-row-/)
    .waitFor({ timeout: 15_000 })
    .catch(() => {});

  for (let i = 0; i < TASK_COUNT; i++) {
    await createTaskAndWaitForSync(page, `[e2e-${runId}] Row ${i}`);
  }

  await page.getByText("10", { exact: true }).click();
  await expect(page.getByText(/1–10 of \d+/)).toBeVisible({ timeout: 20_000 });

  await page.getByText("50", { exact: true }).click();
  await expect(page.getByText(/1–\d+ of \d+/)).toBeVisible({ timeout: 20_000 });

  for (let i = 0; i < TASK_COUNT; i++) {
    await page
      .getByText(`[e2e-${runId}] Row ${i}`, { exact: true })
      .locator("xpath=ancestor::*[starts-with(@data-testid, 'task-row-')][1]")
      .getByText("Delete")
      .click();
  }
});

test("range label reflects the current task count", async ({ page }) => {
  await page.goto("/");
  await page
    .getByText(/No tasks yet|task-row-/)
    .waitFor({ timeout: 15_000 })
    .catch(() => {});

  await page.getByText("10", { exact: true }).click();

  const rangeLabel = page.getByText(/^\d+–\d+ of \d+$/);
  const rangeTextBefore = await rangeLabel.textContent();
  const beforeTotal = Number(rangeTextBefore?.match(/of (\d+)$/)?.[1] ?? 0);

  const title = `[e2e-${runId}] Total check`;
  await createTaskAndWaitForSync(page, title);

  await expect(page.getByText(new RegExp(`of ${beforeTotal + 1}$`))).toBeVisible({
    timeout: 10_000,
  });

  await page
    .getByText(title, { exact: true })
    .locator("xpath=ancestor::*[starts-with(@data-testid, 'task-row-')][1]")
    .getByText("Delete")
    .click();
});
