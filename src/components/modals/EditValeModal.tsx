"use client";

import React, { useState, useEffect } from 'react';
import type { Vale } from '@/lib/definitions';
import { updateValeAction } from '@/lib/actions/vale.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MONTHS } from '@/lib/definitions';

interface EditValeModalProps {
  isOpen: boolean;
  onClose: () => void;
  vale: Vale | null;
  onValeUpdated: () => void; // Callback to refresh vales list
  employeeOptions: { value: string; label: string }[];
}

export default function EditValeModal({ isOpen, onClose, vale, onValeUpdated, employeeOptions }: EditValeModalProps) {
  const [userId, setUserId] = useState('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [produto, setProduto] = useState('');
  const [data, setData] = useState('');
  const [valor, setValor] = useState('');
  const [status, setStatus] = useState<'aberto' | 'baixado'>('aberto');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (vale) {
      setUserId(vale.userId);
      setMes(vale.mes);
      setAno(vale.ano);
      setProduto(vale.produto);
      setData(vale.data); // Assumes YYYY-MM-DD format
      setValor(vale.valor.toString().replace('.', ',')); // Format for input
      setStatus(vale.status);
    }
  }, [vale]);

  if (!vale) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('mes', mes);
    formData.append('ano', ano);
    formData.append('produto', produto);
    formData.append('data', data);
    formData.append('valor', valor);
    formData.append('status', status);

    const result = await updateValeAction(vale.id, formData);
    if (result.success) {
      toast({ title: "Sucesso", description: "Vale atualizado." });
      onValeUpdated();
      onClose();
    } else {
      toast({ variant: "destructive", title: "Erro", description: result.error });
    }
    setIsSubmitting(false);
  };
  
  const yearOptions = Array.from({length: 10}, (_, i) => (new Date().getFullYear() - 5 + i).toString()).reverse();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Vale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <div>
            <Label htmlFor="edit-vale-funcionario">Funcionário</Label>
            <Select value={userId} onValueChange={setUserId} required>
              <SelectTrigger id="edit-vale-funcionario">
                <SelectValue placeholder="Selecione um funcionário" />
              </SelectTrigger>
              <SelectContent>
                {employeeOptions.map(emp => (
                  <SelectItem key={emp.value} value={emp.value}>{emp.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-vale-mes">Mês</Label>
              <Select value={mes} onValueChange={setMes} required>
                <SelectTrigger id="edit-vale-mes"><SelectValue/></SelectTrigger>
                <SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-vale-ano">Ano</Label>
              <Select value={ano} onValueChange={setAno} required>
                <SelectTrigger id="edit-vale-ano"><SelectValue/></SelectTrigger>
                <SelectContent>{yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="edit-vale-produto">Nome do Produto</Label>
            <Input id="edit-vale-produto" value={produto} onChange={(e) => setProduto(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="edit-vale-data">Data</Label>
            <Input id="edit-vale-data" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="edit-vale-valor">Valor (R$)</Label>
            <Input id="edit-vale-valor" type="text" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" required />
          </div>
          <div>
            <Label htmlFor="edit-vale-status">Status</Label>
            <Select value={status} onValueChange={(value: 'aberto' | 'baixado') => setStatus(value)} required>
              <SelectTrigger id="edit-vale-status"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="aberto">Aberto</SelectItem>
                <SelectItem value="baixado">Baixado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="sm:justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
