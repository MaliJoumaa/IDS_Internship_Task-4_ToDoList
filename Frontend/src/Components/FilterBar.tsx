import type { TaskFilter } from "../Types/task";

interface FilterBarProps {
    value: TaskFilter;
    onChange: (filter: TaskFilter) => void;
}

const FILTERS: { value: TaskFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
];

export default function FilterBar({ value, onChange }: FilterBarProps) {
    return (
        <div className="mb-4 flex gap-1">
            {FILTERS.map((filter) => (
                <button
                    key={filter.value}
                    type="button"
                    onClick={() => onChange(filter.value)}
                    className={
                        "rounded px-3 py-1.5 text-sm font-medium transition-colors " +
                        (filter.value === value
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-600 hover:bg-slate-100")
                    }
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
}
