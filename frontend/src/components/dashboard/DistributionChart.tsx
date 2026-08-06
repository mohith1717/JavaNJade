type Item = { label: string; value: number; color: string };

export function DistributionChart({ title, eyebrow, items, centerValue }: { title: string; eyebrow: string; items: Item[]; centerValue: number }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;
  return <article className="dashboard-card distribution-card"><header><div><p className="eyebrow">{eyebrow}</p><h3>{title}</h3></div><span className="chart-context">Live distribution</span></header>{total === 0 ? <p className="dashboard-empty">No matching data</p> : <div className="distribution-content"><div className="donut-wrap"><div className="donut" role="img" aria-label={`${title}: ${total} total`}>{items.map((item) => { const size = item.value / total * 100; const start = offset; offset += size; return <i key={item.label} style={{ "--start": `${start}%`, "--size": `${size}%`, "--color": item.color } as React.CSSProperties} />; })}<span><strong>{centerValue}</strong><small>Total</small></span></div><span className="donut-halo" /></div><ul>{items.map((item) => <li key={item.label}><i style={{ background: item.color }} /><span>{humanize(item.label)}<small>{percentage(item.value, total)}%</small></span><strong>{item.value}</strong></li>)}</ul></div>}</article>;
}
function percentage(value: number, total: number) { return total ? Math.round(value / total * 100) : 0; }
function humanize(value: string) { return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()); }
