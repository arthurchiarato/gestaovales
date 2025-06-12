"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { loginAction } from "@/lib/actions/auth.actions";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login, currentUser, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading && currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, authIsLoading, router]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await loginAction(formData);

    setIsLoading(false);

    if (result.success && result.user) {
      toast({ title: "Login bem-sucedido!", description: `Bem-vindo, ${result.user.name}!` });
      login(result.user); // Update AuthContext
    } else {
      setError(result.error || "Falha no login. Verifique suas credenciais.");
      toast({ variant: "destructive", title: "Erro no Login", description: result.error || "Email ou senha incorretos." });
    }
  };
  
  if (authIsLoading || (!authIsLoading && currentUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center login-bg p-4">
        <p className="text-white text-xl">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center login-bg p-4">
      <div className="bg-card rounded-xl shadow-xl p-6 sm:p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-headline">Sistema de Vales</h1>
          <p className="text-muted-foreground mt-2">Faça login para acessar seus vales</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-1">Email</Label>
            <Input 
              id="login-email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full" 
              placeholder="seu.email@empresa.com" 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="login-password" className="block text-sm font-medium text-foreground mb-1">Senha</Label>
            <Input 
              id="login-password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full" 
              placeholder="••••••••" 
              required 
            />
          </div>
          
          {error && (
            <div className="text-destructive text-sm text-center">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
          <p>Demonstração: Use admin@empresa.com / admin123 para acesso de administrador</p>
          <p className="mt-1">Ou funcionario1@empresa.com / func123 para acesso de funcionário</p>
        </div>
      </div>
    </div>
  );
}
