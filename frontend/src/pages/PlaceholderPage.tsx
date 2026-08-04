import { EmptyState } from "../components/feedback/EmptyState";
import { PriorityBadge } from "../components/badges/PriorityBadge";
import { RiskBadge } from "../components/badges/RiskBadge";
import { StatusBadge } from "../components/badges/StatusBadge";

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return <section className="placeholder-card"><p className="eyebrow">Authenticated workspace</p><h1>{title}</h1><p>{description}</p><div className="badge-demo" aria-label="Reusable badge examples"><RiskBadge level="CRITICAL" /><RiskBadge level="MEDIUM" /><PriorityBadge priority="HIGH" /><StatusBadge status="INVESTIGATING" /></div><EmptyState compact title="Ready for feature data" description="This shared state will be replaced by live records in the next page-specific step." /></section>;
}
