export function InlineSpinner({ label = "Loading" }: { label?: string }) { return <span className="inline-loading"><span className="spinner" aria-hidden="true" /><span>{label}</span></span>; }
