
"use client";

import React, { useState, useEffect } from 'react';
import { addValeAction } from '@/lib/actions/vale.actions';
import { getUsersForSelectAction } from '@/lib/actions/user.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MONTHS } from '@/lib/definitions';
import { getCurrentDateString } from '@/lib/utils';
import { FilePlus } from 'lucide-react';

// Use a fixed year for initial SSR rendering of yearOptions to avoid hydration mismatch
const STATIC_INITIAL_YEAR = new Date().getFullYear(); // This is fine for a static initial value definition

export default function ValeManagement() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state: Initialize with non-dynamic defaults for SSR
  const [userId, setUserId] = useState('');
  const [mes, setMes] = useState<string>(MONTHS[0]); // Default to January
  const [ano, setAno] = useState<string>(STATIC_INITIAL_YEAR.toString()); // Default to a static year
  const [produto, setProduto] = useState('');
  const [data, setData] = useState<string>(''); // Default to empty string for date input
  const [valor, setValor] = useState('');
  const [status, setStatus] = useState<'aberto' | 'baixado'>('aberto');

  const [employeeOptions, setEmployeeOptions] = useState<{ value: string; label: string }[]>([]);
  // Initialize yearOptions with static values for SSR, update in useEffect for client
  const [yearOptions, setYearOptions] = useState<string[]>(() => 
    Array.from({length: 10}, (_, i) => (STATIC_INITIAL_YEAR - 5 + i).toString()).reverse()
  );

  // Effect for setting date-dependent initial values and dynamic yearOptions on client-side
  useEffect(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth();

    setMes(MONTHS[currentMonthIndex]);
    setAno(currentYear.toString());
    setData(getCurrentDateString()); // getCurrentDateString() uses new Date(), fine inside useEffect
    setYearOptions(Array.from({length: 10}, (_, i) => (currentYear - 5 + i).toString()).reverse());
  }, []); // Empty dependency array: runs once on mount, client-side

  // Effect for fetching employees
  useEffect(() => {
    async function fetchEmployees() {
      const result = await getUsersForSelectAction();
      if (result.success && result.users) {
        setEmployeeOptions(result.users);
      } else {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar a lista de funcionários." });
      }
    }
    fetchEmployees();
  }, [toast]); // Assuming toast dependency is intentional or benign
  
  const resetForm = () => {
    setUserId('');
    // Reset to client-side dynamic defaults after submission
    const currentDate = new Date();
    setMes(MONTHS[currentDate.getMonth()]);
    setAno(currentDate.getFullYear().toString());
    setProduto('');
    setData(getCurrentDateString());
    setValor('');
    setStatus('aberto');
  };

  const handleAddValeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) { // Basic client-side validation example
        toast({ variant: "destructive", title: "Campo Obrigatório", description: "Por favor, selecione um funcionário." });
        return;
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('mes', mes);
    formData.append('ano', ano);
    formData.append('produto', produto);
    formData.append('data', data);
    formData.append('valor', valor);
    formData.append('status', status);

    const result = await addValeAction(formData);
    if (result.success && result.vale) {
      toast({ title: "Sucesso", description: `Vale para ${result.vale.produto} adicionado.` });
      resetForm();
    } else {
      toast({ variant: "destructive", title: "Erro ao Adicionar Vale", description: result.error });
    }
    setIsSubmitting(false);
  };
  
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <FilePlus className="h-5 w-5" /> Cadastrar Novo Vale
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddValeSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <Label htmlFor="funcionario-select">Funcionário</Label>
            <Select value={userId} onValueChange={setUserId} required>
              <SelectTrigger id="funcionario-select">
                <SelectValue placeholder="Selecione um funcionário" />
              </SelectTrigger>
              <SelectContent>
                {employeeOptions.map(emp => (
                  <SelectItem key={emp.value} value={emp.value}>{emp.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="mes-select">Mês</Label>
              <Select value={mes} onValueChange={setMes} required>
                <SelectTrigger id="mes-select">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ano-select">Ano</Label>
               <Select value={ano} onValueChange={setAno} required>
                <SelectTrigger id="ano-select">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="produto-input">Nome do Produto</Label>
            <Input id="produto-input" type="text" value={produto} onChange={(e) => setProduto(e.target.value)} placeholder="Ex: Vale Alimentação" required />
          </div>

          <div>
            <Label htmlFor="data-input">Data</Label>
            <Input id="data-input" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="valor-input">Valor (R$)</Label>
            <Input id="valor-input" type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" required />
          </div>

          <div>
            <Label htmlFor="status-select">Status</Label>
            <Select value={status} onValueChange={(value: 'aberto' | 'baixado') => setStatus(value)} required>
              <SelectTrigger id="status-select">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aberto">Aberto</SelectItem>
                <SelectItem value="baixado">Baixado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar Vale'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
