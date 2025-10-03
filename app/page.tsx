"use client";

import { useState, useEffect } from "react";
import { FocusCards } from "@/components/ui/focus-cards";
import { VanishInput } from "@/components/ui/vanish-input";
import { WobbleCard } from "@/components/ui/wobble-card";
import { Search, Plus, ExternalLink, Trash2, Edit, Filter, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Customer {
  id: string;
  name: string;
  anydeskId: string;
  category: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isOnline?: boolean;
  lastPing?: string;
}

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pingingAll, setPingingAll] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    anydeskId: "",
    category: "",
    notes: "",
  });

  useEffect(() => {
    fetchCustomers();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, selectedCategory]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/customers");
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.anydeskId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (customer) => customer.category === selectedCategory
      );
    }

    setFilteredCustomers(filtered);
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({ name: "", anydeskId: "", category: "", notes: "" });
        fetchCustomers();
        fetchCategories();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add customer");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer");
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      const response = await fetch(`/api/customers?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCustomers();
        fetchCategories();
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const pingCustomer = async (customerId: string, anydeskId: string) => {
    try {
      // Simulate ping - in real scenario, you'd ping the actual AnyDesk service
      // For now, we'll use a random online status for demonstration
      const isOnline = Math.random() > 0.3; // 70% chance of being online
      
      setCustomers(prev => prev.map(c => 
        c.id === customerId 
          ? { ...c, isOnline, lastPing: new Date().toISOString() }
          : c
      ));
      
      return isOnline;
    } catch (error) {
      console.error("Error pinging customer:", error);
      return false;
    }
  };

  const pingAllCustomers = async () => {
    setPingingAll(true);
    try {
      for (const customer of customers) {
        await pingCustomer(customer.id, customer.anydeskId);
        // Small delay between pings to avoid overwhelming
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } finally {
      setPingingAll(false);
    }
  };

  const handleCardClick = (card: { id: string; title: string; anydeskId: string; category: string; notes?: string }) => {
    // Create a temporary iframe to handle the protocol link
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `anydesk:${card.anydeskId}`;
    document.body.appendChild(iframe);
    
    // Remove iframe after a short delay
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  //test2

  const cards = filteredCustomers.map((customer) => ({
    id: customer.id,
    title: customer.name,
    anydeskId: customer.anydeskId,
    category: customer.category,
    notes: customer.notes,
    isOnline: customer.isOnline,
    lastPing: customer.lastPing,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center">
                <ExternalLink className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  MAPOS AnyDesk Manager
                </h1>
                <p className="text-slate-400 mt-1 text-sm">
                  Manage your customer connections
                </p>
              </div>
            </motion.div>
            <div className="flex gap-3">
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={pingAllCustomers}
                disabled={pingingAll}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
              >
                <Activity className="w-4 h-4" />
                {pingingAll ? "Pinging..." : "Ping All"}
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Customer
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
                onChange={(e) => setSearchTerm(e.target.value)}
                onSubmit={(value) => setSearchTerm(value)}
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600"
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

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-48 pb-20">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <WobbleCard containerClassName="h-32">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Total Customers</p>
                <p className="text-4xl font-bold text-white mt-1">
                  {customers.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center border border-red-600/30">
                <ExternalLink className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </WobbleCard>

          <WobbleCard containerClassName="h-32">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Categories</p>
                <p className="text-4xl font-bold text-white mt-1">
                  {categories.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center border border-red-600/30">
                <Filter className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </WobbleCard>

          <WobbleCard containerClassName="h-32">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Online Status</p>
                <p className="text-4xl font-bold text-white mt-1">
                  {customers.filter(c => c.isOnline).length}/{customers.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center border border-red-600/30">
                <Activity className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </WobbleCard>
        </div>

        {/* Customer Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : filteredCustomers.length > 0 ? (
          <FocusCards cards={cards} onCardClick={handleCardClick} onDelete={handleDeleteCustomer} onPing={pingCustomer} />
        ) : (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-slate-400 mb-2">
              No customers found
            </h3>
            <p className="text-slate-500">
              {customers.length === 0
                ? "Add your first customer to get started"
                : "Try adjusting your search or filters"}
            </p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full"
            >
              <h2 className="text-xl font-bold mb-6 text-white">
                Add New Customer
              </h2>
              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    AnyDesk ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.anydeskId}
                    onChange={(e) =>
                      setFormData({ ...formData, anydeskId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent font-mono"
                    placeholder="123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="e.g., Office, Retail, Support"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                  >
                    Add Customer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
