"use client";

import { MONTHS } from "@/lib/definitions";
import { cn } from "@/lib/utils";

interface MonthTabsProps {
  activeMonth: string;
  onMonthChange: (newMonth: string) => void;
}

export default function MonthTabs({ activeMonth, onMonthChange }: MonthTabsProps) {
  return (
    <div className="bg-card rounded-t-lg shadow-md">
      <div className="border-b border-border">
        <div className="tabs-container">
          <div className="flex" role="tablist" aria-label="Seleção de Mês">
            {MONTHS.map((month) => (
              <button
                key={month}
                role="tab"
                aria-selected={month === activeMonth}
                onClick={() => onMonthChange(month)}
                className={cn(
                  "px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary focus:outline-none whitespace-nowrap relative transition-colors duration-150",
                  month === activeMonth && "text-primary font-semibold"
                )}
              >
                {month}
                {month === activeMonth && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
