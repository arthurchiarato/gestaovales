"use client"; // This layout can be client-side to use AuthContext

import Header from "@/components/common/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-xl text-foreground">Carregando sua sessão...</p>
        {/* You can add a spinner here */}
      </div>
    );
  }

  if (!currentUser) {
     // This will be briefly shown before redirect effect kicks in
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <p className="text-xl text-foreground">Redirecionando para o login...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
