import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createTaskAndWaitForSync, rowFor } from "./helpers";

const runId = Date.now();
const taskTitle = `[e2e-${runId}] Buy milk`;

test("create, complete, and delete a task", async ({ page }) => {
  await page.goto("/");

  await createTaskAndWaitForSync(page, taskTitle);

  const row = rowFor(page, taskTitle);
  await expect(row).toBeVisible();

  const accessibilityResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityResults.violations).toEqual([]);

  await row.getByText("○").click();
  await row.getByText("Delete").click();

  await expect(page.getByText(taskTitle)).not.toBeVisible();
});
