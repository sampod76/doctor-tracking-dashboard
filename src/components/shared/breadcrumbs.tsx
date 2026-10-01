"use client";

import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  homePath?: string;
}

export default function Breadcrumbs({ items, showHome = true, homePath = "/" }: BreadcrumbsProps) {
  const pathname = usePathname();

  let displayItems: BreadcrumbItem[] = [];

  if (items && items.length > 0) {
    displayItems = items;
  } else {
    const pathSegments = pathname.split("/").filter(Boolean);
    displayItems = pathSegments
      .filter((segment) => segment.toLowerCase() !== "dashboard") // Remove 'dashboard' redundancy
      .map((segment) => {
        // Reconstruct path properly: find the original index in pathSegments
        const originalIndex = pathSegments.indexOf(segment);
        const path = `/${pathSegments.slice(0, originalIndex + 1).join("/")}`;
        const label = segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return { label, path };
      });
  }

  const allItems = showHome ? [{ label: "Home", path: homePath }, ...displayItems] : displayItems;

  const lastIndex = allItems.length - 1;

  const breadcrumbItems = allItems.map((item, index) => ({
    title:
      index === lastIndex ? (
        <span className="font-medium text-gray-500">{item.label}</span>
      ) : item.path ? (
        <Link href={item.path} className="text-blue-600 transition-colors hover:text-blue-800">
          {index === 0 && item.label === "Home" ? (
            <span className="flex items-center gap-1">
              <HomeOutlined /> Dashboard
            </span>
          ) : (
            item.label
          )}
        </Link>
      ) : (
        <span>{item.label}</span>
      ),
  }));

  return (
    <Breadcrumb
      className="bg-[#e9ecef] px-5 py-3"
      items={breadcrumbItems}
      style={{ marginBottom: 20 }}
    />
  );
}
