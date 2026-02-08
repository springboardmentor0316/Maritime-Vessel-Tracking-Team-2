// React Icons
import { 
  MdDashboard, 
  MdAnchor, 
  MdOutlineAnalytics, 
  MdOutlineNotificationsActive
} from "react-icons/md";
import { FaShip, FaUserCircle, FaMapMarkedAlt, FaFlag } from "react-icons/fa";
import { GiPathDistance, GiRadarSweep } from "react-icons/gi";
import { IoMdAlert, IoMdStats } from "react-icons/io";
import { PiTrafficSignalBold } from "react-icons/pi";
import { HiOutlineUser } from "react-icons/hi2";

// Navigation Items (React Icons)
export const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/app/dashboard",
    icon: <MdDashboard size={20} />,
  },

  {
    id: "vessels",
    label: "Vessels",
    icon: <FaShip size={20} />,
    children: [
      {
        id: "vessels-list",
        label: "All Vessels",
        path: "/app/vessels",
      },
      {
        id: "vessels-live",
        label: "Live Map",
        path: "/app/vessels/live",
      },
    ],
  },

  {
    id: "ports",
    label: "Ports",
    path: "/app/ports",
    icon: <MdAnchor size={20} />,
  },

  

  {
    id: "events",
    label: "Events",
    path: "/app/events",
    icon: <IoMdAlert size={20} />,
  },

  {
    id: "safety",
    label: "Safety",
    path: "/app/safety",
    icon: <GiRadarSweep size={20} />,
  },

  {
    id: "analytics",
    label: "Analytics",
    path: "/app/analytics",
    icon: <MdOutlineAnalytics size={20} />,
  },

  {
    id: "profile",
    label: "Profile",
    path: "/app/profile",
    icon: <HiOutlineUser size={20} />,
  },
];
