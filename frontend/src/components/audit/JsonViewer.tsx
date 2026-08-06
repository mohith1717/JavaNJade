import type { JsonValue } from "../../types/audit";

export function JsonViewer({ title, value, tone = "neutral" }: { title: string; value: JsonValue; tone?: "before" | "after" | "neutral" }) {
  return <section className={`json-viewer json-${tone}`}><header><strong>{title}</strong><button type="button" onClick={() => void navigator.clipboard.writeText(format(value))}>Copy JSON</button></header><pre>{format(value)}</pre></section>;
}
function format(value: JsonValue) { return value === null ? "No value recorded" : JSON.stringify(value, null, 2); }
