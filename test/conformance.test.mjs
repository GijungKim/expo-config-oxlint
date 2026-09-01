import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import config from "../index.js";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const fixtureDir = path.join(testDir, "fixture");
const oxlintBin = path.join(testDir, "..", "node_modules", ".bin", "oxlint");

const nativeReactOverlaps = [
  "react/rules-of-hooks",
  "react/exhaustive-deps",
  "react/error-boundaries",
  "react/globals",
  "react/immutability",
  "react/incompatible-library",
  "react/preserve-manual-memoization",
  "react/purity",
  "react/refs",
  "react/set-state-in-effect",
  "react/set-state-in-render",
  "react/static-components",
  "react/unsupported-syntax",
  "react/use-memo",
  "react/void-use-memo",
];

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

  // Native ports are disabled in favor of the React team's JS-plugin
  // implementations — each violation must be reported exactly once.
  for (const ruleId of [
    "react(rules-of-hooks)",
    "react(exhaustive-deps)",
    "react(set-state-in-render)",
    "react(set-state-in-effect)",
  ]) {
    assert.ok(
      !output.includes(ruleId),
      `native ${ruleId} should be off\n--- oxlint output ---\n${output}`,
    );
  }
});

test("native React hook/compiler overlaps are explicitly disabled", () => {
  for (const ruleId of nativeReactOverlaps) {
    assert.equal(config.rules[ruleId], "off", `${ruleId} should defer to the JS plugin`);
  }
});

test("clean fixture produces zero diagnostics", () => {
  const { stdout, stderr, status } = runOxlint("clean.tsx");
  const output = stdout + stderr;
  assert.equal(status, 0, `expected exit 0\n--- oxlint output ---\n${output}`);
  // Diagnostic lines look like "file:1:1: warning rule(name): ...". The
  // "Found 0 warnings and 0 errors." summary (printed on some platforms)
  // must not count as a diagnostic.
  assert.ok(!/:\s(warning|error)\s/.test(output), `expected no diagnostics\n--- oxlint output ---\n${output}`);
});
