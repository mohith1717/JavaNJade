function RecentTransactionsTable({ rows }) {
  return (
    <section className="card table-card">
      <div className="section-head">
        <h3>Recent Transactions</h3>
        <p>Latest activity entering the monitoring pipeline</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Account</th>
              <th>Merchant</th>
              <th>Amount</th>
              <th>Risk Score</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.account}</td>
                <td>{row.merchant}</td>
                <td>{row.amount}</td>
                <td>{row.risk}</td>
                <td><span className={`status-chip ${row.status.toLowerCase()}`}>{row.status}</span></td>
                <td>{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default RecentTransactionsTable;
