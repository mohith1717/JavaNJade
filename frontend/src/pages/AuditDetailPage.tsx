import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError } from "../api/ApiError";
import { getAuditEvent } from "../api/auditApi";
import { JsonViewer } from "../components/audit/JsonViewer";
import { ErrorState } from "../components/feedback/ErrorState";
import { LoadingState } from "../components/feedback/LoadingState";
import type { AuditEvent } from "../types/audit";

export function AuditDetailPage() {
  const { auditEventId = "" } = useParams(); const [event, setEvent] = useState<AuditEvent | null>(null); const [error, setError] = useState("");
  useEffect(() => { getAuditEvent(auditEventId).then(setEvent).catch((caught) => setError(caught instanceof ApiError ? caught.message : "Unable to load audit event.")); }, [auditEventId]);
  if (error) return <ErrorState title="Audit event unavailable" message={error} />; if (!event) return <LoadingState message="Loading audit evidence…" />;
  return <section className="audit-detail-page"><div className="investigation-toolbar"><Link to="/admin/audit">← Audit history</Link><span className="immutable-label">Immutable record</span></div><article className="investigation-card"><div className="card-heading"><div><p className="eyebrow">{event.entityType}</p><h2>{event.action}</h2></div><time>{formatDate(event.occurredAt)}</time></div><dl className="detail-grid"><CopyDetail label="Actor" value={event.actorUsername} /><CopyDetail label="Actor ID" value={event.actorId} /><CopyDetail label="Entity type" value={event.entityType} /><CopyDetail label="Entity ID" value={event.entityId} /><CopyDetail label="Audit event ID" value={event.id} /></dl>{event.reason && <div className="resolution-note"><strong>Recorded reason</strong><p>{event.reason}</p></div>}</article><div className="audit-json-grid"><JsonViewer title="Previous value" value={event.previousValue} tone="before" /><JsonViewer title="New value" value={event.newValue} tone="after" /></div><JsonViewer title="Additional details" value={event.details} /></section>;
}
function CopyDetail({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd className="copy-value"><span>{value}</span><button onClick={() => void navigator.clipboard.writeText(value)}>Copy</button></dd></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "long" }).format(new Date(value)); }
