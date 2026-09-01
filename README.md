# expo-config-oxlint

[Oxlint](https://oxc.rs) preset for Expo apps. Extends Expo's own
[`oxlint-config-universe/native`](https://github.com/expo/oxlint-config-universe) and layers in the
full
[`eslint-plugin-react-hooks`](https://react.dev/reference/eslint-plugin-react-hooks) v7 rule set
(**including the React Compiler rules**: `immutability`, `purity`, `refs`, `set-state-in-effect`,
`preserve-manual-memoization`, ...) and the
[`eslint-plugin-expo`](https://www.npmjs.com/package/eslint-plugin-expo) rules — loaded through
[Oxlint JS plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins).

The goal: the enforcement of [`eslint-config-expo`](https://github.com/expo/expo/tree/main/packages/eslint-config-expo)
at oxlint speed. On a mid-size Expo app (~65 components), the full pass — compiler rules
included — runs about **2× faster than ESLint**, and the native-rule portion is near-instant.

## Status: bridge package

Expo is [migrating its own monorepo to oxlint/oxfmt](https://github.com/expo/expo/pull/47096), but
`eslint-config-expo` (the app-facing config) and the official docs are still ESLint.
`oxlint-config-universe` now exposes native Oxlint ports of most React hooks/compiler rules; this
package deliberately uses the React team's JS-plugin implementations instead, disables the native
overlaps, and adds the remaining React and Expo rules. It bridges the gap **until Expo ships
official app-facing oxlint support** — at which point you should switch to theirs (and this README
will say so in bold).

Also note: Oxlint JS plugins are **alpha**. The wiring here is conformance-tested (see
`test/`), but expect the occasional breakage on oxlint upgrades. Pin your oxlint version.

## How this differs from Expo's Oxlint setup

[Expo PR #47096](https://github.com/expo/expo/pull/47096) moved packages in Expo's own
monorepo from ESLint/Prettier to Oxlint/Oxfmt. That is strong validation of the toolchain, but it
is not an app-facing replacement for this preset: [`npx expo
lint`](https://github.com/expo/expo/blob/main/packages/%40expo/cli/src/lint/lintAsync.ts) still
bootstraps and runs ESLint for Expo apps.

Both setups start from `oxlint-config-universe/native`, but they target different codebases:

| | [Expo's `expo-module-scripts` base](https://github.com/expo/expo/blob/main/packages/expo-module-scripts/oxlint.config.base.js) | `expo-config-oxlint` |
|---|---|---|
| Intended for | Maintaining Expo's monorepo packages and Expo modules | Application code in ordinary Expo projects |
| React hooks/compiler | Native Oxlint rules, with compiler-derived rules disabled where Expo's existing code has untriaged violations | All 17 rules from the React team's `recommended-latest` config; overlapping native rules are disabled to prevent duplicate diagnostics |
| Expo-specific rules | Does not load the `eslint-plugin-expo` JS plugin | Loads the three Expo rules enabled by `eslint-config-expo` |
| React Native style rules | Not included | Available through the opt-in `reactNativeConfig` fragment |
| Project policy | Expo-monorepo ignores, test exceptions, and rule relaxations | A reusable app preset without Expo's repository-specific exceptions |
| Formatting | Runs Oxfmt through `expo-module format` | Lint-only; pair it with Oxfmt or your formatter of choice |

If you are working inside Expo's monorepo or using its module toolchain, use Expo's base. If you
are replacing `eslint-config-expo` in an Expo app and want its Expo rules plus the complete React
Compiler lint set, use this package. If Expo later ships an official app-facing Oxlint preset,
the exported `jsPluginConfig` can be composed on top of it during migration.

## Install

```sh
npm install --save-dev expo-config-oxlint oxlint
```

## Use

Create `oxlint.config.mjs` at your project root:

```js
import { defineConfig } from "oxlint";
import expo from "expo-config-oxlint";

export default defineConfig({
  ...expo,
  // your overrides here
});
```

Run it:

```sh
npx oxlint
```

### Composing with your own base

If you only want the JS-plugin wiring (react-hooks + expo rules) on top of a different base
config, use the `jsPluginConfig` fragment:

```js
import { defineConfig } from "oxlint";
import native from "oxlint-config-universe/native";
import { jsPluginConfig } from "expo-config-oxlint";

export default defineConfig({
  ...native,
  ...jsPluginConfig,
  rules: { ...native.rules, ...jsPluginConfig.rules },
});
```

### Softening the compiler rules

The react-hooks rules ship at the severities of the plugin's own `recommended-latest` config
(most compiler rules are `error`). Animation-heavy React Native code (Reanimated shared values,
gesture worklets) triggers them legitimately — downgrade or disable per rule:

```js
export default defineConfig({
  ...expo,
  rules: {
    ...expo.rules,
    "react-hooks-js/immutability": "warn",
  },
});
```

## What's included

| Layer | Source | Rules |
|---|---|---|
| Oxlint native rules for RN/Expo | `oxlint-config-universe/native` (Expo-maintained) | eslint core, typescript, react, jsx-a11y, ... |
| React hooks + **React Compiler** | `eslint-plugin-react-hooks@7` via JS plugin, namespace `react-hooks-js` | all 17 `recommended-latest` rules; overlapping native Oxlint ports are disabled |
| Expo rules | `eslint-plugin-expo` via JS plugin, namespace `expo-js` | `use-dom-exports`, `no-env-var-destructuring`, `no-dynamic-env-var` (the set `eslint-config-expo` enables) |
| React Native style rules (opt-in) | [`oxlint-plugin-react-native`](https://github.com/huextrat/oxlint-plugin-react-native), namespace `react-native` | `no-inline-styles`, `no-unused-styles`, `no-single-element-style-arrays` via the `reactNativeConfig` fragment |

All plugins are **dependencies of this package**, so they resolve even if your app has no ESLint
installed at all.

### Opt-in: React Native style rules

`eslint-config-expo` doesn't enable `eslint-plugin-react-native`'s style rules, so neither does
this preset by default. If your ESLint setup added them (common in Ignite-derived apps), compose
the fragment — it uses a native Oxlint port with the **same `react-native/...` rule names**, so
existing disable comments keep working:

```js
import { defineConfig } from "oxlint";
import expo, { reactNativeConfig } from "expo-config-oxlint";

export default defineConfig({
  ...expo,
  jsPlugins: [...expo.jsPlugins, ...reactNativeConfig.jsPlugins],
  rules: { ...expo.rules, ...reactNativeConfig.rules },
});
```

## What's NOT included (gaps vs eslint-config-expo)

Be aware of these before deleting ESLint:

- **`import/order`** — no oxlint implementation. Expo's answer is
  [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html)'s `sortImports`; use that (or keep
  Prettier + an import-sorting plugin).
- **Prettier integration** (`prettier/prettier` as a lint rule) — run `prettier --check` as a
  separate step, or switch to oxfmt.
- A handful of eslint core rules `oxlint-config-universe` documents as uncovered.

If any of these are load-bearing for you, run a slimmed ESLint config alongside oxlint for just
those rules (use [`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint) to
turn off everything oxlint already covers).

## Pairs well with: anti-slop

[anti-slop](https://github.com/dmmulroy/anti-slop) is a set of opinionated, generic TypeScript
Oxlint rules (no `unknown` params/returns, no `Record<string, unknown>`, a `// SAFETY:` comment on
every `as`, no `jest.mock`, ...). It is deliberately **not** part of this preset — it isn't Expo-
or RN-specific, and its author intends it to be vendored and edited per repo rather than
depended on. Install it into your app alongside this preset with:

```sh
npx skills add dmmulroy/anti-slop --skill install-anti-slop
```

Expect these rules to fire on ordinary Expo/RN code — soften or disable them per project:

- `anti-slop/no-module-mocking` — `jest.mock("expo-*")` / `jest.mock("react-native-reanimated")`
  is standard in `jest-expo` tests.
- `anti-slop/no-conditional-empty-object-spread` — `...(Platform.OS === "ios" ? { ... } : {})`
  in styles/props.
- `anti-slop/no-runtime-typeof` — `typeof window !== "undefined"` web-platform guards.
- `anti-slop/require-safety-comment-for-type-assertion` — `route.params as X` and friends.

## Migrating existing `eslint-disable` comments

Because Oxlint reserves the `react-hooks` namespace, this preset loads the plugin as
`react-hooks-js`. Your existing inline suppressions name the old rule, so they will NOT
suppress — every previously-triaged violation resurfaces on first run (which doubles as a nice
audit). Rewrite them:

```sh
# macOS sed; drop the '' on Linux
grep -rl "eslint-disable-next-line react-hooks/" src app | \
  xargs sed -i '' 's|eslint-disable-next-line react-hooks/|oxlint-disable-next-line react-hooks-js/|g'
```

(Using `oxlint-disable` rather than `eslint-disable` keeps the two linters' suppressions
independent if you run both during a transition.)

## Conformance

`npm test` lints fixture files with known violations through the real published packages and
asserts each layer fires: `rules-of-hooks`, `exhaustive-deps`, the compiler rules
(`set-state-in-render`, `set-state-in-effect`), and the expo rules (`no-dynamic-env-var`,
`no-env-var-destructuring`) — while asserting native ports do not duplicate them, plus a clean
file that must produce zero diagnostics.

## License

MIT
