export interface OxlintJsPlugin {
  name: string;
  specifier: string;
}

export type RuleSeverity = "off" | "warn" | "error";

export declare const reactHooksJsPlugin: OxlintJsPlugin;
export declare const expoJsPlugin: OxlintJsPlugin;
export declare const reactHooksRules: Record<string, RuleSeverity>;
export declare const expoRules: Record<string, RuleSeverity>;
export declare const jsPluginConfig: {
  jsPlugins: OxlintJsPlugin[];
  rules: Record<string, RuleSeverity>;
};
export declare const reactNativeConfig: {
  jsPlugins: OxlintJsPlugin[];
  rules: Record<string, RuleSeverity>;
};

declare const config: Record<string, unknown> & {
  jsPlugins: OxlintJsPlugin[];
  rules: Record<string, unknown>;
};
export default config;
