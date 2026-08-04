import { Link } from "react-router-dom";
export function UnauthorizedPage() { return <main className="status-page"><div className="status-code">403</div><h1>Access restricted</h1><p>Your account does not have permission to open this workspace.</p><Link className="primary-button link-button" to="/">Return to your workspace</Link></main>; }
