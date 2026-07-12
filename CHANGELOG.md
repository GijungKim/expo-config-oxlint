# Changelog

## 0.1.0

Initial release.

- Full preset extending `oxlint-config-universe/native` (Expo's own oxlint base for
  React Native / Expo apps)
- `eslint-plugin-react-hooks@7` loaded via Oxlint JS plugins under the `react-hooks-js`
  namespace — all 17 `recommended-latest` rules including the React Compiler rules
  (`immutability`, `purity`, `refs`, `set-state-in-effect`, `set-state-in-render`,
  `preserve-manual-memoization`, ...)
- `eslint-plugin-expo` loaded under the `expo-js` namespace with the same three rules
  `eslint-config-expo` enables (`use-dom-exports`, `no-env-var-destructuring`,
  `no-dynamic-env-var`)
- `jsPluginConfig` fragment export for composing with a different base config
- Opt-in `reactNativeConfig` fragment: React Native style rules via
  `oxlint-plugin-react-native` (native Oxlint port; same `react-native/...` rule names as
  `eslint-plugin-react-native`, so existing disable comments keep working)
- Fixture-based conformance test asserting every layer fires (and a clean file stays clean)
