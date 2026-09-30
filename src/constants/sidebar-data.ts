import { SidebarData } from "@/types";
import { AppstoreAddOutlined } from "@ant-design/icons";

/**
 * Minimal, neutral sidebar data used as a starting point for the
 * new application. The previous version of this file contained the
 * full old travel/news domain menu. Future projects should extend
 * `items` here as new features are added.
 *
 * Items use a generic permission string ("dashboard.view") so the
 * existing permission guard/middleware pipeline keeps working.
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
                permission: "dashboard.view",
            },
        ],
    },
];