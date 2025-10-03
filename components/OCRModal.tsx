"use client";

import { motion, AnimatePresence } from "motion/react";
import { ImageIcon, X } from "lucide-react";
import { useRef } from "react";

interface OCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  ocrImage: string | null;
  processedImage: string | null;
  extractedIds: string[];
  ocrProcessing: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUseExtractedId: (id: string) => void;
  onTryAnother: () => void;
}

export function OCRModal({
  isOpen,
  onClose,
  ocrImage,
  processedImage,
  extractedIds,
  ocrProcessing,
  onFileUpload,
  onUseExtractedId,
  onTryAnother,
}: OCRModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Extract AnyDesk ID from Image
              </h2>
              <button
                onClick={onClose}
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
                    onChange={onFileUpload}
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
                            onClick={() => onUseExtractedId(id)}
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
                    onClick={onTryAnother}
                    className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors border border-slate-700"
                  >
                    Try Another Image
                  </button>
                  <button
                    onClick={onClose}
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
  );
}
