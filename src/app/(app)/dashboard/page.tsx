
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import YearSelector from '@/components/vales/YearSelector';
import MonthTabs from '@/components/vales/MonthTabs';
import ValesDisplay from '@/components/vales/ValesDisplay';
import AdminPanel from '@/components/admin/AdminPanel';
import { getAvailableYearsAction } from '@/lib/actions/config.actions';
import { MONTHS } from '@/lib/definitions';

export default function DashboardPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [yearSelectorRange, setYearSelectorRange] = useState<{min: number, max: number} | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchInitialData() {
      const yearsResult = await getAvailableYearsAction();
      if (!isMounted) return;

      setAvailableYears(yearsResult);

      let yearToSet: number;
      let monthToSet: string;
      let minYearForSelector: number;
      let maxYearForSelector: number;
      const clientCurrentDate = new Date(); 
      const clientCurrentYear = clientCurrentDate.getFullYear();
      const clientCurrentMonth = clientCurrentDate.getMonth();

      if (yearsResult.length > 0) {
        const numericYears = yearsResult.map(y => parseInt(y));
        yearToSet = Math.max(...numericYears);
        minYearForSelector = Math.min(...numericYears);
        maxYearForSelector = Math.max(...numericYears);
        
        if (yearToSet === clientCurrentYear) {
          monthToSet = MONTHS[clientCurrentMonth];
        } else {
          monthToSet = MONTHS[0]; 
        }
      } else {
        yearToSet = clientCurrentYear;
        monthToSet = MONTHS[clientCurrentMonth];
        minYearForSelector = clientCurrentYear - 5;
        maxYearForSelector = clientCurrentYear + 5;
      }
      
      if (!isMounted) return;
      setActiveYear(yearToSet);
      setActiveMonth(monthToSet);
      setYearSelectorRange({ min: minYearForSelector, max: maxYearForSelector });
      setInitialDataLoaded(true);
    }
    
    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleYearChange = (newYear: number) => {
    setActiveYear(newYear);
  };

  const handleMonthChange = (newMonth: string) => {
    setActiveMonth(newMonth);
  };

  const memoizedAdminPanel = useMemo(() => {
    if (currentUser?.role === 'admin') {
      return <AdminPanel />;
    }
    return null;
  }, [currentUser?.role]);

  if (authLoading || !initialDataLoaded || activeYear === null || activeMonth === null || yearSelectorRange === null) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-xl">Carregando dados...</p>
      </div>
    );
  }

  if (!currentUser) {
    return null; 
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {memoizedAdminPanel}
      
      <YearSelector 
        currentYear={activeYear} 
        onYearChange={handleYearChange}
        minSelectableYear={yearSelectorRange.min}
        maxSelectableYear={yearSelectorRange.max}
      />
      
      <MonthTabs 
        activeMonth={activeMonth} 
        onMonthChange={handleMonthChange} 
      />
      
      <ValesDisplay 
        year={activeYear.toString()} 
        month={activeMonth}
        currentUser={currentUser} 
      />
    </div>
  );
}
