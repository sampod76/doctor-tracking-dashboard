import { SidebarData } from "@/types";
import {
  MedicineBoxTwoTone,
  DashboardTwoTone,
  IdcardTwoTone,
  RedEnvelopeTwoTone,
  SettingTwoTone,
} from "@ant-design/icons";

export const sidebarData: SidebarData[] = [
  {
    title: "General",
    key: "General",
    items: [
      {
        title: "Dashboard",
        key: "/dashboard",
        url: "/dashboard",
        icon: DashboardTwoTone,
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
        icon: RedEnvelopeTwoTone,
      },
      {
        title: "Profile",
        key: "/dashboard/profile",
        url: "/dashboard/profile",
        icon: IdcardTwoTone,
      },
      {
        title: "Settings",
        key: "/dashboard/settings",
        url: "/dashboard/settings",
        icon: SettingTwoTone,
      },
    ],
  },
];
