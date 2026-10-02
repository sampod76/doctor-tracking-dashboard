import { SidebarData } from "@/types";
import { AppstoreAddOutlined, MedicineBoxTwoTone, ContactsTwoTone } from "@ant-design/icons";

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
      {
        title: "Doctors",
        key: "/dashboard/doctors",
        url: "/dashboard/doctors",
        icon: MedicineBoxTwoTone,
      },
      {
        title: "Patients",
        key: "/dashboard/patients",
        url: "/dashboard/patients",
        icon: ContactsTwoTone,
      },
      {
        title: "Profile",
        key: "/dashboard/profile",
        url: "/dashboard/patients",
        icon: ContactsTwoTone,
      },
      {
        title: "Settings",
        key: "/dashboard/settings",
        url: "/dashboard/settings",
        icon: ContactsTwoTone,
      },
    ],
  },
];
