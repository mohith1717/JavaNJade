const paths: Record<string, string> = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  transfer: "M5 7h13m0 0-3-3m3 3-3 3M19 17H6m0 0 3 3m-3-3 3-3",
  alert: "M12 3 2.8 19h18.4L12 3Zm0 6v4m0 3h.01",
  chart: "M4 20V10m6 10V4m6 16v-7m4 7H2",
  shield: "M12 3 5 6v5c0 4.5 2.8 7.8 7 10 4.2-2.2 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-5",
  rules: "M4 6h10m4 0h2M4 12h3m4 0h9M4 18h8m4 0h4M14 4v4M7 10v4m5 2v4",
  audit: "M5 3h11l3 3v15H5zM8 11h8M8 15h8M8 7h4",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
};

export function NavigationIcon({ name }: { name: string }) {
  return <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} /></svg>;
}
