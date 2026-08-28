import { readFileSync, writeFileSync } from "node:fs";

// lint-staged passes the matched staged filenames as CLI args. Falling back
// to nothing (rather than re-implementing the old `git ls-files` scan) keeps
// this scoped to whatever's actually being committed.
const files = process.argv.slice(2).filter((file) => !file.includes("database.ts"));

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

if (changedCount > 0) {
  console.log(`✓ Collapsed imports in ${changedCount} file(s).`);
}