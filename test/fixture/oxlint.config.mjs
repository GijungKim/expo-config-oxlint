// Consumer-style config: exactly what the README tells users to write,
// including the optional React Native style-rules fragment.
import { defineConfig } from "oxlint";

import expo, { reactNativeConfig } from "../../index.js";

export default defineConfig({
  ...expo,
  jsPlugins: [...expo.jsPlugins, ...reactNativeConfig.jsPlugins],
  rules: { ...expo.rules, ...reactNativeConfig.rules },
});
