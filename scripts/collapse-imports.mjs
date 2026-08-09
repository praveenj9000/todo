import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const files = execSync('git ls-files "*.ts" "*.tsx"', {
  encoding: "utf-8",
})
  .split("\n")
  .filter(Boolean)
  .filter((file) => !file.includes("database.ts"));

const importPattern = /import\s*\{([\s\S]*?)\}\s*from/g;

let changedCount = 0;

for (const file of files) {
  const original = readFileSync(file, "utf-8");

  const collapsed = original.replace(importPattern, (match, specifiers) => {
    const cleaned = specifiers
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .join(", ");

    return `import { ${cleaned} } from`;
  });

  if (collapsed !== original) {
    writeFileSync(file, collapsed);
    changedCount += 1;
  }
}

console.log(`✓ Collapsed imports in ${changedCount} file(s).`);
console.log("Run `pnpm format` next to let Prettier finalize formatting.");
