"use client";

import { Search } from "lucide-react";

interface EmptyStateProps {
  hasCustomers: boolean;
}

export function EmptyState({ hasCustomers }: EmptyStateProps) {
  return (
    <div className="text-center py-12 sm:py-20 px-4">
      <Search className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
      <h3 className="text-xl sm:text-2xl font-semibold text-slate-400 mb-2">
        No customers found
      </h3>
      <p className="text-sm sm:text-base text-slate-500">
        {hasCustomers
          ? "Try adjusting your search or filters"
          : "Add your first customer to get started"}
      </p>
    </div>
  );
}
