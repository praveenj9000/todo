import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const OUTPUT_FILE = "all_changed_files.txt";

try {
  // Get all modified, added, or untracked files
  const statusOutput = execSync("git status --porcelain", { encoding: "utf8" });

  const files = statusOutput
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.substring(line.indexOf(" ") + 1).trim())
    .filter((file) => file !== OUTPUT_FILE && existsSync(file));

  if (files.length === 0) {
    console.log("No changed files found.");
    process.exit(0);
  }

  let content = "";

  for (const file of files) {
    content += `========================================\n`;
    content += `FILE: ${file}\n`;
    content += `========================================\n`;
    content += readFileSync(file, "utf8");
    content += `\n\n`;
  }

  writeFileSync(OUTPUT_FILE, content, "utf8");
  console.log(`Successfully exported ${files.length} file(s) to ${OUTPUT_FILE}`);
} catch (error) {
  console.error("Error generating dump:", error.message);
  process.exit(1);
}
