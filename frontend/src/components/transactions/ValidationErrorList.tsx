import type { TransactionValidationError } from "../../types/transaction";

export function ValidationErrorList({ errors }: { errors: TransactionValidationError[] }) {
  return <article className="investigation-card validation-card"><div className="card-heading"><div><p className="eyebrow">Validation outcome</p><h2>{errors.length ? "Transaction rejected" : "No validation errors"}</h2></div><span className={`record-count ${errors.length ? "error-count" : ""}`}>{errors.length} errors</span></div>{errors.length === 0 ? <p className="section-muted">The transaction passed all ingestion validation checks.</p> : <div className="validation-error-list">{errors.map((error) => <section key={error.id}><div><code>{error.code}</code><time dateTime={error.createdAt}>{formatDate(error.createdAt)}</time></div><strong>{error.field}</strong><p>{error.message}</p></section>)}</div>}</article>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
