import type { ReactNode } from "react";
export function Badge({ tone, children }: { tone: string; children: ReactNode }) { return <span className={`semantic-badge tone-${tone.toLowerCase()}`}><i />{children}</span>; }
