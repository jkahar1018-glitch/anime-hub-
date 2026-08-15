import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "package.json",
  "app",
  "components",
  "lib",
];

let hasError = false;

for (const file of requiredFiles) {
  const target = path.join(root, file);

  if (fs.existsSync(target)) {
    console.log(`✓ ${file}`);
  } else {
    console.error(`✗ Missing: ${file}`);
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}

console.log("✓ AnimeHub smoke check passed.");