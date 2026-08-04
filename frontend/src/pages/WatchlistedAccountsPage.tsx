import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";

import { ApiError } from "../api/ApiError";
import { createWatchlistedAccount, getWatchlistedAccounts, updateWatchlistedAccountStatus } from "../api/watchlistApi";
import { useAuth } from "../auth/AuthContext";
import { EmptyState } from "../components/feedback/EmptyState";
import { ErrorState } from "../components/feedback/ErrorState";
import { LoadingState } from "../components/feedback/LoadingState";
import type { WatchlistedAccount } from "../types/watchlist";

export function WatchlistedAccountsPage() {
  const { user } = useAuth();
  const admin = user?.role === "ADMIN";
  const [params, setParams] = useSearchParams();
  const [accounts, setAccounts] = useState<WatchlistedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const status = params.get("enabled") || "";
  const search = params.get("accountId") || "";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAccounts(await getWatchlistedAccounts({
        enabled: status === "" ? undefined : status === "true",
        accountId: search || undefined,
      }));
      setError("");
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { void load(); }, [load]);

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  }

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!accountId.trim() || !reason.trim()) {
      setError("Account ID and watchlist reason are required.");
      return;
    }
    setSaving(true); setError(""); setSuccess("");
    try {
      const saved = await createWatchlistedAccount(accountId.trim(), reason.trim());
      setAccountId(""); setReason(""); setShowCreate(false);
      setSuccess(`${saved.accountId} was added to the watchlist.`);
      setParams({}, { replace: true });
      await load();
    } catch (caught) { setError(messageOf(caught)); }
    finally { setSaving(false); }
  }

  async function toggle(account: WatchlistedAccount) {
    const nextEnabled = !account.enabled;
    const explanation = window.prompt(`Reason for ${nextEnabled ? "enabling" : "disabling"} ${account.accountId}:`);
    if (!explanation?.trim()) return;
    setBusyId(account.id); setError(""); setSuccess("");
    try {
      await updateWatchlistedAccountStatus(account.id, nextEnabled, explanation.trim());
      setSuccess(`${account.accountId} is now ${nextEnabled ? "enabled" : "disabled"}.`);
      await load();
    } catch (caught) { setError(messageOf(caught)); }
    finally { setBusyId(""); }
  }

  return <section className="watchlist-page">
    <div className="queue-toolbar"><div><p className="eyebrow">Account risk controls</p><h2>Watchlisted accounts</h2><p>{admin ? "Maintain accounts evaluated by the BLACKLISTED_ACCOUNT rule." : "Review accounts monitored by the risk engine."}</p></div>{admin && <button className="primary-button compact-button" onClick={() => setShowCreate((current) => !current)}>{showCreate ? "Cancel" : "Add account"}</button>}</div>
    <div className="rule-warning"><strong>Watchlist changes affect future assessments.</strong><span>Disabling an entry preserves its audit history and previous risk assessments.</span></div>
    {showCreate && <form className="watchlist-create investigation-card" onSubmit={create}><div><p className="eyebrow">New watchlist entry</p><h3>Add an account identifier</h3></div><label>Account ID<input value={accountId} onChange={(event) => setAccountId(event.target.value)} placeholder="ACC-SUSPICIOUS-001" maxLength={100} /></label><label>Reason<textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Why should future transactions involving this account be flagged?" maxLength={500} /></label><button className="primary-button compact-button" disabled={saving}>{saving ? "Adding…" : "Add to watchlist"}</button></form>}
    <div className="watchlist-summary"><article><span>Returned entries</span><strong>{accounts.length}</strong></article><article><span>Enabled</span><strong>{accounts.filter((account) => account.enabled).length}</strong></article><article><span>Disabled</span><strong>{accounts.filter((account) => !account.enabled).length}</strong></article></div>
    <div className="alert-filters"><label className="transaction-search">Account ID<input value={search} onChange={(event) => updateFilter("accountId", event.target.value)} placeholder="Search exact or partial account ID" /></label><label>Status<select value={status} onChange={(event) => updateFilter("enabled", event.target.value)}><option value="">All entries</option><option value="true">Enabled</option><option value="false">Disabled</option></select></label><button className="clear-button" onClick={() => setParams({}, { replace: true })}>Clear filters</button></div>
    {error && accounts.length === 0 && !showCreate ? <ErrorState message={error} onRetry={() => void load()} /> : <>{error && <div className="background-error">{error}</div>}{success && <div className="action-success">{success}</div>}{loading && accounts.length === 0 ? <LoadingState message="Loading watchlisted accounts…" /> : accounts.length === 0 ? <EmptyState title="No watchlisted accounts found" description={admin ? "Add an account or clear the current filters." : "No entries match the current filters."} /> : <WatchlistTable accounts={accounts} admin={admin} busyId={busyId} onToggle={toggle} />}</>}
  </section>;
}

function WatchlistTable({ accounts, admin, busyId, onToggle }: { accounts: WatchlistedAccount[]; admin: boolean; busyId: string; onToggle: (account: WatchlistedAccount) => void }) {
  return <div className="alert-table-card"><div className="table-caption"><span>{accounts.length} entries</span><span>{admin ? "Administrator controls" : "Read-only watchlist"}</span></div><div className="alert-table-scroll"><table className="alert-table watchlist-table"><thead><tr><th>Account ID</th><th>Reason</th><th>Added by</th><th>Status</th><th>Created</th><th>Updated</th></tr></thead><tbody>{accounts.map((account) => <tr key={account.id}><td data-label="Account ID"><code>{account.accountId}</code><small>{account.id}</small></td><td data-label="Reason"><span className="reason-text">{account.reason}</span></td><td data-label="Added by"><code>{account.addedBy}</code></td><td data-label="Status">{admin ? <button className={`status-toggle ${account.enabled ? "enabled" : ""}`} disabled={busyId === account.id} onClick={() => onToggle(account)}><i /><span>{busyId === account.id ? "Saving…" : account.enabled ? "Enabled" : "Disabled"}</span></button> : <span className={`account-status ${account.enabled ? "enabled" : ""}`}><i />{account.enabled ? "Enabled" : "Disabled"}</span>}</td><td data-label="Created"><time>{formatDate(account.createdAt)}</time></td><td data-label="Updated"><time>{formatDate(account.updatedAt)}</time></td></tr>)}</tbody></table></div></div>;
}

function messageOf(caught: unknown) { return caught instanceof ApiError ? caught.message : "Unable to load watchlisted accounts."; }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
