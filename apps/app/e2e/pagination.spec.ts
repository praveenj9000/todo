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

test("changing rows-per-page updates the visible task count", async ({ page }) => {
  await page.goto("/");
  await page
    .getByText(/No tasks yet|task-row-/)
    .waitFor({ timeout: 15_000 })
    .catch(() => {});

  for (let i = 0; i < 11; i++) {
    await createTaskAndWaitForSync(page, `[e2e-${runId}] Row ${i}`);
  }

  await page.getByText("10", { exact: true }).click();
  await expect(page.getByText(/1–10 of \d+/)).toBeVisible({ timeout: 10_000 });

  await page.getByText("50", { exact: true }).click();
  await expect(page.getByText(/1–\d+ of \d+/)).toBeVisible({ timeout: 10_000 });

  for (let i = 0; i < 11; i++) {
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

  // Specifically the range label ("1–N of M"), not the page-number
  // label ("Page X of Y") — both match a looser /of \d+/ pattern.
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
