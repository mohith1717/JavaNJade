import { describe, expect, it } from "vitest";

import { navigationFor } from "../components/layout/navigation";
import { moduleFor } from "../components/layout/routeMetadata";
import { landingFor } from "./rolePaths";

describe("role-based frontend access", () => {
  it.each([
    ["FRAUD_ANALYST", "/alerts"],
    ["RISK_ANALYST", "/dashboard"],
    ["ADMIN", "/admin/rules"],
  ] as const)("lands %s in its assigned workspace", (role, path) => {
    expect(landingFor(role)).toBe(path);
  });

  it("hides administrative navigation from Fraud Analysts", () => {
    const paths = navigationFor("FRAUD_ANALYST").map((item) => item.path);
    expect(paths).toContain("/watchlisted-accounts");
    expect(paths).not.toContain("/admin/users");
    expect(paths).not.toContain("/admin/audit");
    expect(paths).not.toContain("/admin/rules");
  });

  it("gives Risk Analysts read-only policy navigation", () => {
    const paths = navigationFor("RISK_ANALYST").map((item) => item.path);
    expect(paths).toContain("/admin/rules");
    expect(paths).toContain("/watchlisted-accounts");
    expect(paths).not.toContain("/admin/users");
    expect(paths).not.toContain("/admin/audit");
  });

  it("shows every administrative workspace to Admins", () => {
    const paths = navigationFor("ADMIN").map((item) => item.path);
    expect(paths).toEqual(expect.arrayContaining([
      "/admin/rules", "/admin/audit", "/admin/users", "/watchlisted-accounts",
    ]));
  });

  it.each([
    ["/dashboard", "dashboard"],
    ["/alerts/alert-id", "alerts"],
    ["/transactions/transaction-id", "transactions"],
    ["/admin/rules/rule-id", "rules"],
    ["/admin/audit/event-id", "audit"],
    ["/reports", "reports"],
    ["/admin/users/user-id", "users"],
    ["/watchlisted-accounts", "watchlist"],
  ] as const)("assigns %s to the %s visual module", (path, module) => {
    expect(moduleFor(path)).toBe(module);
  });
});
