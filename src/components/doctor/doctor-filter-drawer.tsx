import { FilterOutlined } from "@ant-design/icons";
import { Button, Drawer } from "antd";
import type { CSSProperties } from "react";
import DoctorFilters, { type DoctorFilterValuesProps } from "./doctor-filters";

type DoctorFilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  filters: DoctorFilterValuesProps;
};

export default function DoctorFilterDrawer({ open, onClose, filters }: DoctorFilterDrawerProps) {
  return (
    <Drawer
      title={
        <span className="inline-flex items-center gap-2">
          <FilterOutlined /> Filter Doctors
        </span>
      }
      placement="bottom"
      open={open}
      onClose={onClose}
      height="min(560px, 90dvh)"
      styles={{
        content: { borderRadius: "16px 16px 0 0" },
        footer: { paddingBottom: "max(12px, env(safe-area-inset-bottom))" },
      }}
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button size="large" onClick={filters.resetFilters}>
            Reset
          </Button>
          <Button
            type="primary"
            size="large"
            style={{ "--color-primary": "#f97316" } as CSSProperties}
            onClick={onClose}
          >
            Apply Filters
          </Button>
        </div>
      }
    >
      <DoctorFilters mode="mobile" {...filters} />
    </Drawer>
  );
}
