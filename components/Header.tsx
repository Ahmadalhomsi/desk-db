"use client";

import { motion } from "motion/react";
import { ExternalLink, Plus, Activity, ImageIcon, Filter } from "lucide-react";
import { VanishInput } from "@/components/ui/vanish-input";

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  onAddClick: () => void;
  onScanClick: () => void;
  onPingAllClick: () => void;
  pingingAll: boolean;
}

export function Header({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onAddClick,
  onScanClick,
  onPingAllClick,
  pingingAll,
}: HeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 md:mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-600 flex items-center justify-center">
              <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                MAPOS AnyDesk Manager
              </h1>
              <p className="text-slate-400 mt-1 text-xs sm:text-sm">
                Manage your customer connections
              </p>
            </div>
          </motion.div>
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onPingAllClick}
              disabled={pingingAll}
              className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden xs:inline">{pingingAll ? "Pinging..." : "Ping All"}</span>
              <span className="xs:hidden">Ping</span>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onScanClick}
              className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm sm:text-base font-medium transition-colors border border-slate-700"
              title="Extract AnyDesk ID from image"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="hidden xs:inline">Scan ID</span>
              <span className="xs:hidden">Scan</span>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onAddClick}
              className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm sm:text-base font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Add Customer</span>
              <span className="xs:hidden">Add</span>
            </motion.button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <VanishInput
              placeholders={[
                "Search by customer name...",
                "Search by AnyDesk ID...",
                "Find a customer...",
              ]}
              onChange={(e) => onSearchChange(e.target.value)}
              onSubmit={(value) => onSearchChange(value)}
            />
          </div>
          <div className="flex gap-2 items-center w-full md:w-auto">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="flex-1 md:flex-none px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm sm:text-base text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
