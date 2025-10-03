"use client";

import { useState, useEffect } from "react";
import { FocusCards } from "@/components/ui/focus-cards";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { AddCustomerModal } from "@/components/AddCustomerModal";
import { OCRModal } from "@/components/OCRModal";
import { EmptyState } from "@/components/EmptyState";
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

  const handleOpenOcrModal = () => {
    setShowOcrModal(true);
    setOcrImage(null);
    setProcessedImage(null);
    setExtractedIds([]);
  };

  const handleTryAnotherImage = () => {
    setOcrImage(null);
    setProcessedImage(null);
    setExtractedIds([]);
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
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        onAddClick={() => setShowAddModal(true)}
        onScanClick={handleOpenOcrModal}
        onPingAllClick={pingAllCustomers}
        pingingAll={pingingAll}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-44 sm:pt-48 md:pt-52 pb-20">
        <StatsCards
          totalCustomers={customers.length}
          totalCategories={categories.length}
          onlineCount={customers.filter(c => c.isOnline).length}
        />

        {/* Customer Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : filteredCustomers.length > 0 ? (
          <FocusCards cards={cards} onCardClick={handleCardClick} onDelete={handleDeleteCustomer} onPing={pingCustomer} />
        ) : (
          <EmptyState hasCustomers={customers.length > 0} />
        )}
      </div>

      <AddCustomerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCustomer}
        formData={formData}
        onFormDataChange={setFormData}
      />

      <OCRModal
        isOpen={showOcrModal}
        onClose={() => setShowOcrModal(false)}
        ocrImage={ocrImage}
        processedImage={processedImage}
        extractedIds={extractedIds}
        ocrProcessing={ocrProcessing}
        onFileUpload={handleFileUpload}
        onUseExtractedId={useExtractedId}
        onTryAnother={handleTryAnotherImage}
      />
    </div>
  );
}
