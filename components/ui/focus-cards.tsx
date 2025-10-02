"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Activity, Clock } from "lucide-react";

export const Card = React.memo(
  ({ 
    card,
    index,
    hovered,
    setHovered,
    onClick,
    onPing,
  }: { 
    card: any;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
    onClick?: () => void;
    onPing?: (e: React.MouseEvent) => void;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      onClick={onClick}
      className={cn(
        "rounded-2xl relative bg-gradient-to-br from-emerald-950/50 via-teal-950/50 to-cyan-950/50 overflow-hidden h-64 w-full transition-all duration-300 ease-out cursor-pointer border border-emerald-800/30 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/20",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />
      
      {/* Online Status Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className={cn(
          "w-3 h-3 rounded-full transition-all duration-300",
          card.isOnline === true ? "bg-emerald-400 shadow-lg shadow-emerald-400/50" :
          card.isOnline === false ? "bg-red-400 shadow-lg shadow-red-400/50" :
          "bg-slate-600"
        )} />
        {card.isOnline !== undefined && (
          <span className={cn(
            "text-xs font-medium",
            card.isOnline ? "text-emerald-400" : "text-red-400"
          )}>
            {card.isOnline ? "Online" : "Offline"}
          </span>
        )}
      </div>
      
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-between p-6 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-90"
        )}
      >
        <div className="flex justify-between items-start mt-8">
          <div className="flex-1">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-teal-300 mb-2">
              {card.title}
            </div>
            <div className="text-sm text-emerald-400/80 font-medium px-3 py-1 bg-emerald-500/10 rounded-full inline-block">
              {card.category}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-3 backdrop-blur-sm">
            <span className="text-xs text-slate-400">AnyDesk ID:</span>
            <code className="text-sm text-teal-300 font-mono flex-1">
              {card.anydeskId}
            </code>
          </div>
          
          {card.notes && (
            <div className="text-xs text-slate-300 line-clamp-2 bg-slate-900/30 rounded-lg p-2">
              {card.notes}
            </div>
          )}
          
          {card.lastPing && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
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
            className="w-full py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
          >
            <Activity className="w-4 h-4" />
            Ping Status
          </button>
        </div>
      </div>
      
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-emerald-600/10 via-transparent to-transparent transition-opacity duration-300",
        hovered === index ? "opacity-100" : "opacity-0"
      )} />
    </div>
  )
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
  onPing
}: { 
  cards: CardType[];
  onCardClick?: (card: CardType) => void;
  onPing?: (cardId: string, anydeskId: string) => void;
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
        />
      ))}
    </div>
  );
}
