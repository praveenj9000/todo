import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const rawName = process.argv[2];

if (!rawName) {
  console.error("Usage: pnpm new-feature <feature_name>");
  process.exit(1);
}

const name = rawName.toLowerCase();

if (!/^[a-z0-9-]+$/.test(name)) {
  console.error(
    `✖ Invalid feature name "${rawName}". Use lowercase letters, numbers, and hyphens only.`,
  );
  process.exit(1);
}

const featureRoot = resolve("apps/app/src/features", name);

if (existsSync(featureRoot)) {
  console.error(`✖ Feature "${name}" already exists at ${featureRoot}`);
  process.exit(1);
}

const folders = [
  "api",
  "components",
  "constants",
  "hooks",
  "screens",
  "stores",
  "types",
];

for (const folder of folders) {
  mkdirSync(resolve(featureRoot, folder), { recursive: true });
}

const pascalName = name
  .split("-")
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join("");

writeFileSync(
  resolve(featureRoot, "screens", `${pascalName}Screen.tsx`),
  `import { YStack, Text } from "tamagui";

export function ${pascalName}Screen() {
  return (
    <YStack flex={1} padding="$4">
      <Text>${pascalName}</Text>
    </YStack>
  );
}
`,
);

writeFileSync(
  resolve(featureRoot, "index.ts"),
  `export { ${pascalName}Screen } from "./screens/${pascalName}Screen";
`,
);

console.log(`✓ Created feature "${name}" at apps/app/src/features/${name}`);
console.log("\nStructure:");
folders.forEach((folder) => console.log(`  ${name}/${folder}/`));
console.log(`  ${name}/screens/${pascalName}Screen.tsx`);
console.log(`  ${name}/index.ts`);
console.log(
  "\nNot every folder is required — delete any this feature doesn't need (see docs/architecture.md).",
);