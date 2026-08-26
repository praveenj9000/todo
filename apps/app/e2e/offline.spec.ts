import { expect, test } from "@playwright/test";
import { ensureListSelected, rowFor } from "./helpers";

const runId = Date.now();
const taskTitle = `[e2e-${runId}] Offline task`;

test("a task created while offline appears immediately and syncs on reconnect", async ({
  page,
  context,
}) => {
  await page.goto("/");

  await page
    .getByText(/No tasks yet|task-row-/)
    .waitFor({ timeout: 15_000 })
    .catch(() => {});

  await ensureListSelected(page);

  await context.setOffline(true);

  const input = page.getByPlaceholder("Add a task...");
  await input.fill(taskTitle);
  await page.getByText("Add", { exact: true }).click();

  // No network call is possible yet — this must be the optimistic
  // update rendering.
  await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 8000 });

  // Reconnect and wait directly for the actual sync request, in the
  // SAME session (no reload). This tests TanStack Query's built-in
  // same-session auto-resume — a paused mutation's live in-memory
  // Promise continues automatically once onlineManager reports online,
  // with no app code involved. This is deliberately a different
  // mechanism from restart-resume (resumePausedMutations after an app
  // kill/reload), which is already verified separately — reloading
  // here would destroy the live Promise before it can complete and
  // force dependence on the restart path instead, testing the wrong
  // thing.
  const syncRequest = page.waitForRequest(
    (req) => req.method() === "POST" && req.url().includes("/rest/v1/tasks"),
    { timeout: 15_000 },
  );

  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));

  const request = await syncRequest;
  expect(request).toBeTruthy();

  await rowFor(page, taskTitle).getByText("Delete").click();
});
