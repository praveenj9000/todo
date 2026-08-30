const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where the project root is
config.projectRoot = projectRoot;

// 3. Ensure Metro can resolve workspace packages — including each
//    package's own node_modules (design-system, etc.), not just the
//    app's and the workspace root's.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
  path.resolve(workspaceRoot, "packages/design-system/node_modules"),
];

// 4. pnpm's node_modules are symlinks into a shared store — Metro must
//    be told to follow them, or resolution silently fails for anything
//    not hoisted into apps/app/node_modules directly.
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
