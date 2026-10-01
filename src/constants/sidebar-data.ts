import { SidebarData } from "@/types";
import { AppstoreAddOutlined } from "@ant-design/icons";

/**
 * Minimal, neutral sidebar data used as a starting point for the
 * new application. The previous version of this file contained the
 * full old travel/news domain menu. Future projects should extend
 * `items` here as new features are added.
 *
 * Authentication is checked by the dashboard layout; optional menu roles
 * use the backend role values.
 */
export const sidebarData: SidebarData[] = [
  {
    title: "General",
    key: "General",
    items: [
      {
        title: "Dashboard",
        key: "/dashboard",
        url: "/dashboard",
        icon: AppstoreAddOutlined,
      },
    ],
  },
];
