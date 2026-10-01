import { FilterOutlined, UserOutlined } from "@ant-design/icons";

type PatientHeaderProps = {
  filterOpen: boolean;
  onOpenFilters: () => void;
};

export default function PatientHeader({ filterOpen, onOpenFilters }: PatientHeaderProps) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2 sm:gap-4">
      <h2 className="flex min-w-0 items-center gap-2 whitespace-nowrap text-lg font-bold tracking-tight text-gray-900 sm:text-3xl">
        <UserOutlined className="text-orange-500 sm:hidden" />
        <span className="sm:hidden">Patients</span>
        <span className="hidden sm:inline">Patient Management</span>
      </h2>
      <button
        type="button"
        aria-label="Filter patients"
        aria-expanded={filterOpen}
        aria-haspopup="dialog"
        onClick={onOpenFilters}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg text-slate-600 hover:bg-slate-50 sm:hidden"
      >
        <FilterOutlined />
      </button>
    </div>
  );
}
