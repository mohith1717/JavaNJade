import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Grid, Typography, Chip, Button,
  Stack, Divider, Collapse, Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowBackRoundedIcon           from "@mui/icons-material/ArrowBackRounded";
import ReceiptLongRoundedIcon         from "@mui/icons-material/ReceiptLongRounded";
import FactCheckRoundedIcon           from "@mui/icons-material/FactCheckRounded";
import TuneRoundedIcon                from "@mui/icons-material/TuneRounded";
import SpeedRoundedIcon               from "@mui/icons-material/SpeedRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import FolderOpenRoundedIcon          from "@mui/icons-material/FolderOpenRounded";
import CheckCircleRoundedIcon         from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon              from "@mui/icons-material/CancelRounded";
import WarningAmberRoundedIcon        from "@mui/icons-material/WarningAmberRounded";
import InfoRoundedIcon                from "@mui/icons-material/InfoRounded";
import ExpandMoreRoundedIcon          from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon          from "@mui/icons-material/ExpandLessRounded";
import PublicRoundedIcon              from "@mui/icons-material/PublicRounded";
import AccountBalanceRoundedIcon      from "@mui/icons-material/AccountBalanceRounded";
import HubRoundedIcon                 from "@mui/icons-material/HubRounded";
import { getTransactionById, RISK_LEVEL_COLORS, STATUS_COLORS, getRiskLevel } from "../utils/transactionMockData";

// ── Colour helpers ────────────────────────────────────────────────────────────
function stepColor(status) {
  if (!status) return "#7A90A8";
  const s = status.toUpperCase();
  if (["COMPLETED","PASSED","APPROVED","GENERATED","ASSIGNED"].includes(s)) return "#00FF88";
  if (["TRIGGERED","MEDIUM","WARN"].includes(s))                            return "#FFB800";
  if (["HIGH","OPEN"].includes(s))                                          return "#FF6B35";
  if (["CRITICAL","DENIED","FAILED"].includes(s))                           return "#FF3366";
  if (["SKIPPED","CLEAN"].includes(s))                                      return "#7A90A8";
  return "#00D4FF";
}

function StepIcon({ icon: Icon, color, isDark }) {
  return (
    <Box sx={{
      width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
      bgcolor: `${color}18`,
      border: `2px solid ${color}50`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: isDark ? `0 0 16px ${color}30` : "none",
      zIndex: 1,
    }}>
      <Icon sx={{ color, fontSize: 20 }} />
    </Box>
  );
}

// ── Validation check row ──────────────────────────────────────────────────────
function CheckRow({ name, result, note }) {
  const color = result === "PASS" ? "#00FF88" : result === "WARN" ? "#FFB800" : "#FF3366";
  const Icon  = result === "PASS" ? CheckCircleRoundedIcon : result === "WARN" ? WarningAmberRoundedIcon : CancelRoundedIcon;
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 0.75 }}>
      <Icon sx={{ color, fontSize: 16, mt: 0.1, flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" fontWeight={700} sx={{ color: "text.primary" }}>{name}</Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.72rem" }}>{note}</Typography>
      </Box>
      <Chip label={result} size="small" sx={{ bgcolor: `${color}12`, color, fontWeight: 700, height: 18, fontSize: "0.65rem", border: `1px solid ${color}30` }} />
    </Box>
  );
}

// ── Triggered rule row ────────────────────────────────────────────────────────
function RuleRow({ rule }) {
  const isDark = useTheme().palette.mode === "dark";
  const w = rule.riskWeight;
  const color = w >= 35 ? "#FF3366" : w >= 25 ? "#FF6B35" : "#FFB800";
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 0.75, borderBottom: "1px solid", borderColor: "divider", "&:last-child": { borderBottom: 0 } }}>
      <TuneRoundedIcon sx={{ color, fontSize: 15, mt: 0.15, flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" fontWeight={700} sx={{ color: "text.primary", fontFamily: "monospace" }}>{rule.ruleName}</Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.72rem" }}>{rule.reason}</Typography>
      </Box>
      <Tooltip title="Risk Weight" arrow>
        <Box sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: `${color}15`, border: `1px solid ${color}30` }}>
          <Typography variant="caption" fontWeight={800} sx={{ color }}>+{rule.riskWeight}</Typography>
        </Box>
      </Tooltip>
    </Box>
  );
}

// ── Risk gauge (SVG circle) ───────────────────────────────────────────────────
function RiskGauge({ score }) {
  const color = RISK_LEVEL_COLORS[getRiskLevel(score)];
  const r = 40, cx = 52, cy = 52;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ position: "relative", width: 104, height: 104 }}>
        <svg width="104" height="104" viewBox="0 0 104 104">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ filter: `drop-shadow(0 0 8px ${color}60)`, transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ fontWeight: 900, fontSize: "1.5rem", color, lineHeight: 1 }}>{score}</Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.62rem" }}>/ 100</Typography>
        </Box>
      </Box>
      <Chip label={getRiskLevel(score)} size="small" sx={{ mt: 0.75, bgcolor: `${color}15`, color, fontWeight: 700, border: `1px solid ${color}30` }} />
    </Box>
  );
}

// ── Transaction hop flow diagram ──────────────────────────────────────────────
function HopFlow({ hops }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const hopIcon = (type) => {
    if (type === "originating" || type === "receiving") return AccountBalanceRoundedIcon;
    if (type === "correspondent")                        return HubRoundedIcon;
    return PublicRoundedIcon;
  };
  const hopColor = (type, i, total) => {
    if (type === "originating") return "#00FF88";
    if (type === "receiving")   return "#00D4FF";
    return "#FFB800";
  };
  return (
    <Box sx={{
      display: "flex", alignItems: "center", flexWrap: "wrap",
      gap: 0, py: 1,
    }}>
      {hops.map((hop, i) => {
        const Icon  = hopIcon(hop.type);
        const color = hopColor(hop.type, i, hops.length);
        return (
          <Box key={i} sx={{ display: "flex", alignItems: "center" }}>
            {/* Hop card */}
            <Box sx={{
              display: "flex", flexDirection: "column", alignItems: "center",
              px: 1.5, py: 1, borderRadius: 2, minWidth: 90,
              bgcolor: isDark ? `${color}08` : `${color}06`,
              border: `1px solid ${color}25`,
              transition: "all 0.2s",
              "&:hover": { bgcolor: isDark ? `${color}18` : `${color}10`, border: `1px solid ${color}50`, transform: "translateY(-2px)" },
            }}>
              <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: `${color}15`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", mb: 0.5, boxShadow: isDark ? `0 0 8px ${color}25` : "none" }}>
                <Icon sx={{ color, fontSize: 16 }} />
              </Box>
              <Typography variant="caption" fontWeight={700} sx={{ color: "text.primary", textAlign: "center", fontSize: "0.68rem", lineHeight: 1.2 }}>
                {hop.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.62rem", textAlign: "center" }}>
                {hop.city}, {hop.country}
              </Typography>
              <Chip label={hop.type} size="small" sx={{ mt: 0.5, height: 16, fontSize: "0.58rem", fontWeight: 600, bgcolor: `${color}12`, color, border: `1px solid ${color}25` }} />
            </Box>
            {/* Arrow */}
            {i < hops.length - 1 && (
              <Box sx={{ px: 0.75, color: "text.secondary", fontSize: "1rem", display: "flex", alignItems: "center" }}>
                <svg width="24" height="12" viewBox="0 0 24 12">
                  <defs>
                    <marker id={`arrow-${i}`} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
                      <path d="M0,0 L4,2 L0,4 Z" fill={isDark ? "rgba(0,212,255,0.4)" : "rgba(21,101,192,0.4)"} />
                    </marker>
                  </defs>
                  <line x1="2" y1="6" x2="20" y2="6" stroke={isDark ? "rgba(0,212,255,0.35)" : "rgba(21,101,192,0.35)"}
                    strokeWidth="1.5" strokeDasharray="4 2" markerEnd={`url(#arrow-${i})`} />
                </svg>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ── Timeline step ─────────────────────────────────────────────────────────────
function TimelineStep({ icon: Icon, title, timestamp, status, isLast, children }) {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === "dark";
  const [open, setOpen] = useState(false);
  const color = stepColor(status);

  const StatusIcon = ["COMPLETED","PASSED","APPROVED","GENERATED"].includes(status?.toUpperCase())
    ? CheckCircleRoundedIcon
    : ["TRIGGERED","HIGH","OPEN","ASSIGNED","WARN","MEDIUM"].includes(status?.toUpperCase())
    ? WarningAmberRoundedIcon
    : ["CRITICAL","DENIED","FAILED"].includes(status?.toUpperCase())
    ? CancelRoundedIcon
    : InfoRoundedIcon;

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      {/* Left: icon + connector line */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: 40, flexShrink: 0 }}>
        <StepIcon icon={Icon} color={color} isDark={isDark} />
        {!isLast && (
          <Box sx={{
            width: 2, flex: 1, minHeight: 24, my: 0.5,
            bgcolor: `${color}30`,
            background: isDark
              ? `linear-gradient(180deg, ${color}50 0%, ${color}10 100%)`
              : `linear-gradient(180deg, ${color}35 0%, ${color}08 100%)`,
          }} />
        )}
      </Box>

      {/* Right: content card */}
      <Box sx={{ flex: 1, pb: isLast ? 0 : 2.5 }}>
        <Box
          onClick={() => children && setOpen((o) => !o)}
          sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            p: 2, borderRadius: 2,
            bgcolor: isDark ? `${color}06` : `${color}04`,
            border: `1px solid ${color}25`,
            cursor: children ? "pointer" : "default",
            transition: "all 0.2s",
            "&:hover": children ? { bgcolor: isDark ? `${color}12` : `${color}08`, border: `1px solid ${color}45` } : {},
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.primary">{title}</Typography>
                <Chip
                  icon={<StatusIcon sx={{ fontSize: "12px !important", color: `${color} !important` }} />}
                  label={status}
                  size="small"
                  sx={{ bgcolor: `${color}15`, color, fontWeight: 700, fontSize: "0.67rem", height: 20, border: `1px solid ${color}30`, boxShadow: isDark ? `0 0 6px ${color}20` : "none" }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>{timestamp}</Typography>
            </Box>
          </Box>
          {children && (
            open
              ? <ExpandLessRoundedIcon sx={{ color: "text.secondary", fontSize: 18 }} />
              : <ExpandMoreRoundedIcon sx={{ color: "text.secondary", fontSize: 18 }} />
          )}
        </Box>

        {children && (
          <Collapse in={open}>
            <Box sx={{ mt: 1, p: 2, borderRadius: 2, bgcolor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)", border: "1px solid", borderColor: "divider" }}>
              {children}
            </Box>
          </Collapse>
        )}
      </Box>
    </Box>
  );
}

// ── Info field row ────────────────────────────────────────────────────────────
function InfoRow({ label, value, mono, color }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
      <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.7px", fontSize: "0.62rem", fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}
        sx={{ color: color ?? "text.primary", fontFamily: mono ? "monospace" : "inherit" }}
      >
        {value ?? <span style={{ color: "#7A90A8", fontStyle: "italic" }}>N/A</span>}
      </Typography>
    </Box>
  );
}

// ── TransactionDetails ────────────────────────────────────────────────────────
export default function TransactionDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const theme    = useTheme();
  const isDark   = theme.palette.mode === "dark";

  const tx = getTransactionById(id);

  if (!tx) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">Transaction not found: {id}</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/transactions")}>Back to Transactions</Button>
      </Box>
    );
  }

  const { lifecycle } = tx;
  const statusColor   = STATUS_COLORS[tx.status] ?? "#7A90A8";
  const riskColor     = RISK_LEVEL_COLORS[tx.riskLevel];

  return (
    <Box>
      {/* ── Back + header ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate("/transactions")}
          sx={{ color: "text.secondary", border: "1px solid", borderColor: "divider", borderRadius: 2, fontWeight: 600 }}
        >
          Transactions
        </Button>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <Typography variant="h5" fontWeight={800} sx={{ fontFamily: "monospace" }}>{tx.tid}</Typography>
            <Chip label={tx.status} size="small" sx={{ bgcolor: `${statusColor}18`, color: statusColor, fontWeight: 700, border: `1px solid ${statusColor}40`, boxShadow: isDark ? `0 0 10px ${statusColor}25` : "none" }} />
            <Chip label={tx.riskLevel} size="small" sx={{ bgcolor: `${riskColor}18`, color: riskColor, fontWeight: 700, border: `1px solid ${riskColor}40`, boxShadow: isDark ? `0 0 10px ${riskColor}25` : "none" }} />
          </Box>
          <Typography variant="caption" color="text.secondary">{tx.createdAt} · {tx.location}</Typography>
        </Box>
      </Box>

      <Grid container spacing={2.5}>

        {/* ── Left column ── */}
        <Grid item xs={12} lg={8}>

          {/* Transaction info card */}
          <Card sx={{ mb: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: isDark ? "#00D4FF" : "primary.main", textTransform: "uppercase", letterSpacing: "0.8px", fontSize: "0.72rem" }}>
                Transaction Details
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={6} sm={4}><InfoRow label="Transaction ID"   value={tx.tid}                mono /></Grid>
                <Grid item xs={6} sm={4}><InfoRow label="Amount"           value={`${tx.currency} ${Number(tx.amount).toLocaleString()}`} color={isDark ? "#E8EDF5" : "text.primary"} /></Grid>
                <Grid item xs={6} sm={4}><InfoRow label="Currency"         value={tx.currency}           /></Grid>
                <Grid item xs={6} sm={4}><InfoRow label="Sender Account"   value={tx.senderAccountId}   mono /></Grid>
                <Grid item xs={6} sm={4}><InfoRow label="Sender Country"   value={tx.senderCountry}     /></Grid>
                <Grid item xs={6} sm={4}><InfoRow label="Receiver Account" value={tx.receiverAccountId} mono /></Grid>
                <Grid item xs={6} sm={4}><InfoRow label="Receiver Country" value={tx.receiverCountry}   /></Grid>
                <Grid item xs={6} sm={4}><InfoRow label="Location"         value={tx.location}          /></Grid>
                <Grid item xs={6} sm={4}><InfoRow label="Device ID"        value={tx.deviceId}          mono /></Grid>
                <Grid item xs={6} sm={4}><InfoRow label="Credit Score"     value={tx.creditScore}       /></Grid>
                <Grid item xs={12}><InfoRow label="Primary Risk Reason" value={tx.primaryReason} color={riskColor} /></Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Transaction flow (hop diagram) */}
          <Card sx={{ mb: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: isDark ? "#00D4FF" : "primary.main", textTransform: "uppercase", letterSpacing: "0.8px", fontSize: "0.72rem" }}>
                Transaction Flow ({tx.hops.length} Hops)
              </Typography>
              <Box sx={{ overflowX: "auto", pb: 1 }}>
                <HopFlow hops={tx.hops} />
              </Box>
            </CardContent>
          </Card>

          {/* Lifecycle timeline */}
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2.5, color: isDark ? "#00D4FF" : "primary.main", textTransform: "uppercase", letterSpacing: "0.8px", fontSize: "0.72rem" }}>
                Processing Timeline
              </Typography>

              {/* Step 1: Submitted */}
              <TimelineStep icon={ReceiptLongRoundedIcon} title="Transaction Submitted"
                timestamp={lifecycle.submitted.timestamp} status={lifecycle.submitted.status}
              >
                <Typography variant="caption" color="text.secondary">{lifecycle.submitted.detail}</Typography>
              </TimelineStep>

              {/* Step 2: Validation */}
              <TimelineStep icon={FactCheckRoundedIcon} title="Validation Engine"
                timestamp={lifecycle.validation.timestamp} status={lifecycle.validation.status}
              >
                <Stack spacing={0.25}>
                  {lifecycle.validation.checks.map((c, i) => (
                    <CheckRow key={i} {...c} />
                  ))}
                </Stack>
              </TimelineStep>

              {/* Step 3: Rule Engine */}
              <TimelineStep icon={TuneRoundedIcon} title="Rule Engine"
                timestamp={lifecycle.ruleEngine.timestamp} status={lifecycle.ruleEngine.status}
              >
                {lifecycle.ruleEngine.triggeredRules.length > 0 ? (
                  <Stack spacing={0}>
                    {lifecycle.ruleEngine.triggeredRules.map((r, i) => <RuleRow key={i} rule={r} />)}
                  </Stack>
                ) : (
                  <Typography variant="caption" color="text.secondary">No rules triggered — transaction is within normal parameters.</Typography>
                )}
              </TimelineStep>

              {/* Step 4: Risk Scoring */}
              <TimelineStep icon={SpeedRoundedIcon} title="Risk Assessment"
                timestamp={lifecycle.riskScoring.timestamp} status={lifecycle.riskScoring.status}
              >
                <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <RiskGauge score={lifecycle.riskScoring.score} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: "text.primary", display: "block", mb: 0.5 }}>Explanation</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>{lifecycle.riskScoring.explanation}</Typography>
                    {lifecycle.riskScoring.factors?.length > 0 && (
                      <>
                        <Typography variant="caption" fontWeight={700} sx={{ color: "text.primary", display: "block", mt: 1.5, mb: 0.5 }}>Risk Factors</Typography>
                        <Stack spacing={0.5}>
                          {lifecycle.riskScoring.factors.map((f, i) => (
                            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: riskColor, flexShrink: 0 }} />
                              <Typography variant="caption" color="text.secondary">{f}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      </>
                    )}
                  </Box>
                </Box>
              </TimelineStep>

              {/* Step 5: Alert Generation */}
              <TimelineStep icon={NotificationsActiveRoundedIcon} title="Alert Generation"
                timestamp={lifecycle.alertGeneration.timestamp} status={lifecycle.alertGeneration.status}
              >
                {lifecycle.alertGeneration.alertId ? (
                  <Box>
                    <InfoRow label="Alert ID" value={lifecycle.alertGeneration.alertId} mono color={isDark ? "#FFB800" : "#F57C00"} />
                    <Box sx={{ mt: 1 }}><InfoRow label="Severity" value={lifecycle.alertGeneration.severity} color={stepColor(lifecycle.alertGeneration.severity)} /></Box>
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary">No alert generated — risk score below alert threshold.</Typography>
                )}
              </TimelineStep>

              {/* Step 6: Case Management */}
              <TimelineStep icon={FolderOpenRoundedIcon} title="Case Management"
                timestamp={lifecycle.caseManagement.timestamp} status={lifecycle.caseManagement.status}
                isLast
              >
                {lifecycle.caseManagement.caseId ? (
                  <Grid container spacing={2}>
                    <Grid item xs={6}><InfoRow label="Case ID" value={lifecycle.caseManagement.caseId} mono color={isDark ? "#00D4FF" : "primary.main"} /></Grid>
                    <Grid item xs={6}><InfoRow label="Status"  value={lifecycle.caseManagement.status} color={stepColor(lifecycle.caseManagement.status)} /></Grid>
                    <Grid item xs={6}><InfoRow label="Priority" value={tx.casePriority} color={riskColor} /></Grid>
                    <Grid item xs={6}><InfoRow label="Assigned To" value={lifecycle.caseManagement.assignedTo} /></Grid>
                  </Grid>
                ) : (
                  <Typography variant="caption" color="text.secondary">No case created — transaction is within acceptable risk parameters.</Typography>
                )}
              </TimelineStep>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Right column: risk summary ── */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={2.5}>

            {/* Risk summary card */}
            <Card>
              <CardContent sx={{ p: 2.5, textAlign: "center" }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: isDark ? "#00D4FF" : "primary.main", textTransform: "uppercase", letterSpacing: "0.8px", fontSize: "0.72rem" }}>
                  Risk Summary
                </Typography>
                <RiskGauge score={tx.riskScore} />
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1.5} sx={{ textAlign: "left" }}>
                  <InfoRow label="Decision" value={tx.status} color={statusColor} />
                  <InfoRow label="Risk Level" value={tx.riskLevel} color={riskColor} />
                  <InfoRow label="Risk Score" value={`${tx.riskScore} / 100`} color={riskColor} />
                  <InfoRow label="Credit Score" value={tx.creditScore ?? "N/A"} />
                  <InfoRow label="Case Priority" value={tx.casePriority ?? "None"} color={tx.casePriority ? stepColor(tx.casePriority) : undefined} />
                </Stack>
              </CardContent>
            </Card>

            {/* Triggered rules summary */}
            {tx.triggeredRules?.length > 0 && (
              <Card>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: isDark ? "#FFB800" : "#E65100", textTransform: "uppercase", letterSpacing: "0.8px", fontSize: "0.72rem" }}>
                    Triggered Rules ({tx.triggeredRules.length})
                  </Typography>
                  <Stack spacing={0}>
                    {tx.triggeredRules.map((r, i) => <RuleRow key={i} rule={r} />)}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Risk factors */}
            {tx.riskFactors?.length > 0 && (
              <Card>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: isDark ? "#FF3366" : "#C62828", textTransform: "uppercase", letterSpacing: "0.8px", fontSize: "0.72rem" }}>
                    Risk Factors
                  </Typography>
                  <Stack spacing={0.75}>
                    {tx.riskFactors.map((f, i) => (
                      <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: riskColor, flexShrink: 0, mt: 0.6 }} />
                        <Typography variant="caption" color="text.secondary">{f}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
