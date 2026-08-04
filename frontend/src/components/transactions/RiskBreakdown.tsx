import { RiskBadge } from "../badges/RiskBadge";
import type { RiskAssessment } from "../../types/transaction";

export function RiskBreakdown({ assessment }: { assessment: RiskAssessment }) {
  const evaluations = [...assessment.evaluations].sort((a, b) => Number(b.triggered) - Number(a.triggered) || b.scoreContribution - a.scoreContribution);
  return <article className="investigation-card risk-breakdown"><div className="card-heading"><div><p className="eyebrow">Explainable score</p><h2>Risk assessment</h2></div><div className="assessment-total"><strong>{assessment.riskScore}</strong><RiskBadge level={assessment.riskLevel} /></div></div><div className="score-bar"><span style={{ width: `${Math.min(assessment.riskScore, 100)}%` }} /></div><div className="evaluation-list">{evaluations.map((evaluation) => <section className={evaluation.triggered ? "evaluation triggered" : "evaluation"} key={evaluation.evaluationId}><div className="evaluation-top"><div><span>{evaluation.ruleCode}</span><strong>{evaluation.ruleName}</strong></div><b>{evaluation.triggered ? `+${evaluation.scoreContribution}` : "+0"}</b></div><p>{evaluation.explanation}</p><footer><span>{evaluation.ruleType.replaceAll("_", " ")}</span><span>{evaluation.triggered ? "Triggered" : "Not triggered"}</span></footer></section>)}</div></article>;
}
