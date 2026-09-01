import native from "oxlint-config-universe/native";

/**
 * Oxlint JS-plugin declaration for eslint-plugin-react-hooks.
 *
 * The namespace must NOT be "react-hooks" — that name is reserved by Oxlint
 * itself (a subset of the plugin's rules ship natively). The renamed
 * namespace means existing `eslint-disable-next-line react-hooks/...`
 * comments do not suppress these rules; see the README migration section.
 */
export const reactHooksJsPlugin = {
  name: "react-hooks-js",
  specifier: "eslint-plugin-react-hooks",
};

/** Oxlint JS-plugin declaration for eslint-plugin-expo. */
export const expoJsPlugin = {
  name: "expo-js",
  specifier: "eslint-plugin-expo",
};

/**
 * The full eslint-plugin-react-hooks v7 rule set — including the React
 * Compiler rules (immutability, purity, refs, set-state-in-effect, ...) —
 * at the severities of the plugin's own `recommended-latest` config.
 */
export const reactHooksRules = {
  "react-hooks-js/rules-of-hooks": "error",
  "react-hooks-js/exhaustive-deps": "warn",
  "react-hooks-js/static-components": "error",
  "react-hooks-js/use-memo": "error",
  "react-hooks-js/void-use-memo": "error",
  "react-hooks-js/preserve-manual-memoization": "error",
  "react-hooks-js/incompatible-library": "warn",
  "react-hooks-js/immutability": "error",
  "react-hooks-js/globals": "error",
  "react-hooks-js/refs": "error",
  "react-hooks-js/set-state-in-effect": "error",
  "react-hooks-js/error-boundaries": "error",
  "react-hooks-js/purity": "error",
  "react-hooks-js/set-state-in-render": "error",
  "react-hooks-js/unsupported-syntax": "warn",
  "react-hooks-js/config": "error",
  "react-hooks-js/gating": "error",
};

/**
 * The eslint-plugin-expo rules that eslint-config-expo enables, at the same
 * severities. (`expo/prefer-box-shadow` is not enabled there, so it is not
 * enabled here.)
 */
export const expoRules = {
  "expo-js/use-dom-exports": "error",
  "expo-js/no-env-var-destructuring": "error",
  "expo-js/no-dynamic-env-var": "error",
};

/**
 * Optional React Native style rules via oxlint-plugin-react-native — a
 * native Oxlint port of eslint-plugin-react-native (same rule names, so
 * existing `react-native/...` disable comments carry over). Not part of
 * the default preset (eslint-config-expo doesn't enable these either);
 * compose it in explicitly:
 *
 *   import expo, { reactNativeConfig } from "expo-config-oxlint";
 *   export default defineConfig({
 *     ...expo,
 *     jsPlugins: [...expo.jsPlugins, ...reactNativeConfig.jsPlugins],
 *     rules: { ...expo.rules, ...reactNativeConfig.rules },
 *   });
 */
export const reactNativeConfig = {
  jsPlugins: [{ name: "react-native", specifier: "oxlint-plugin-react-native" }],
  rules: {
    "react-native/no-inline-styles": "warn",
    "react-native/no-unused-styles": "warn",
    "react-native/no-single-element-style-arrays": "warn",
  },
};

/**
 * Just the JS-plugin wiring (react-hooks + expo rules), without the
 * oxlint-config-universe base. Compose this with your own base config —
 * e.g. once Expo ships an official app-facing oxlint preset:
 *
 *   import { defineConfig } from "oxlint";
 *   import { jsPluginConfig } from "expo-config-oxlint";
 *   export default defineConfig({ ...theirPreset, ...jsPluginConfig });
 */
export const jsPluginConfig = {
  jsPlugins: [reactHooksJsPlugin, expoJsPlugin],
  rules: { ...reactHooksRules, ...expoRules },
};

/**
 * The full preset: oxlint-config-universe/native (Expo's own oxlint base
 * for React Native / Expo apps) merged with the JS-plugin rules above.
 */
const config = {
  ...native,
  jsPlugins: [...(native.jsPlugins ?? []), reactHooksJsPlugin, expoJsPlugin],
  rules: {
    ...(native.rules ?? {}),
    ...reactHooksRules,
    ...expoRules,
    // Oxlint ships native ports for most react-hooks/compiler rules. Its
    // correctness category enables many of them by default. Prefer the React
    // team's JS-plugin implementations above and disable every native overlap
    // so each violation is reported exactly once.
    "react/rules-of-hooks": "off",
    "react/exhaustive-deps": "off",
    "react/error-boundaries": "off",
    "react/globals": "off",
    "react/immutability": "off",
    "react/incompatible-library": "off",
    "react/preserve-manual-memoization": "off",
    "react/purity": "off",
    "react/refs": "off",
    "react/set-state-in-effect": "off",
    "react/set-state-in-render": "off",
    "react/static-components": "off",
    "react/unsupported-syntax": "off",
    "react/use-memo": "off",
    "react/void-use-memo": "off",
  },
};

export default config;
