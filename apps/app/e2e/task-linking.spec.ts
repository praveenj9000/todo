import { expect, test } from "@playwright/test";
import { createTaskAndWaitForSync, rowFor } from "./helpers";

const runId = Date.now();
const parentTitle = `[e2e-${runId}] Tea`;
const linkedTitle = `[e2e-${runId}] Sugar`;

test("create a task, expand it, add a linked task, see it in the panel", async ({ page }) => {
  await page.goto("/");

  await createTaskAndWaitForSync(page, parentTitle);

  await rowFor(page, parentTitle).getByText("▸").click();

  const linkedTaskInput = page.getByPlaceholder("Add a linked task...");
  await linkedTaskInput.waitFor({ state: "visible" });
  await linkedTaskInput.fill(linkedTitle);

  const linkButton = page.getByText("Link", { exact: true });
  await linkButton.waitFor({ state: "visible" });
  await linkButton.click();

  await expect(page.getByText(linkedTitle)).toBeVisible({ timeout: 15_000 });

  await rowFor(page, linkedTitle).getByText("Delete").click();
  await rowFor(page, parentTitle).getByText("Delete").click();
});
