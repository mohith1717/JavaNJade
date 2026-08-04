import { InlineSpinner } from "./InlineSpinner";
export function LoadingState({ message = "Loading secure data…" }: { message?: string }) { return <div className="feedback-state" role="status"><InlineSpinner label={message} /></div>; }
