import { useId } from "react";
import type { TransactionVolume } from "../../types/report";

export function VolumeChart({ data }: { data: TransactionVolume[] }) {
  const gradientId = `volume-fill-${useId().replaceAll(":", "")}`;
  const ordered = [...data].sort((a, b) => Date.parse(a.periodStart) - Date.parse(b.periodStart));
  const max = Math.max(1, ...ordered.map((item) => item.transactionCount));
  const total = ordered.reduce((sum, item) => sum + item.transactionCount, 0);
  const amount = ordered.reduce((sum, item) => sum + Number(item.totalAmount), 0);
  const points = ordered.map((item, index) => `${ordered.length === 1 ? 50 : index / (ordered.length - 1) * 100},${92 - item.transactionCount / max * 76}`).join(" ");
  return <article className="dashboard-card volume-card"><header><div><p className="eyebrow">Monitoring activity</p><h3>Transaction volume</h3></div><div className="chart-head-stats"><span><small>Total transfers</small><strong>{total}</strong></span><span><small>Peak period</small><strong>{max}</strong></span></div></header>{ordered.length === 0 ? <p className="dashboard-empty">No volume data for these filters</p> : <><div className="volume-chart"><div className="chart-y-labels"><span>{max}</span><span>{Math.round(max / 2)}</span><span>0</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`Transaction volume trend, ${total} transfers`}><defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0" className="volume-gradient-start" /><stop offset="1" className="volume-gradient-end" /></linearGradient></defs><polygon points={`0,100 ${points} 100,100`} fill={`url(#${gradientId})`} /><polyline points={points} className="volume-line-glow" fill="none" vectorEffect="non-scaling-stroke" /><polyline points={points} className="volume-line" fill="none" vectorEffect="non-scaling-stroke" /></svg></div><div className="volume-axis"><span>{formatPeriod(ordered[0].periodStart)}</span><strong>{formatCompact(amount)} monitored</strong><span>{formatPeriod(ordered.at(-1)!.periodStart)}</span></div></>}</article>;
}
function formatPeriod(value: string) { return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric" }).format(new Date(value)); }
function formatCompact(value: number) { return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value); }
