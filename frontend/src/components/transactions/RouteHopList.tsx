import type { TransactionRouteHop } from "../../types/transaction";

export function RouteHopList({ route }: { route: TransactionRouteHop[] }) {
  const ordered = [...route].sort((a, b) => a.sequence - b.sequence);
  return <article className="investigation-card"><div className="card-heading"><div><p className="eyebrow">Persisted route</p><h2>Country route hops</h2></div><span className="record-count">{ordered.length} hops</span></div>{ordered.length === 0 ? <p className="section-muted">No route hops were submitted.</p> : <ol className="route-hop-list">{ordered.map((hop, index) => <li key={hop.id}><span>{hop.sequence}</span><div><strong>{hop.countryCode}</strong><small>{hop.institution || "Institution unavailable"}</small></div>{index < ordered.length - 1 && <i>↓</i>}</li>)}</ol>}</article>;
}
