import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const fixtureDir = path.join(testDir, "fixture");
const oxlintBin = path.join(testDir, "..", "node_modules", ".bin", "oxlint");

function runOxlint(...files) {
  const result = spawnSync(oxlintBin, ["-c", "oxlint.config.mjs", ...files], {
    cwd: fixtureDir,
    encoding: "utf8",
  });
  assert.equal(result.error, undefined, "oxlint should spawn");
  return result;
}

test("violations fixture triggers every layer of the preset", () => {
  const { stdout, stderr } = runOxlint("violations.tsx");
  const output = stdout + stderr;

  const expected = [
    // native react-hooks layer via JS plugin
    "react-hooks-js(rules-of-hooks)",
    "react-hooks-js(exhaustive-deps)",
    // React Compiler rules via JS plugin
    "react-hooks-js(set-state-in-render)",
    "react-hooks-js(set-state-in-effect)",
    // eslint-plugin-expo via JS plugin
    "expo-js(no-dynamic-env-var)",
    "expo-js(no-env-var-destructuring)",
    // optional oxlint-plugin-react-native fragment
    "react-native(no-inline-styles)",
  ];
  for (const ruleId of expected) {
    assert.ok(output.includes(ruleId), `expected diagnostic ${ruleId}\n--- oxlint output ---\n${output}`);
  }

  // Native ports of rules-of-hooks/exhaustive-deps are disabled in favor of
  // the JS-plugin versions — each violation must be reported exactly once.
  assert.ok(
    !output.includes("react-hooks(rules-of-hooks)"),
    `native rules-of-hooks should be off (deduped)\n--- oxlint output ---\n${output}`,
  );
});

test("clean fixture produces zero diagnostics", () => {
  const { stdout, stderr, status } = runOxlint("clean.tsx");
  const output = stdout + stderr;
  assert.equal(status, 0, `expected exit 0\n--- oxlint output ---\n${output}`);
  assert.ok(!/warning|error/.test(output), `expected no diagnostics\n--- oxlint output ---\n${output}`);
});
