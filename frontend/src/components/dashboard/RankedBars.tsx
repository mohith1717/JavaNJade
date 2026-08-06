type RankedItem = { key: string; label: string; value: number; detail: string };

export function RankedBars({ title, eyebrow, items, empty }: { title: string; eyebrow: string; items: RankedItem[]; empty: string }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return <article className="dashboard-card ranked-card"><header><div><p className="eyebrow">{eyebrow}</p><h3>{title}</h3></div><span className="chart-context">Top {items.length}</span></header>{items.length === 0 ? <p className="dashboard-empty">{empty}</p> : <ol>{items.map((item, index) => <li key={item.key} className={index === 0 ? "rank-leader" : ""}><span className="rank-position">{String(index + 1).padStart(2, "0")}</span><div className="rank-content"><div className="rank-copy"><strong title={item.label}>{item.label}</strong><small>{item.detail}</small></div><div className="rank-measure"><i><b style={{ width: `${item.value / max * 100}%` }} /></i><em>{formatNumber(item.value)}</em></div></div></li>)}</ol>}</article>;
}
function formatNumber(value: number) { return Number.isInteger(value) ? String(value) : value.toFixed(1); }
