import { Link } from "react-router-dom";
export function NotFoundPage() { return <main className="status-page"><div className="status-code">404</div><h1>Page not found</h1><p>The requested JadeGuard page does not exist.</p><Link className="primary-button link-button" to="/">Go to JadeGuard</Link></main>; }
