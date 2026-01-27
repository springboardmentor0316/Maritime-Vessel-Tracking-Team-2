// Vessel Types
export const VESSEL_TYPES = {
  CARGO: 'cargo',
  TANKER: 'tanker',
  PASSENGER: 'passenger',
  FISHING: 'fishing',
  MILITARY: 'military',
  PLEASURE: 'pleasure',
  SAILING: 'sailing',
  TUG: 'tug',
  OTHER: 'other',
};

export const VESSEL_TYPE_LABELS = {
  cargo: 'Cargo',
  tanker: 'Tanker',
  passenger: 'Passenger',
  fishing: 'Fishing',
  military: 'Military',
  pleasure: 'Pleasure',
  sailing: 'Sailing',
  tug: 'Tug',
  other: 'Other',
};

// Vessel Status
export const VESSEL_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ANCHORED: 'anchored',
  MOORED: 'moored',
  UNDERWAY: 'underway',
  AGROUND: 'aground',
  AT_ANCHOR: 'at_anchor',
  NOT_UNDER_COMMAND: 'not_under_command',
  RESTRICTED_MANEUVERABILITY: 'restricted_maneuverability',
};

export const VESSEL_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  anchored: 'Anchored',
  moored: 'Moored',
  underway: 'Underway',
  aground: 'Aground',
  at_anchor: 'At Anchor',
  not_under_command: 'Not Under Command',
  restricted_maneuverability: 'Restricted Maneuverability',
};

// Voyage Status
export const VOYAGE_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DELAYED: 'delayed',
};

export const VOYAGE_STATUS_LABELS = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  delayed: 'Delayed',
};

// Event Types
export const EVENT_TYPES = {
  DEPARTURE: 'departure',
  ARRIVAL: 'arrival',
  INCIDENT: 'incident',
  MAINTENANCE: 'maintenance',
  WEATHER_DELAY: 'weather_delay',
  PORT_CONGESTION: 'port_congestion',
  CUSTOMS_INSPECTION: 'customs_inspection',
  REFUELING: 'refueling',
  EMERGENCY: 'emergency',
  POSITION_UPDATE: 'position_update',
};

export const EVENT_TYPE_LABELS = {
  departure: 'Departure',
  arrival: 'Arrival',
  incident: 'Incident',
  maintenance: 'Maintenance',
  weather_delay: 'Weather Delay',
  port_congestion: 'Port Congestion',
  customs_inspection: 'Customs Inspection',
  refueling: 'Refueling',
  emergency: 'Emergency',
  position_update: 'Position Update',
};

// Severity Levels
export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const SEVERITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Navigation Items
export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/app/dashboard',
    icon: '📊',
  },
  {
    id: 'vessels',
    label: 'Vessels',
    icon: '🚢',
    children: [
      {
        id: 'vessels-list',
        label: 'All Vessels',
        path: '/app/vessels',
      },
      {
        id: 'vessels-live',
        label: 'Live Map',
        path: '/app/vessels/live',
      },
    ],
  },
  {
    id: 'ports',
    label: 'Ports',
    path: '/app/ports',
    icon: '⚓',
  },
  {
    id: 'voyages',
    label: 'Voyages',
    path: '/app/voyages',
    icon: '🛤️',
  },
  {
    id: 'events',
    label: 'Events',
    path: '/app/events',
    icon: '📢',
  },
  {
    id: 'safety',
    label: 'Safety',
    path: '/app/safety',
    icon: '🛡️',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/app/analytics',
    icon: '📈',
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/app/profile',
    icon: '👤',
  },
];