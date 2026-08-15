import { expect, test } from "@playwright/test";
import { createTaskAndWaitForSync, rowFor } from "./helpers";

// Assumes FEATURES.dragSort.enabled is true and the store's default
// sort is "manual" (tasks-ui.store.ts) — drag-to-reorder only renders
// when both hold. If either changes, this spec needs revisiting.

const runId = Date.now();
const firstTitle = `[e2e-${runId}] First`;
const secondTitle = `[e2e-${runId}] Second`;

test("dragging a task above another changes their order", async ({ page }) => {
  await page.goto("/");

  await createTaskAndWaitForSync(page, firstTitle);
  await createTaskAndWaitForSync(page, secondTitle);

  const firstRow = rowFor(page, firstTitle);
  const secondRow = rowFor(page, secondTitle);

  const handle = firstRow.getByText("☰");
  const handleBox = await handle.boundingBox();
  const targetBox = await secondRow.boundingBox();

  if (!handleBox || !targetBox) {
    throw new Error("Could not measure drag handle or target row.");
  }

  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
  await page.mouse.down();
  // Move past dnd-kit's activation distance (default 8px) before the
  // final position, or the drag never actually starts.
  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + 20, { steps: 5 });
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height + 5, {
    steps: 10,
  });
  await page.mouse.up();

  await expect(async () => {
    const rows = await page.locator("[data-testid^='task-row-']").allInnerTexts();
    const firstIndex = rows.findIndex((text) => text.includes(firstTitle));
    const secondIndex = rows.findIndex((text) => text.includes(secondTitle));
    expect(secondIndex).toBeLessThan(firstIndex);
  }).toPass({ timeout: 10_000 });

  await rowFor(page, firstTitle).getByText("Delete").click();
  await rowFor(page, secondTitle).getByText("Delete").click();
});
