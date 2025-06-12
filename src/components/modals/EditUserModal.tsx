"use client";

import React, { useState, useEffect } from 'react';
import type { User, UserRole } from '@/lib/definitions';
import { updateUserAction } from '@/lib/actions/user.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void; // Callback to refresh user list
}

export default function EditUserModal({ isOpen, onClose, user, onUserUpdated }: EditUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Email is read-only in this form
  const [role, setRole] = useState<UserRole>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('role', role);
    // Email is not appended as it's not being updated here

    const result = await updateUserAction(user.id, formData);
    if (result.success) {
      toast({ title: "Sucesso", description: "Usuário atualizado." });
      onUserUpdated();
      onClose();
    } else {
      toast({ variant: "destructive", title: "Erro", description: result.error });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="edit-user-name">Nome Completo</Label>
            <Input id="edit-user-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="edit-user-email">Email (não editável)</Label>
            <Input id="edit-user-email" value={email} readOnly disabled />
          </div>
          <div>
            <Label htmlFor="edit-user-role">Tipo de Usuário</Label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)} disabled={user.id === 'admin'}>
              <SelectTrigger id="edit-user-role">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Funcionário</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
             {user.id === 'admin' && <p className="text-xs text-muted-foreground mt-1">O tipo do administrador principal não pode ser alterado.</p>}
          </div>
          <DialogFooter className="sm:justify-end gap-2">
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
