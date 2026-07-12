// Fixture: every block below must trigger the named rule.
import { useEffect, useState } from "react";

// react-hooks-js/rules-of-hooks — hook called conditionally
export function ConditionalHook({ enabled }: { enabled: boolean }) {
  if (enabled) {
    const [x] = useState(0);
    return <span>{x}</span>;
  }
  return null;
}

// react-hooks-js/set-state-in-render — unconditional setState during render
export function SetStateInRender() {
  const [count, setCount] = useState(0);
  setCount(count + 1);
  return <span>{count}</span>;
}

// react-hooks-js/set-state-in-effect — synchronous setState in effect body
export function SetStateInEffect() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  return <span>{String(ready)}</span>;
}

// react-hooks-js/exhaustive-deps — missing dependency
export function MissingDep({ value }: { value: number }) {
  const [doubled, setDoubled] = useState(0);
  useEffect(() => {
    setDoubled(value * 2);
  }, []);
  return <span>{doubled}</span>;
}

// react-native/no-inline-styles — inline style object on a component
export function InlineStyle() {
  const [on] = useState(false);
  return <Box style={{ flex: 1, opacity: on ? 1 : 0.5 }} />;
}
declare function Box(props: { style?: unknown }): null;

// expo-js/no-dynamic-env-var — dynamic process.env access
// (the rule matches variable declarations specifically)
export function dynamicEnv(name: string) {
  const value = process.env[name];
  return value;
}

// expo-js/no-env-var-destructuring — destructuring process.env
export function destructuredEnv() {
  const { NODE_ENV } = process.env;
  return NODE_ENV;
}
