type RankedItem = { key: string; label: string; value: number; detail: string };

export function RankedBars({ title, eyebrow, items, empty }: { title: string; eyebrow: string; items: RankedItem[]; empty: string }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return <article className="dashboard-card ranked-card"><header><div><p className="eyebrow">{eyebrow}</p><h3>{title}</h3></div></header>{items.length === 0 ? <p className="dashboard-empty">{empty}</p> : <ol>{items.map((item, index) => <li key={item.key}><span>{index + 1}</span><div><div><strong>{item.label}</strong><small>{item.detail}</small></div><i><b style={{ width: `${item.value / max * 100}%` }} /></i></div><em>{formatNumber(item.value)}</em></li>)}</ol>}</article>;
}
function formatNumber(value: number) { return Number.isInteger(value) ? String(value) : value.toFixed(1); }
