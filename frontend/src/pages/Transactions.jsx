import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, TextField, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, Button, Chip, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, TablePagination, Tooltip, Stack, Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchRoundedIcon       from "@mui/icons-material/SearchRounded";
import FilterListRoundedIcon   from "@mui/icons-material/FilterListRounded";
import CloseRoundedIcon        from "@mui/icons-material/CloseRounded";
import OpenInNewRoundedIcon    from "@mui/icons-material/OpenInNewRounded";
import ReceiptLongRoundedIcon  from "@mui/icons-material/ReceiptLongRounded";
import {
  MOCK_TRANSACTIONS, TRANSACTION_STATS,
  RISK_LEVEL_COLORS, STATUS_COLORS, getRiskLevel,
} from "../utils/transactionMockData";

// ── Status chip ──────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const color  = STATUS_COLORS[status] ?? "#7A90A8";
  return (
    <Chip label={status} size="small" sx={{
      bgcolor: `${color}18`, color, fontWeight: 700,
      fontSize: "0.68rem", height: 22,
      border: `1px solid ${color}40`,
      boxShadow: isDark ? `0 0 8px ${color}25` : "none",
    }} />
  );
}

// ── Risk level badge ──────────────────────────────────────────────────────────
function RiskBadge({ level }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const color  = RISK_LEVEL_COLORS[level] ?? "#7A90A8";
  return (
    <Chip label={level} size="small" sx={{
      bgcolor: `${color}15`, color, fontWeight: 700,
      fontSize: "0.68rem", height: 22,
      border: `1px solid ${color}35`,
      boxShadow: isDark ? `0 0 6px ${color}20` : "none",
    }} />
  );
}

// ── Risk score bar ────────────────────────────────────────────────────────────
function RiskBar({ score }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const color  = RISK_LEVEL_COLORS[getRiskLevel(score)];
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 90 }}>
      <Box sx={{
        flex: 1, height: 5, borderRadius: 3,
        bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
      }}>
        <Box sx={{
          width: `${score}%`, height: "100%", borderRadius: 3,
          bgcolor: color,
          boxShadow: isDark ? `0 0 6px ${color}80` : "none",
          transition: "width 0.6s ease",
        }} />
      </Box>
      <Typography variant="caption" fontWeight={700} sx={{ color, minWidth: 24, textAlign: "right" }}>
        {score}
      </Typography>
    </Box>
  );
}

// ── Hop chain ─────────────────────────────────────────────────────────────────
function HopChain({ hops }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Tooltip
      arrow
      placement="top"
      title={
        <Box>
          {hops.map((h, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.25 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: i === 0 ? "#00FF88" : i === hops.length - 1 ? "#00D4FF" : "#FFB800", flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: "#E8EDF5" }}>{h.name} ({h.country})</Typography>
            </Box>
          ))}
        </Box>
      }
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "default" }}>
        <Box sx={{
          px: 1, py: 0.25, borderRadius: 1,
          bgcolor: isDark ? "rgba(0,212,255,0.1)" : "rgba(21,101,192,0.08)",
          border: isDark ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(21,101,192,0.2)",
        }}>
          <Typography variant="caption" fontWeight={700}
            sx={{ color: isDark ? "#00D4FF" : "primary.main" }}>
            {hops.length} hops
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box sx={{
      px: 2.5, py: 1.5, borderRadius: 2,
      bgcolor: isDark ? `${color}10` : `${color}08`,
      border: `1px solid ${color}25`,
      transition: "all 0.2s",
      "&:hover": { bgcolor: isDark ? `${color}18` : `${color}12`, border: `1px solid ${color}45` },
    }}>
      <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.8px", fontSize: "0.65rem", fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 800, fontSize: "1.4rem", color, lineHeight: 1.1, mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
}

// ── Column definitions ────────────────────────────────────────────────────────
const COLUMNS = [
  { id: "tid",              label: "Transaction ID",  sortable: true  },
  { id: "senderAccountId", label: "Sender",          sortable: true  },
  { id: "receiverAccountId",label: "Receiver",       sortable: false },
  { id: "amount",           label: "Amount",         sortable: true  },
  { id: "location",         label: "Location",       sortable: true  },
  { id: "hops",             label: "Flow",           sortable: false },
  { id: "riskScore",        label: "Risk Score",     sortable: true  },
  { id: "riskLevel",        label: "Level",          sortable: true  },
  { id: "status",           label: "Status",         sortable: true  },
  { id: "createdAt",        label: "Time",           sortable: true  },
];

// ── Transactions Page ─────────────────────────────────────────────────────────
export default function Transactions() {
  const theme    = useTheme();
  const isDark   = theme.palette.mode === "dark";
  const navigate = useNavigate();

  // Filters
  const [search,      setSearch]      = useState("");
  const [filterRisk,  setFilterRisk]  = useState("All");
  const [filterStatus,setFilterStatus]= useState("All");

  // Sort
  const [sortField, setSortField]     = useState("createdAt");
  const [sortDir,   setSortDir]       = useState("desc");

  // Pagination
  const [page,         setPage]        = useState(0);
  const [rowsPerPage,  setRowsPerPage] = useState(10);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
    setPage(0);
  };

  const clearFilters = () => {
    setSearch(""); setFilterRisk("All"); setFilterStatus("All"); setPage(0);
  };

  const hasFilters = search || filterRisk !== "All" || filterStatus !== "All";

  // Filter + sort
  const filtered = useMemo(() => {
    let data = [...MOCK_TRANSACTIONS];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((t) =>
        t.tid.toLowerCase().includes(q) ||
        t.senderAccountId.toLowerCase().includes(q) ||
        t.receiverAccountId.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.senderCountry.toLowerCase().includes(q)
      );
    }
    if (filterRisk !== "All")   data = data.filter((t) => t.riskLevel === filterRisk);
    if (filterStatus !== "All") data = data.filter((t) => t.status    === filterStatus);

    data.sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (typeof av === "string") av = av.toLowerCase(), bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ?  1 : -1;
      return 0;
    });
    return data;
  }, [search, filterRisk, filterStatus, sortField, sortDir]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 42, height: 42, borderRadius: 2.5,
            background: isDark ? "rgba(0,212,255,0.12)" : "rgba(21,101,192,0.1)",
            border: isDark ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(21,101,192,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ReceiptLongRoundedIcon sx={{ color: "primary.main", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>Transactions</Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time monitoring of every transaction entering the pipeline
            </Typography>
          </Box>
        </Box>

        {/* Stat row */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <StatCard label="Total"    value={TRANSACTION_STATS.total}    color="#00D4FF" />
          <StatCard label="Approved" value={TRANSACTION_STATS.approved} color="#00FF88" />
          <StatCard label="Pending"  value={TRANSACTION_STATS.pending}  color="#FFB800" />
          <StatCard label="Denied"   value={TRANSACTION_STATS.denied}   color="#FF3366" />
        </Stack>
      </Box>

      {/* ── Filter bar ── */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
            <TextField
              placeholder="Search by ID, account, location..."
              size="small"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 17, color: "text.secondary" }} /></InputAdornment> }}
              sx={{ flex: 2, minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Risk Level</InputLabel>
              <Select value={filterRisk} label="Risk Level" onChange={(e) => { setFilterRisk(e.target.value); setPage(0); }}>
                <MenuItem value="All">All Levels</MenuItem>
                {["LOW","MEDIUM","HIGH","CRITICAL"].map((l) => (
                  <MenuItem key={l} value={l}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: RISK_LEVEL_COLORS[l] }} />
                      {l}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} label="Status" onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}>
                <MenuItem value="All">All Status</MenuItem>
                {["APPROVED","PENDING","DENIED"].map((s) => (
                  <MenuItem key={s} value={s}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: STATUS_COLORS[s] }} />
                      {s}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {hasFilters && (
              <Button size="small" startIcon={<CloseRoundedIcon sx={{ fontSize: 15 }} />}
                onClick={clearFilters}
                sx={{ color: "text.secondary", borderColor: "divider", border: "1px solid", borderRadius: 2, whiteSpace: "nowrap" }}
              >
                Clear
              </Button>
            )}
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.75 }}>
              <FilterListRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {filtered.length} of {MOCK_TRANSACTIONS.length} transactions
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ── Table ── */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {COLUMNS.map((col) => (
                  <TableCell key={col.id} sx={{ whiteSpace: "nowrap", py: 1.5 }}>
                    {col.sortable ? (
                      <TableSortLabel
                        active={sortField === col.id}
                        direction={sortField === col.id ? sortDir : "asc"}
                        onClick={() => handleSort(col.id)}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((tx) => (
                <TableRow key={tx.tid}
                  sx={{
                    cursor: "pointer",
                    transition: "background 0.18s, box-shadow 0.18s",
                    "&:hover": {
                      bgcolor: isDark ? "rgba(0,212,255,0.04)" : "rgba(21,101,192,0.03)",
                      "& .txn-id": { textShadow: isDark ? "0 0 12px #00D4FF" : "none" },
                    },
                    "&:last-child td": { border: 0 },
                  }}
                  onClick={() => navigate(`/transactions/${tx.tid}`)}
                >
                  {/* Transaction ID */}
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Typography className="txn-id" variant="caption" fontWeight={700}
                        sx={{ color: isDark ? "#00D4FF" : "primary.main", fontFamily: "monospace", fontSize: "0.8rem", transition: "text-shadow 0.2s" }}
                      >
                        {tx.tid}
                      </Typography>
                      <OpenInNewRoundedIcon sx={{ fontSize: 11, color: "text.secondary", opacity: 0.5 }} />
                    </Box>
                  </TableCell>

                  {/* Sender */}
                  <TableCell>
                    <Typography variant="caption" fontWeight={600} sx={{ display: "block", fontFamily: "monospace", color: "text.primary" }}>
                      {tx.senderAccountId}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                      {tx.senderCountry}
                    </Typography>
                  </TableCell>

                  {/* Receiver */}
                  <TableCell>
                    <Typography variant="caption" fontWeight={600} sx={{ display: "block", fontFamily: "monospace", color: "text.primary" }}>
                      {tx.receiverAccountId}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                      {tx.receiverCountry}
                    </Typography>
                  </TableCell>

                  {/* Amount */}
                  <TableCell>
                    <Typography variant="caption" fontWeight={800} sx={{ color: isDark ? "#E8EDF5" : "text.primary", whiteSpace: "nowrap" }}>
                      {tx.currency} {Number(tx.amount).toLocaleString()}
                    </Typography>
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                      {tx.location}
                    </Typography>
                  </TableCell>

                  {/* Flow */}
                  <TableCell><HopChain hops={tx.hops} /></TableCell>

                  {/* Risk Score */}
                  <TableCell sx={{ minWidth: 110 }}>
                    <RiskBar score={tx.riskScore} />
                  </TableCell>

                  {/* Risk Level */}
                  <TableCell><RiskBadge level={tx.riskLevel} /></TableCell>

                  {/* Status */}
                  <TableCell><StatusChip status={tx.status} /></TableCell>

                  {/* Time */}
                  <TableCell>
                    <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                      {tx.createdAt.slice(11, 16)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}

              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} sx={{ py: 6, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      No transactions match the current filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[10, 20, 50]}
          sx={{ "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "0.8rem" } }}
        />
      </Card>
    </Box>
  );
}
