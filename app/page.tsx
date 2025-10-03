"use client";

import { useState, useEffect, useRef } from "react";
import { FocusCards } from "@/components/ui/focus-cards";
import { VanishInput } from "@/components/ui/vanish-input";
import { WobbleCard } from "@/components/ui/wobble-card";
import { Search, Plus, ExternalLink, Trash2, Edit, Filter, Activity, Image as ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Tesseract from 'tesseract.js';

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
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [extractedIds, setExtractedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // OCR functionality
  const handlePasteImage = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const imageUrl = event.target?.result as string;
            setOcrImage(imageUrl);
            setShowOcrModal(true);
            processOCR(imageUrl);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setOcrImage(imageUrl);
        setShowOcrModal(true);
        processOCR(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const processOCR = async (imageUrl: string) => {
    setOcrProcessing(true);
    setExtractedIds([]);
    
    try {
      // Process image to enhance red text detection
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      // Get image data and enhance red colors
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      if (imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const red = data[i];
          const green = data[i + 1];
          const blue = data[i + 2];
          
          // Enhance pixels that are predominantly red
          if (red > 100 && red > green * 1.5 && red > blue * 1.5) {
            // Make red text darker/more contrasted
            data[i] = 0;     // R
            data[i + 1] = 0; // G
            data[i + 2] = 0; // B
          } else {
            // Make everything else white
            data[i] = 255;     // R
            data[i + 1] = 255; // G
            data[i + 2] = 255; // B
          }
        }
        ctx?.putImageData(imageData, 0, 0);
      }
      
      const processedImageUrl = canvas.toDataURL();
      setProcessedImage(processedImageUrl);
      
      // Run OCR with better configuration for numbers
      const result = await Tesseract.recognize(processedImageUrl, 'eng', {
        logger: (m) => console.log(m),
      });

      const text = result.data.text.trim();
      const normalizedText = text
        .replace(/[Il\|!'](?=\s*\d)/g, "1");
      console.log('OCR Raw Text:', text);
      console.log('OCR Normalized Text:', normalizedText);
      console.log('OCR Text (cleaned):', normalizedText.replace(/[^\d\s]/g, ''));
      
      // Clean the text - keep only digits and spaces, normalize multiple spaces to single space
    const cleanedText = normalizedText.replace(/[^\d\s]/g, '').replace(/\s+/g, ' ').trim();
      console.log('Cleaned text:', cleanedText);
      
      const foundIds: string[] = [];
      
      // Extract all digits from the text (removing spaces)
      const allDigits = cleanedText.replace(/\s/g, '');
      console.log('All digits found:', allDigits);
      
      // If we have 9-11 digits total, this is likely a single AnyDesk ID
      if (allDigits.length >= 9 && allDigits.length <= 11) {
        // Format with spaces: put the first 1-3 digits as the first group
        let formatted = '';
        
        // Determine grouping based on total length
        if (allDigits.length === 10) {
          // 10 digits: format as "1 234 567 890" (1-3-3-3)
          formatted = `${allDigits[0]} ${allDigits.slice(1, 4)} ${allDigits.slice(4, 7)} ${allDigits.slice(7)}`;
        } else if (allDigits.length === 11) {
          // 11 digits: format as "12 345 678 901" (2-3-3-3)
          formatted = `${allDigits.slice(0, 2)} ${allDigits.slice(2, 5)} ${allDigits.slice(5, 8)} ${allDigits.slice(8)}`;
        } else if (allDigits.length === 9) {
          // 9 digits: format as "123 456 789" (3-3-3)
          formatted = `${allDigits.slice(0, 3)} ${allDigits.slice(3, 6)} ${allDigits.slice(6)}`;
        } else {
          // Other lengths: just split every 3 digits
          formatted = allDigits.match(/.{1,3}/g)?.join(' ') || allDigits;
        }
        
        foundIds.push(formatted);
        console.log('Formatted ID:', formatted);
      } else {
        // Multiple possible IDs or need different strategy
        // Try to find digit groups that might be AnyDesk IDs
        const digitGroups = cleanedText.split(/\s{2,}/).filter(g => g.trim());
        
        digitGroups.forEach(group => {
          const digitsOnly = group.replace(/\s/g, '');
          if (digitsOnly.length >= 9 && digitsOnly.length <= 11) {
            // Format this group
            let formatted = '';
            if (digitsOnly.length === 10) {
              formatted = `${digitsOnly[0]} ${digitsOnly.slice(1, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7)}`;
            } else if (digitsOnly.length === 11) {
              formatted = `${digitsOnly.slice(0, 2)} ${digitsOnly.slice(2, 5)} ${digitsOnly.slice(5, 8)} ${digitsOnly.slice(8)}`;
            } else if (digitsOnly.length === 9) {
              formatted = `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`;
            } else {
              formatted = digitsOnly.match(/.{1,3}/g)?.join(' ') || digitsOnly;
            }
            
            if (!foundIds.includes(formatted)) {
              foundIds.push(formatted);
            }
          }
        });
      }
      
      console.log('Found IDs:', foundIds);
      setExtractedIds(foundIds);
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to process image. Please try again with a clearer image.');
    } finally {
      setOcrProcessing(false);
    }
  };

  const useExtractedId = (id: string) => {
    setFormData({ ...formData, anydeskId: id });
    setShowOcrModal(false);
    setShowAddModal(true);
  };

  useEffect(() => {
    // Add paste event listener
    const handlePaste = (e: ClipboardEvent) => {
      // Only handle paste if not in an input field
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        handlePasteImage(e);
      }
    };

    document.addEventListener('paste', handlePaste as any);
    return () => {
      document.removeEventListener('paste', handlePaste as any);
    };
  }, []);


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
                onClick={pingAllCustomers}
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
                onClick={() => {
                  setShowOcrModal(true);
                  setOcrImage(null);
                  setProcessedImage(null);
                  setExtractedIds([]);
                }}
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
                onClick={() => setShowAddModal(true)}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                onSubmit={(value) => setSearchTerm(value)}
              />
            </div>
            <div className="flex gap-2 items-center w-full md:w-auto">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-44 sm:pt-48 md:pt-52 pb-20">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          <WobbleCard containerClassName="h-28 sm:h-32">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-xs sm:text-sm">Total Customers</p>
                <p className="text-3xl sm:text-4xl font-bold text-white mt-1">
                  {customers.length}
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
                  {categories.length}
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
                  {customers.filter(c => c.isOnline).length}/{customers.length}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-600/20 flex items-center justify-center border border-red-600/30">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
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
          <div className="text-center py-12 sm:py-20 px-4">
            <Search className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-400 mb-2">
              No customers found
            </h3>
            <p className="text-sm sm:text-base text-slate-500">
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
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 max-w-md w-full mx-4"
            >
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-white">
                Add New Customer
              </h2>
              <form onSubmit={handleAddCustomer} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
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
                      setFormData({ ...formData, anydeskId: e.target.value })
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
                      setFormData({ ...formData, category: e.target.value })
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
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm sm:text-base bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
                <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
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

      {/* OCR Modal */}
      <AnimatePresence>
        {showOcrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowOcrModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Extract AnyDesk ID from Image
                </h2>
                <button
                  onClick={() => setShowOcrModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!ocrImage ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 sm:p-12 text-center">
                    <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-slate-400 mb-2">
                      Paste an image (Ctrl+V) or upload a file
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 mb-4">
                      The image should contain an AnyDesk ID (9-10 digits)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                    >
                      Choose File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Original Image:</p>
                      <div className="relative rounded-lg overflow-hidden border border-slate-800">
                        <img
                          src={ocrImage}
                          alt="Original"
                          className="w-full h-auto max-h-48 object-contain bg-slate-950"
                        />
                      </div>
                    </div>
                    {processedImage && (
                      <div>
                        <p className="text-xs text-slate-400 mb-2">Processed (Red Text Enhanced):</p>
                        <div className="relative rounded-lg overflow-hidden border border-slate-800">
                          <img
                            src={processedImage}
                            alt="Processed"
                            className="w-full h-auto max-h-48 object-contain bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {ocrProcessing ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
                      <p className="text-slate-400">Processing image...</p>
                    </div>
                  ) : extractedIds.length > 0 ? (
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-slate-300 mb-3">
                        Found {extractedIds.length} AnyDesk ID{extractedIds.length > 1 ? 's' : ''}:
                      </h3>
                      <div className="space-y-2">
                        {extractedIds.map((id, index) => (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 bg-slate-800 rounded-lg p-3 border border-slate-700"
                          >
                            <code className="text-base sm:text-lg text-red-400 font-mono break-all">{id}</code>
                            <button
                              onClick={() => useExtractedId(id)}
                              className="w-full sm:w-auto px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
                            >
                              Use This ID
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <p className="text-sm sm:text-base text-slate-400 mb-2">No AnyDesk IDs found</p>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Make sure the image is clear and contains a visible AnyDesk ID
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 sm:gap-3 pt-4">
                    <button
                      onClick={() => {
                        setOcrImage(null);
                        setProcessedImage(null);
                        setExtractedIds([]);
                      }}
                      className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors border border-slate-700"
                    >
                      Try Another Image
                    </button>
                    <button
                      onClick={() => setShowOcrModal(false)}
                      className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
