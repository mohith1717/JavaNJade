function StatCard({ title, value, change, trend, note }) {
  return (
    <article className="card stat-card">
      <p className="stat-title">{title}</p>
      <h3 className="stat-value">{value}</h3>
      <p className={`stat-change ${trend === "down" ? "down" : "up"}`}>
        {change} <span>{note}</span>
      </p>
    </article>
  );
}

export default StatCard;
