import { expect, test } from "@playwright/test";
import { createTaskAndWaitForSync } from "./helpers";

const runId = Date.now();
const taskTitle = `[e2e-${runId}] Buy milk`;

function rowFor(page: import("@playwright/test").Page, title: string) {
  return page
    .getByText(title, { exact: true })
    .locator("xpath=ancestor::*[starts-with(@data-testid, 'task-row-')][1]");
}

test("create, complete, and delete a task", async ({ page }) => {
  await page.goto("/");

  await createTaskAndWaitForSync(page, taskTitle);

  const row = rowFor(page, taskTitle);
  await expect(row).toBeVisible();

  await row.getByText("○").click();
  await row.getByText("Delete").click();

  await expect(page.getByText(taskTitle)).not.toBeVisible();
});
