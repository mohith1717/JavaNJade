import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  InputAdornment, IconButton, Link, Divider, CircularProgress,
  Dialog, DialogContent, DialogTitle, Alert, Snackbar, Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import VisibilityRoundedIcon       from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon    from '@mui/icons-material/VisibilityOffRounded';
import ShieldRoundedIcon           from '@mui/icons-material/ShieldRounded';
import LockRoundedIcon             from '@mui/icons-material/LockRounded';
import MailOutlineRoundedIcon      from '@mui/icons-material/MailOutlineRounded';
import ArrowForwardRoundedIcon     from '@mui/icons-material/ArrowForwardRounded';
import { useAuth }                 from '../../context/AuthContext';
import { login, sendOtp, verifyOtp } from '../../services/authService';

// ─── OTP Input (6 individual boxes) ──────────────────────────────────────────
function OtpInput({ value, onChange, error }) {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const handleKey = (idx, e) => {
    const digits = value.split('');
    if (e.key === 'Backspace') {
      digits[idx] = '';
      onChange(digits.join(''));
      if (idx > 0) refs[idx - 1].current?.focus();
    }
  };

  const handleChange = (idx, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const digits = value.split('');
    digits[idx] = char;
    onChange(digits.join(''));
    if (char && idx < 5) refs[idx + 1].current?.focus();
  };

  return (
    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', my: 2 }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Box
          key={i}
          component="input"
          inputMode="numeric"
          maxLength={1}
          ref={refs[i]}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          sx={{
            width: 46, height: 52,
            textAlign: 'center',
            fontSize: '1.4rem',
            fontWeight: 700,
            fontFamily: 'Inter, monospace',
            background: 'rgba(0,212,255,0.05)',
            border: `1.5px solid ${error ? '#FF3366' : 'rgba(0,212,255,0.25)'}`,
            borderRadius: '10px',
            color: '#E8EDF5',
            outline: 'none',
            transition: 'all 0.2s',
            '&:focus': {
              borderColor: '#00D4FF',
              boxShadow: '0 0 12px rgba(0,212,255,0.35)',
              background: 'rgba(0,212,255,0.08)',
            },
          }}
        />
      ))}
    </Box>
  );
}

// ─── Forgot Password Dialog ───────────────────────────────────────────────────
function ForgotPasswordDialog({ open, onClose }) {
  const [step, setStep]       = useState('email');   // 'email' | 'otp'
  const [email, setEmail]     = useState('');
  const [otp, setOtp]         = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleClose = () => {
    setStep('email'); setEmail(''); setOtp('');
    setError(''); setSuccess('');
    onClose();
  };

  const handleSendOtp = async () => {
    if (!email) { setError('Please enter your email address.'); return; }
    setError(''); setLoading(true);
    try {
      await sendOtp(email);
      setStep('otp');
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) { setError('Please enter all 6 digits.'); return; }
    setError(''); setLoading(true);
    try {
      await verifyOtp(email, otp);
      setSuccess('Verified! Password reset link sent to your email.');
      setTimeout(handleClose, 2500);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #0C1633 0%, #080D20 100%)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 3,
          boxShadow: '0 0 40px rgba(0,212,255,0.15)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'rgba(0,212,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LockRoundedIcon sx={{ color: '#00D4FF', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#E8EDF5">
              {step === 'email' ? 'Reset Password' : 'Verify OTP'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {step === 'email' ? 'Enter your registered email' : `Code sent to ${email}`}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error  && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

        {step === 'email' ? (
          <>
            <TextField
              fullWidth label="Email Address" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
              InputProps={{ startAdornment: <InputAdornment position="start"><MailOutlineRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment> }}
              sx={{ mb: 2 }}
              autoFocus
            />
            <Button fullWidth variant="contained" onClick={handleSendOtp} disabled={loading}
              sx={{ height: 46, fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: '#000' }} /> : 'Send OTP'}
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 1 }}>
              Enter the 6-digit code  •  <Typography component="span" sx={{ color: '#00D4FF', fontSize: 'inherit', cursor: 'pointer' }} onClick={() => { setStep('email'); setOtp(''); }}>Change email</Typography>
            </Typography>
            <OtpInput value={otp} onChange={setOtp} error={!!error} />
            <Button fullWidth variant="contained" onClick={handleVerifyOtp} disabled={loading || otp.length < 6}
              sx={{ height: 46, fontWeight: 700, mt: 1 }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: '#000' }} /> : 'Verify & Continue'}
            </Button>
            <Typography variant="caption" color="text.secondary" textAlign="center" display="block" sx={{ mt: 1.5 }}>
              Demo OTP: <strong style={{ color: '#00D4FF' }}>123456</strong>
            </Typography>
          </>
        )}

        <Typography variant="caption" color="text.secondary" textAlign="center" display="block" sx={{ mt: 2, cursor: 'pointer', '&:hover': { color: 'text.primary' } }} onClick={handleClose}>
          Cancel
        </Typography>
      </DialogContent>
    </Dialog>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export default function Login() {
  const theme    = useTheme();
  const navigate = useNavigate();
  const { login: setUser } = useAuth();

  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPass, setShowPass]         = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [forgotOpen, setForgotOpen]     = useState(false);
  const [toastOpen, setToastOpen]       = useState(false);

  const handleLogin = async () => {
    if (!username || !password) { setError('Please enter your username and password.'); return; }
    setError(''); setLoading(true);
    try {
      const { user, token } = await login(username, password);
      localStorage.setItem('authToken', token);
      setUser(user);
      navigate('/', { replace: true });
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      // Animated gradient background
      background: 'linear-gradient(-45deg, #060B18, #0C1633, #080D20, #0A1228)',
      backgroundSize: '400% 400%',
      animation: 'bgShift 16s ease infinite',
      '@keyframes bgShift': {
        '0%':   { backgroundPosition: '0% 50%' },
        '50%':  { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' },
      },
      // Dot grid overlay
      '&::before': {
        content: '""', position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(circle, rgba(0,212,255,0.07) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      },
    }}>

      {/* Ambient glow blobs */}
      <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(0,212,255,0.04)', filter: 'blur(80px)', top: '-10%', right: '-5%', zIndex: 0 }} />
      <Box sx={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(123,47,255,0.06)', filter: 'blur(80px)', bottom: '5%', left: '-5%', zIndex: 0 }} />

      {/* Login card */}
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, px: 2 }}>
        {/* Brand header above card */}
        <Stack alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
          <Box sx={{
            width: 52, height: 52, borderRadius: 3,
            background: 'linear-gradient(135deg, #00D4FF, #0077AA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(0,212,255,0.4)',
          }}>
            <ShieldRoundedIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Box textAlign="center">
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#E8EDF5', letterSpacing: '-0.3px' }}>
              JavaNJade
            </Typography>
            <Typography variant="caption" sx={{ color: '#7A90A8', letterSpacing: '1.2px', textTransform: 'uppercase', fontSize: '0.65rem' }}>
              Transaction Monitoring System
            </Typography>
          </Box>
        </Stack>

        {/* Glass card */}
        <Card sx={{
          background: 'rgba(12,22,51,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,212,255,0.15)',
          borderRadius: 3,
          boxShadow: '0 0 40px rgba(0,0,0,0.5), 0 0 80px rgba(0,212,255,0.05)',
          '&:hover': { transform: 'none' },  // override global hover on login card
        }}>
          <CardContent sx={{ p: 3.5 }}>
            <Typography variant="h6" fontWeight={700} color="#E8EDF5" sx={{ mb: 0.5 }}>
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Sign in to your admin account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '0.8rem' }}>
                {error}
              </Alert>
            )}

            <Stack spacing={2}>
              <TextField
                fullWidth label="Username" value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                autoFocus autoComplete="username"
              />
              <TextField
                fullWidth label="Password" type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass((p) => !p)} edge="end" size="small">
                        {showPass
                          ? <VisibilityOffRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          : <VisibilityRoundedIcon   sx={{ fontSize: 18, color: 'text.secondary' }} />
                        }
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2.5 }}>
              <Link component="button" variant="caption" onClick={() => setForgotOpen(true)}
                sx={{ color: '#00D4FF', textDecoration: 'none', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              fullWidth variant="contained" size="large"
              onClick={handleLogin} disabled={loading}
              endIcon={!loading && <ArrowForwardRoundedIcon />}
              sx={{ height: 50, fontSize: '0.95rem', fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#000' }} /> : 'Sign In'}
            </Button>

            <Divider sx={{ my: 2.5, borderColor: 'rgba(0,212,255,0.1)' }}>
              <Typography variant="caption" color="text.secondary">Demo Credentials</Typography>
            </Divider>

            <Box sx={{ bgcolor: 'rgba(0,212,255,0.05)', borderRadius: 2, p: 1.5, border: '1px solid rgba(0,212,255,0.1)' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Admin: <strong style={{ color: '#00D4FF' }}>admin</strong> / <strong style={{ color: '#00D4FF' }}>admin123</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Analyst: <strong style={{ color: '#7B2FFF' }}>analyst</strong> / <strong style={{ color: '#7B2FFF' }}>analyst123</strong>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="caption" color="text.secondary" textAlign="center" display="block" sx={{ mt: 2.5 }}>
          Protected by enterprise-grade security  •  JavaNJade © 2026
        </Typography>
      </Box>

      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />

      <Snackbar open={toastOpen} autoHideDuration={3000} onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ borderRadius: 2 }}>Password reset link sent!</Alert>
      </Snackbar>
    </Box>
  );
}
