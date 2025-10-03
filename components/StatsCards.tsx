"use client";

import { WobbleCard } from "@/components/ui/wobble-card";
import { ExternalLink, Filter, Activity } from "lucide-react";

interface StatsCardsProps {
  totalCustomers: number;
  totalCategories: number;
  onlineCount: number;
}

export function StatsCards({ totalCustomers, totalCategories, onlineCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
      <WobbleCard containerClassName="h-28 sm:h-32">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-xs sm:text-sm">Total Customers</p>
            <p className="text-3xl sm:text-4xl font-bold text-white mt-1">
              {totalCustomers}
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-600/20 flex items-center justify-center border border-red-600/30">
            <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
          </div>
        </div>
      </WobbleCard>

      <WobbleCard containerClassName="h-28 sm:h-32">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-xs sm:text-sm">Categories</p>
            <p className="text-3xl sm:text-4xl font-bold text-white mt-1">
              {totalCategories}
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-600/20 flex items-center justify-center border border-red-600/30">
            <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
          </div>
        </div>
      </WobbleCard>

      <WobbleCard containerClassName="h-28 sm:h-32 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-xs sm:text-sm">Online Status</p>
            <p className="text-3xl sm:text-4xl font-bold text-white mt-1">
              {onlineCount}/{totalCustomers}
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-600/20 flex items-center justify-center border border-red-600/30">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
          </div>
        </div>
      </WobbleCard>
    </div>
  );
}
