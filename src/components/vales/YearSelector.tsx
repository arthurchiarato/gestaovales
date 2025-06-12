
"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface YearSelectorProps {
  currentYear: number;
  onYearChange: (newYear: number) => void;
  minSelectableYear: number;
  maxSelectableYear: number;
}

export default function YearSelector({ currentYear, onYearChange, minSelectableYear, maxSelectableYear }: YearSelectorProps) {

  const handlePrevYear = () => {
    if (currentYear > minSelectableYear) {
      onYearChange(currentYear - 1);
    }
  };

  const handleNextYear = () => {
    if (currentYear < maxSelectableYear) {
      onYearChange(currentYear + 1);
    }
  };

  return (
    <div className="mb-4 sm:mb-6">
      <div className="bg-card rounded-lg shadow-md p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-0">
            Selecione o Ano:
          </h2>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrevYear} 
              disabled={currentYear <= minSelectableYear}
              aria-label="Ano anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-md font-medium text-lg">
              {currentYear}
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNextYear} 
              disabled={currentYear >= maxSelectableYear}
              aria-label="Próximo ano"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
