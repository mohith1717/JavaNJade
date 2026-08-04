import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';

export default function SplashScreen() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #060B18 0%, #0C1633 50%, #080D20 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.4 }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #00D4FF, #0099DD)',
                boxShadow: '0 0 24px rgba(0,212,255,0.35)',
              }}
            >
              <ShieldRoundedIcon sx={{ color: '#fff', fontSize: 34 }} />
            </Box>
          </motion.div>
          <Typography sx={{ color: '#E8EDF5', fontWeight: 800, fontSize: '1.25rem' }}>
            JavaNJade
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(232,237,245,0.72)', letterSpacing: '1.1px' }}>
            Protecting Digital Assets Like Precious Jade
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
}
