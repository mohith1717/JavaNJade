import type { TransactionVolume } from "../../types/report";

export function VolumeChart({ data }: { data: TransactionVolume[] }) {
  const ordered = [...data].sort((a, b) => Date.parse(a.periodStart) - Date.parse(b.periodStart));
  const max = Math.max(1, ...ordered.map((item) => item.transactionCount));
  const points = ordered.map((item, index) => `${ordered.length === 1 ? 50 : index / (ordered.length - 1) * 100},${92 - item.transactionCount / max * 76}`).join(" ");
  return <article className="dashboard-card volume-card"><header><div><p className="eyebrow">Monitoring activity</p><h3>Transaction volume</h3></div><span>{ordered.reduce((sum, item) => sum + item.transactionCount, 0)} transfers</span></header>{ordered.length === 0 ? <p className="dashboard-empty">No volume data for these filters</p> : <><div className="volume-chart"><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Transaction volume trend"><defs><linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9c3fe0" stopOpacity=".45" /><stop offset="1" stopColor="#9c3fe0" stopOpacity="0" /></linearGradient></defs><polygon points={`0,100 ${points} 100,100`} fill="url(#volumeFill)" /><polyline points={points} fill="none" stroke="#b95df2" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg></div><div className="volume-axis"><span>{formatPeriod(ordered[0].periodStart)}</span><span>{formatPeriod(ordered.at(-1)!.periodStart)}</span></div></>}</article>;
}
function formatPeriod(value: string) { return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric" }).format(new Date(value)); }
