import type { Page } from "@playwright/test";

export function rowFor(page: Page, title: string) {
  return page
    .getByText(title, { exact: true })
    .locator("xpath=ancestor::*[starts-with(@data-testid, 'task-row-')][1]");
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
