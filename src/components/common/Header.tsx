"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

export default function Header() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return null; // Or a loading state, or redirect
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-card shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-2 sm:mb-0">
          <h1 className="text-xl sm:text-2xl font-bold text-primary font-headline">Sistema de Vales</h1>
        </div>
        <div className="flex flex-wrap items-center justify-center sm:justify-end space-x-2 sm:space-x-4">
          <span className="text-foreground font-medium text-sm sm:text-base">{currentUser.name}</span>
          <span className={`px-3 py-1 text-xs rounded-full font-medium ${currentUser.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400'}`}>
            {currentUser.role === 'admin' ? 'Administrador' : 'Funcionário'}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
