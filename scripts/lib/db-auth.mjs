import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import readline from "node:readline";

const TARGET_CONFIG = {
  prod: { envFile: ".env", refVar: "PROD_PROJECT_REF" },
  e2e: { envFile: ".env.e2e", refVar: "E2E_PROJECT_REF" },
};

function readEnvValue(envFile, varName) {
  if (!existsSync(envFile)) return null;

  let contents = readFileSync(envFile, "utf-8");
  // Strip a UTF-8 BOM if present — it can break the "^" anchor below when
  // the target var happens to be the first line in the file.
  if (contents.charCodeAt(0) === 0xfeff) {
    contents = contents.slice(1);
  }

  const match = contents.match(new RegExp(`^${varName}=(.*)$`, "m"));
  if (!match) return null;

  let value = match[1].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return value || null;
}

function promptPassword(question) {
  return new Promise((resolvePromise) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    rl._writeToOutput = (chunk) => {
      if (chunk === question || chunk === "\r\n" || chunk === "\n") {
        rl.output.write(chunk);
      } else {
        rl.output.write("*");
      }
    };

    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolvePromise(answer.trim());
    });
  });
}

/** Reads the project ref for `target` ("prod" | "e2e") from its env file. */
export function getProjectRef(target) {
  const config = TARGET_CONFIG[target];
  if (!config) throw new Error(`Unknown target: ${target}`);

  const envFile = resolve(config.envFile);
  const ref = readEnvValue(envFile, config.refVar);

  if (!ref) {
    console.error(`✖ ${config.refVar} is missing or empty in ${envFile}.`);
    process.exit(1);
  }

  return ref;
}

/**
 * Resolves the DB password for `target` and caches it in
 * process.env.SUPABASE_DB_PASSWORD for anything that still relies on the
 * env var (`supabase link`, `supabase migration list` via
 * verify-migration.mjs). `supabase db push` itself no longer depends on
 * this — see buildDirectDbUrl below — so this is now a secondary path,
 * not the only thing standing between you and a working push.
 */
export async function ensureDbPassword(target) {
  if (process.env.SUPABASE_DB_PASSWORD) {
    return process.env.SUPABASE_DB_PASSWORD;
  }

  const config = TARGET_CONFIG[target];
  if (!config) throw new Error(`Unknown target: ${target}`);

  const envFile = resolve(config.envFile);
  const fromFile = readEnvValue(envFile, "SUPABASE_DB_PASSWORD");

  if (fromFile) {
    process.env.SUPABASE_DB_PASSWORD = fromFile;
    console.log(
      `Using SUPABASE_DB_PASSWORD from ${envFile} ` +
        `(${fromFile.length} chars, starts with "${fromFile.slice(0, 2)}***").`,
    );
    return fromFile;
  }

  console.log(
    `\nSupabase CLI needs the ${target} project's database password.\n` +
      "Entering it here (masked) avoids a known hang in the CLI's own " +
      "prompt under Git Bash on Windows.\n" +
      `Tip: add "SUPABASE_DB_PASSWORD=..." to ${envFile} to skip this prompt.\n`,
  );

  const password = await promptPassword(`${target} database password: `);

  if (!password) {
    console.error("✖ No password entered. Aborting.");
    process.exit(1);
  }

  process.env.SUPABASE_DB_PASSWORD = password;
  return password;
}

/**
 * Builds a direct (non-pooler) Postgres connection string for `target`,
 * matching the host Supabase's CLI itself reports on auth errors
 * (db.<ref>.supabase.co, user postgres, db postgres, port 5432). Passing
 * this explicitly via --db-url means the push no longer depends on the
 * CLI's own connection cache (supabase/.temp/) or on SUPABASE_DB_PASSWORD
 * surviving inheritance across separate `pnpm dlx` process invocations —
 * both known ways this can silently break.
 */
export function buildDirectDbUrl(target, password) {
  const ref = getProjectRef(target);
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}

/** Same connection string with the password blotted out — safe to print. */
export function redactDbUrl(dbUrl) {
  return dbUrl.replace(/:\/\/postgres:[^@]*@/, "://postgres:****@");
}