// Small, consistent stroke-icon set (feather-style) so the app doesn't pull
// in an icon library just for ~20 glyphs. Each takes standard svg props.
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const HomeIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
  </svg>
);

export const GridIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const CartIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="9" cy="20" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="18" cy="20" r="1.3" fill="currentColor" stroke="none" />
    <path d="M2.5 3h2l2.2 11.4a2 2 0 0 0 2 1.6h8.1a2 2 0 0 0 2-1.6L21 7H6" />
  </svg>
);

export const ReceiptIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6 2h12v19l-3-1.5L12 21l-3-1.5L6 21V2Z" />
    <path d="M9 7h6M9 11h6" />
  </svg>
);

export const UserIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20.2a7.5 7.5 0 0 1 15 0" />
  </svg>
);

export const HeartIcon = ({ filled, ...p }) => (
  <svg viewBox="0 0 24 24" {...base} {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20.5s-7.5-4.7-9.8-9.2C.6 7.8 2.3 4.5 5.6 4a4.9 4.9 0 0 1 6.4 2.3A4.9 4.9 0 0 1 18.4 4c3.3.5 5 3.8 3.4 7.3C19.5 15.8 12 20.5 12 20.5Z" />
  </svg>
);

export const StarIcon = ({ filled, ...p }) => (
  <svg viewBox="0 0 24 24" {...base} {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 2.8l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8l-5.8 3 1.1-6.5-4.7-4.6 6.5-.9Z" />
  </svg>
);

export const SearchIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export const BackIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M15 5 8 12l7 7" />
  </svg>
);

export const ShareIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="18" cy="5" r="2.6" />
    <circle cx="6" cy="12" r="2.6" />
    <circle cx="18" cy="19" r="2.6" />
    <path d="M8.3 10.7 15.7 6.6M8.3 13.3l7.4 4.1" />
  </svg>
);

export const FilterIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);

export const SortIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M7 4v16M7 4 3.5 7.5M7 4l3.5 3.5M17 20V4M17 20l3.5-3.5M17 20l-3.5-3.5" />
  </svg>
);

export const StoreIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M3 9.5 4.5 4h15L21 9.5" />
    <path d="M4 9.5V20h16V9.5M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" />
  </svg>
);

export const CheckCircleIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M8 12.5l2.5 2.5L16 9.5" />
  </svg>
);

export const PlusIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MinusIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M5 12h14" />
  </svg>
);

export const TrashIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7m2 0-.7 12.4a2 2 0 0 1-2 1.9H9.7a2 2 0 0 1-2-1.9L7 7" />
  </svg>
);

export const PinIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 21.5s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
    <circle cx="12" cy="9.5" r="2.3" />
  </svg>
);

export const ClockIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 7v5.5l3.5 2" />
  </svg>
);

export const TelegramIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p} fill="currentColor" stroke="none">
    <path d="M21.9 4.2 2.9 11.6c-1.3.5-1.3 1.2-.2 1.6l4.9 1.5 1.9 5.8c.2.6.4.8.9.8s.7-.2 1-.5l2.4-2.3 4.9 3.6c.9.5 1.5.2 1.8-.9l3.2-15c.4-1.4-.5-2-1.6-1.5Z" />
  </svg>
);

export const ChevronRightIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const MenuIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const CloseIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const BellIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6 9.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13.5 6 9.5Z" />
    <path d="M10 18a2 2 0 0 0 4 0" />
  </svg>
);

export const PackageIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M3.5 7.5 12 3l8.5 4.5V16L12 20.5 3.5 16Z" />
    <path d="M3.5 7.5 12 12l8.5-4.5M12 12v8.5" />
  </svg>
);

export const UsersIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M2.8 19.5a6.2 6.2 0 0 1 12.4 0" />
    <path d="M15.5 6a3.2 3.2 0 0 1 0 6.3M19 19.5a5.3 5.3 0 0 0-3.6-5" />
  </svg>
);

export const ChartIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 20V10M11 20V4M18 20v-7" />
  </svg>
);

export const SettingsIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 13.5a7.8 7.8 0 0 0 0-3l2-1.6-2-3.4-2.4.8a7.6 7.6 0 0 0-2.6-1.5L14 2h-4l-.4 2.3a7.6 7.6 0 0 0-2.6 1.5l-2.4-.8-2 3.4 2 1.6a7.8 7.8 0 0 0 0 3l-2 1.6 2 3.4 2.4-.8a7.6 7.6 0 0 0 2.6 1.5L10 22h4l.4-2.3a7.6 7.6 0 0 0 2.6-1.5l2.4.8 2-3.4Z" />
  </svg>
);

export const SunIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
  </svg>
);

export const MoonIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7Z" />
  </svg>
);

export const LogoutIcon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);
