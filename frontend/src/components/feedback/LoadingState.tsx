import { InlineSpinner } from "./InlineSpinner";
export function LoadingState({ message = "Loading secure data…" }: { message?: string }) { return <div className="feedback-state loading-state" role="status"><span className="feedback-orbit" aria-hidden="true"><i /><i /></span><InlineSpinner label={message} /></div>; }
