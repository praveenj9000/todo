import { chromium, type FullConfig } from "@playwright/test";
import { deleteAllE2ETasks } from "./cleanup";
import { ensureListSelected } from "./helpers";

export default async function globalSetup(config: FullConfig) {
  await deleteAllE2ETasks();

  const baseURL = config.projects[0].use.baseURL!;

  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on("pageerror", (err) => console.log(`[browser error] ${err.message}`));
  page.on("requestfailed", (req) =>
    console.log(`[request failed] ${req.method()} ${req.url()} — ${req.failure()?.errorText}`),
  );

  await page.goto(baseURL!);

  const emailInput = page.getByPlaceholder("Email");

  let foundEmailInput = true;

  try {
    await emailInput.waitFor({ state: "visible", timeout: 15_000 });
  } catch {
    foundEmailInput = false;
  }

  console.log(`[global-setup] Found login form: ${foundEmailInput}`);

  if (foundEmailInput) {
    await emailInput.fill(process.env.E2E_TEST_USER_EMAIL!);
    await page.getByPlaceholder("Password").fill(process.env.E2E_TEST_USER_PASSWORD!);
    await page.getByText("Login", { exact: true }).click();

    // Give the login request a moment to resolve and any error text to render.
    await page.waitForTimeout(3000);

    const bodyText = await page.locator("body").innerText();
    console.log(`[global-setup] Page text after login attempt:\n${bodyText}`);
  }

  await ensureListSelected(page);

  try {
    await page.getByPlaceholder("Add a task...").waitFor({ timeout: 15_000 });
    console.log("[global-setup] Reached task screen.");
  } catch {
    console.log(`[global-setup] Never reached task screen. Current URL: ${page.url()}`);
    throw new Error("Login did not lead to task screen — see logs above.");
  }

  await page.context().storageState({ path: "e2e/.auth/state.json" });

  await browser.close();
}
