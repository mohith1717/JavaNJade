// Navigation item definitions — sidebar is purely data-driven.
// Per product spec: Rule Engine, Reports, Alerts, Transactions (admin sidebar).

import ReceiptLongRoundedIcon         from '@mui/icons-material/ReceiptLongRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import FolderOpenRoundedIcon          from '@mui/icons-material/FolderOpenRounded';
import TuneRoundedIcon                from '@mui/icons-material/TuneRounded';
import AssessmentRoundedIcon          from '@mui/icons-material/AssessmentRounded';
import InsightsRoundedIcon            from '@mui/icons-material/InsightsRounded';
import SettingsRoundedIcon            from '@mui/icons-material/SettingsRounded';
import { ROLES }                      from './roles';

export const NAV_ITEMS = [
  {
    label:  'Transactions',
    path:   '/transactions',
    icon:   ReceiptLongRoundedIcon,
    badge:  null,
    roles:  [ROLES.ADMIN, ROLES.FRAUD_ANALYST, ROLES.RISK_ANALYST],
  },
  {
    label:  'Alerts',
    path:   '/alerts',
    icon:   NotificationsActiveRoundedIcon,
    badge:  null,
    roles:  [ROLES.ADMIN, ROLES.FRAUD_ANALYST],
  },
  {
    label:  'Case Management',
    path:   '/cases',
    icon:   FolderOpenRoundedIcon,
    badge:  null,
    roles:  [ROLES.ADMIN, ROLES.FRAUD_ANALYST],
  },
  {
    label:  'Rule Engine',
    path:   '/rules',
    icon:   TuneRoundedIcon,
    badge:  null,
    roles:  [ROLES.ADMIN, ROLES.FRAUD_ANALYST],
  },
  {
    label:  'Reports',
    path:   '/reports',
    icon:   AssessmentRoundedIcon,
    badge:  null,
    roles:  [ROLES.ADMIN, ROLES.FRAUD_ANALYST, ROLES.RISK_ANALYST],
  },
  {
    label:  'Risk Analytics',
    path:   '/analytics',
    icon:   InsightsRoundedIcon,
    badge:  null,
    roles:  [ROLES.ADMIN, ROLES.RISK_ANALYST],
  },
  {
    label:  'Settings',
    path:   '/settings',
    icon:   SettingsRoundedIcon,
    badge:  null,
    roles:  [ROLES.ADMIN, ROLES.FRAUD_ANALYST, ROLES.RISK_ANALYST],
  },
];

export const SIDEBAR_WIDTH  = 280;
export const NAVBAR_HEIGHT  = 64;
