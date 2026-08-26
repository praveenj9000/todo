import { expect, type Page } from "@playwright/test";

export function rowFor(page: Page, title: string) {
  return page
    .getByText(title, { exact: true })
    .locator("xpath=ancestor::*[starts-with(@data-testid, 'task-row-')][1]");
}

/**
 * Ensures a list is selected so the "Add a task" form can submit.
 *
 * The task screen auto-selects the first list once the lists query lands, so
 * in the normal case (user has at least one list) we only need to wait for
 * that to happen. Only when the user has ZERO lists does the "No list
 * selected" empty state persist — then create the "E2E List" once.
 *
 * Deliberately does NOT click a matching list in the sidebar: accumulating
 * duplicate "E2E List" rows across runs makes ".first()" resolve to a
 * different list each time, silently splitting tasks across lists.
 */
export async function ensureListSelected(page: Page) {
  // Sidebar create UI is present whenever the task screen loads.
  await page.getByText("Create", { exact: true }).waitFor({ state: "visible", timeout: 15_000 });

  // Allow the lists query + auto-select to settle. If a list was selected
  // (auto or otherwise), the "No list selected" empty state is absent.
  await page.waitForTimeout(1_500);
  const emptyState = page.getByText(/Select a list from the sidebar/);

  const noListSelected = await emptyState.isVisible().catch(() => false);

  if (noListSelected) {
    await page.getByPlaceholder("New list name...").fill("E2E List");
    await page.getByText("Create", { exact: true }).click();
    await expect(emptyState).toBeHidden({ timeout: 10_000 });
  }
}

/**
 * Creates a task and waits for the server-confirmed refetch to land
 * before returning — closes the race where the UI shows a task
 * instantly via an optimistic, client-generated id, but that id
 * doesn't exist server-side until the create mutation's onSettled
 * refetch replaces it with the real one. Interacting with a task
 * before this settles causes server-side operations against it
 * (create_linked_task, update, delete) to silently fail or reject.
 */
export async function createTaskAndWaitForSync(page: Page, title: string) {
  await ensureListSelected(page);

  await page.getByPlaceholder("Add a task...").fill(title);

  await Promise.all([
    page.waitForResponse(
      (res) => res.request().method() === "POST" && res.url().includes("/rest/v1/tasks"),
    ),
    page.getByText("Add", { exact: true }).click(),
  ]);

  await page.waitForResponse(
    (res) => res.request().method() === "GET" && res.url().includes("/rest/v1/tasks"),
  );

  await page.getByText(title).waitFor({ state: "visible", timeout: 20_000 });
}
