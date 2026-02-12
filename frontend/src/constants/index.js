// React Icons
import { 
  MdDashboard, 
  MdAnchor, 
  MdOutlineAnalytics
} from "react-icons/md";

import { FaShip } from "react-icons/fa";
import { GiRadarSweep } from "react-icons/gi";
import { IoMdAlert } from "react-icons/io";
import { HiOutlineUser } from "react-icons/hi2";

// Navigation Items
export const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/app/dashboard",
    icon: <MdDashboard size={20} />,
    roles: ["admin", "analyst", "operator"],
  },

  {
    id: "vessels",
    label: "Vessels",
    icon: <FaShip size={20} />,
    roles: ["admin", "analyst", "operator"],
    children: [
      {
        id: "vessels-list",
        label: "All Vessels",
        path: "/app/vessels",
        roles: ["admin", "analyst", "operator"],
      },
      {
        id: "vessels-live",
        label: "Live Map",
        path: "/app/vessels/live",
        roles: ["admin", "analyst", "operator"],
      },
    ],
  },

  {
    id: "ports",
    label: "Ports",
    path: "/app/ports",
    icon: <MdAnchor size={20} />,
    roles: ["admin"], // ADMIN ONLY
  },

  {
    id: "events",
    label: "Events",
    path: "/app/events",
    icon: <IoMdAlert size={20} />,
    roles: ["admin", "analyst", "operator"],
  },

  {
    id: "safety",
    label: "Safety",
    path: "/app/safety",
    icon: <GiRadarSweep size={20} />,
    roles: ["admin", "operator"], // Analyst blocked
  },

  {
    id: "analytics",
    label: "Analytics",
    path: "/app/analytics",
    icon: <MdOutlineAnalytics size={20} />,
    roles: ["admin", "analyst"], // Operator blocked
  },

  {
    id: "profile",
    label: "Profile",
    path: "/app/profile",
    icon: <HiOutlineUser size={20} />,
    roles: ["admin", "analyst", "operator"],
  },
];
