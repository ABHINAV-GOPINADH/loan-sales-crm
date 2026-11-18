import React from "react";
import { LEAD_STATUS_CONFIG } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const config = LEAD_STATUS_CONFIG[status] || {
    label: status,
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
}
