import type { AlertHistory } from "../../types/alert";

export function AlertHistoryTimeline({ history }: { history: AlertHistory[] }) {
  return <article className="investigation-card"><div className="card-heading"><div><p className="eyebrow">Immutable history</p><h2>Alert timeline</h2></div><span className="record-count">{history.length} events</span></div>{history.length === 0 ? <p className="section-muted">No history events are available.</p> : <ol className="history-timeline">{history.map((event) => <li key={event.id}><span className="timeline-dot" /><div className="timeline-content"><div><strong>{event.toStatus.replaceAll("_", " ")}</strong><time>{formatDate(event.changedAt)}</time></div><p>{event.fromStatus ? `${event.fromStatus.replaceAll("_", " ")} → ` : "Created as "}{event.toStatus.replaceAll("_", " ")}</p><blockquote>{event.reason || "No reason recorded"}</blockquote><span>Changed by <b>{event.changedBy}</b></span></div></li>)}</ol>}</article>;
}
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
