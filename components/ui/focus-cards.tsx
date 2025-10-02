"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export const Card = React.memo(
  ({ 
    card,
    index,
    hovered,
    setHovered,
    onClick,
  }: { 
    card: any;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
    onClick?: () => void;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      onClick={onClick}
      className={cn(
        "rounded-xl relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden h-60 w-full transition-all duration-300 ease-out cursor-pointer border border-slate-700/50 hover:border-blue-500/50",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-between p-6 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-90"
        )}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
              {card.title}
            </div>
            <div className="text-sm text-slate-400 font-medium">
              {card.category}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">AnyDesk ID:</span>
            <code className="text-sm text-blue-400 font-mono bg-slate-800/50 px-2 py-1 rounded">
              {card.anydeskId}
            </code>
          </div>
          
          {card.notes && (
            <div className="text-xs text-slate-400 line-clamp-2">
              {card.notes}
            </div>
          )}
        </div>
      </div>
      
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-transparent transition-opacity duration-300",
        hovered === index ? "opacity-100" : "opacity-0"
      )} />
    </div>
  )
);

Card.displayName = "Card";

type CardType = {
  title: string;
  anydeskId: string;
  category: string;
  notes?: string;
};

export function FocusCards({ 
  cards, 
  onCardClick 
}: { 
  cards: CardType[];
  onCardClick?: (card: CardType) => void;
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
        />
      ))}
    </div>
  );
}
