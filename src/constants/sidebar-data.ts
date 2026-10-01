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
        key: "/dashboard/patient",
        url: "/dashboard/patient",
        icon: ContactsTwoTone,
      },
    ],
  },
];
