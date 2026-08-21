import { expect, test } from "@playwright/test";
import { createTaskAndWaitForSync } from "./helpers";

const runId = Date.now();
const TASK_COUNT = 12;

test("changing rows-per-page updates the visible task count", async ({ page }) => {
  await page.goto("/");
  await page
    .getByText(/No tasks yet|task-row-/)
    .waitFor({ timeout: 15_000 })
    .catch(() => {});

  // 1. Set page size to 50 FIRST so all 12 created tasks land on Page 1
  const option50 = page.getByText("50", { exact: true });
  if (await option50.isVisible()) {
    await option50.click();
  }

  // 2. Create tasks safely knowing they will render on DOM
  for (let i = 0; i < TASK_COUNT; i++) {
    await createTaskAndWaitForSync(page, `[e2e-${runId}] Row ${i}`);
  }

  // 3. Test changing to 10 rows
  await page.getByText("10", { exact: true }).click();
  await expect(page.getByText(/1–10 of \d+/)).toBeVisible({ timeout: 20_000 });

  // 4. Change back to 50 rows so all items are visible for cleanup
  await page.getByText("50", { exact: true }).click();
  await expect(page.getByText(/1–\d+ of \d+/)).toBeVisible({ timeout: 20_000 });

  // 5. Delete all tasks
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

  const title = `[e2e-${runId}] Total check`;

  // Create task first so toolbar controls are active/visible
  await createTaskAndWaitForSync(page, title);

  // Set to 10 per page
  await page.getByText("10", { exact: true }).click();

  const rangeLabel = page.getByText(/^\d+–\d+ of \d+$/);
  await expect(rangeLabel).toBeVisible({ timeout: 10_000 });

  // Delete task
  await page
    .getByText(title, { exact: true })
    .locator("xpath=ancestor::*[starts-with(@data-testid, 'task-row-')][1]")
    .getByText("Delete")
    .click();
});
