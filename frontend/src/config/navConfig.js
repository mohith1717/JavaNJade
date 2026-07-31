// Navigation item definitions — sidebar is purely data-driven.
// Per product spec: Rule Engine, Reports, Alerts, Transactions (admin sidebar).

import ReceiptLongRoundedIcon         from '@mui/icons-material/ReceiptLongRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import TuneRoundedIcon                from '@mui/icons-material/TuneRounded';
import AssessmentRoundedIcon          from '@mui/icons-material/AssessmentRounded';

export const NAV_ITEMS = [
  {
    label:  'Transactions',
    path:   '/transactions',
    icon:   ReceiptLongRoundedIcon,
    badge:  null,
  },
  {
    label:  'Alerts',
    path:   '/alerts',
    icon:   NotificationsActiveRoundedIcon,
    badge:  8,        // live unread count — replace with real API value
  },
  {
    label:  'Rule Engine',
    path:   '/rules',
    icon:   TuneRoundedIcon,
    badge:  null,
  },
  {
    label:  'Reports',
    path:   '/reports',
    icon:   AssessmentRoundedIcon,
    badge:  null,
  },
];

export const SIDEBAR_WIDTH  = 280;
export const NAVBAR_HEIGHT  = 64;
