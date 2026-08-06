import { Link } from "react-router-dom";
import { RiskBadge } from "../badges/RiskBadge";
import { StatusBadge } from "../badges/StatusBadge";
import type { Transaction } from "../../types/transaction";

export function TransactionSummary({ transaction }: { transaction: Transaction }) {
  return <article className="investigation-card transaction-summary-card"><div className="card-heading"><div><p className="eyebrow">Related transaction</p><h2>{transaction.externalTransactionId}</h2></div><RiskBadge level={transaction.riskLevel} /></div><div className="amount-display"><span>Transfer value</span><strong>{new Intl.NumberFormat(undefined, { style: "currency", currency: transaction.currency }).format(transaction.amount)}</strong></div><dl className="detail-grid"><Detail label="Sender account" value={transaction.senderAccountId} /><Detail label="Receiver account" value={transaction.receiverAccountId} /><Detail label="Occurred at" value={formatDate(transaction.occurredAt)} /><div><dt>Processing status</dt><dd><StatusBadge status={transaction.processingStatus} /></dd></div></dl><Link className="view-alert-link" to={`/transactions/${transaction.id}`}>Open complete transaction →</Link></article>;
}
function Detail({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd className={label.includes("account") ? "mono-value" : ""}>{value}</dd></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
