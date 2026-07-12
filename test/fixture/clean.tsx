// Fixture: must produce zero diagnostics.
import { useEffect, useState } from "react";

export function Clean({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }
  return <span>{label}</span>;
}
