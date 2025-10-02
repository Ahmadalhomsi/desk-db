"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Activity, Clock, Copy, Check, Trash2 } from "lucide-react";

export const Card = React.memo(
  ({ 
    card,
    index,
    hovered,
    setHovered,
    onClick,
    onPing,
    onDelete,
  }: { 
    card: any;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
    onClick?: () => void;
    onPing?: (e: React.MouseEvent) => void;
    onDelete?: (e: React.MouseEvent) => void;
  }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(card.anydeskId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    };
    
    return (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      onClick={onClick}
      className={cn(
        "rounded-lg relative bg-slate-900 overflow-hidden h-auto w-full transition-all duration-200 ease-out cursor-pointer border border-slate-800 hover:border-red-600",
        hovered !== null && hovered !== index && "opacity-60"
      )}
    >
      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-3 left-3 z-10 p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          title="Delete customer"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      )}
      
      {/* Online Status Indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          card.isOnline === true ? "bg-green-500" :
          card.isOnline === false ? "bg-red-500" :
          "bg-slate-600"
        )} />
        {card.isOnline !== undefined && (
          <span className={cn(
            "text-xs font-medium",
            card.isOnline ? "text-green-400" : "text-slate-400"
          )}>
            {card.isOnline ? "Online" : "Offline"}
          </span>
        )}
      </div>
      
      <div className="p-4 pt-12">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            {card.title}
          </h3>
          <span className="text-xs text-slate-400 px-2 py-1 bg-slate-800 rounded border border-slate-700">
            {card.category}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 bg-slate-800 rounded-lg p-2.5 border border-slate-700">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs text-slate-400 whitespace-nowrap">ID:</span>
              <code className="text-sm text-red-400 font-mono truncate">
                {card.anydeskId}
              </code>
            </div>
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
              title="Copy ID"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-slate-400 hover:text-red-400" />
              )}
            </button>
          </div>
          
          {card.notes && (
            <div className="text-xs text-slate-400 line-clamp-2 bg-slate-800 rounded-lg p-2.5 border border-slate-700">
              {card.notes}
            </div>
          )}
          
          {card.lastPing && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 px-2">
              <Clock className="w-3 h-3" />
              <span>Last ping: {new Date(card.lastPing).toLocaleTimeString()}</span>
            </div>
          )}
          
          {/* Ping Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPing?.(e);
            }}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-red-600 border border-slate-700 hover:border-red-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Ping Status
          </button>
        </div>
      </div>
    </div>
    );
  }
);

Card.displayName = "Card";

type CardType = {
  id: string;
  title: string;
  anydeskId: string;
  category: string;
  notes?: string;
  isOnline?: boolean;
  lastPing?: string;
};

export function FocusCards({ 
  cards, 
  onCardClick,
  onPing,
  onDelete
}: { 
  cards: CardType[];
  onCardClick?: (card: CardType) => void;
  onPing?: (cardId: string, anydeskId: string) => void;
  onDelete?: (cardId: string) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.anydeskId}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
          onClick={() => onCardClick?.(card)}
          onPing={() => onPing?.(card.id, card.anydeskId)}
          onDelete={(e) => {
            e.stopPropagation();
            onDelete?.(card.id);
          }}
        />
      ))}
    </div>
  );
}
