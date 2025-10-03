"use client";

import { motion, AnimatePresence } from "motion/react";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    name: string;
    anydeskId: string;
    category: string;
    notes: string;
  };
  onFormDataChange: (data: any) => void;
}

export function AddCustomerModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormDataChange,
}: AddCustomerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 max-w-md w-full mx-4"
          >
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-white">
              Add New Customer
            </h2>
            <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm sm:text-base bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                  AnyDesk ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.anydeskId}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, anydeskId: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm sm:text-base bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent font-mono"
                  placeholder="123456789"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm sm:text-base bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="e.g., Office, Retail, Support"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm sm:text-base bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm sm:text-base bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm sm:text-base bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
