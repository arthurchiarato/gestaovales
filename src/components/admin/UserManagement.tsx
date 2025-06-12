"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/definitions';
import { getUsersAction, addUserAction, updateUserAction, deleteUserAction } from '@/lib/actions/user.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import EditUserModal from '@/components/modals/EditUserModal';
import ConfirmDeleteDialog from '@/components/modals/ConfirmDeleteDialog';
import { Edit2, Trash2, UserPlus } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form state for adding new user
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const result = await getUsersAction();
    if (result.success && result.users) {
      setUsers(result.users);
    } else {
      toast({ variant: "destructive", title: "Erro", description: result.error });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingUser(true);
    const formData = new FormData();
    formData.append('name', newUserName);
    formData.append('email', newUserEmail);
    formData.append('password', newUserPassword);
    formData.append('role', newUserRole);

    const result = await addUserAction(formData);
    if (result.success && result.user) {
      toast({ title: "Sucesso", description: `Usuário ${result.user.name} adicionado.` });
      fetchUsers(); // Refresh users list
      // Reset form
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('user');
    } else {
      toast({ variant: "destructive", title: "Erro ao Adicionar Usuário", description: result.error });
    }
    setIsSubmittingUser(false);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    const result = await deleteUserAction(userToDelete.id);
    if (result.success) {
      toast({ title: "Usuário Excluído", description: "O usuário foi excluído com sucesso." });
      fetchUsers(); // Refresh users list
    } else {
      toast({ variant: "destructive", title: "Erro", description: result.error });
    }
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> Cadastrar Novo Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUserSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="user-name-input">Nome Completo</Label>
              <Input id="user-name-input" type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Nome do funcionário" required />
            </div>
            <div>
              <Label htmlFor="user-email">Email</Label>
              <Input id="user-email" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="email@empresa.com" required />
            </div>
            <div>
              <Label htmlFor="user-password">Senha</Label>
              <Input id="user-password" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required />
            </div>
            <div>
              <Label htmlFor="user-role-select">Tipo de Usuário</Label>
              <Select value={newUserRole} onValueChange={(value: 'user' | 'admin') => setNewUserRole(value)}>
                <SelectTrigger id="user-role-select">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Funcionário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmittingUser}>
                {isSubmittingUser ? 'Cadastrando...' : 'Cadastrar Usuário'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando usuários...</p>
          ) : users.length === 0 ? (
            <p>Nenhum usuário cadastrado.</p>
          ) : (
            <div className="responsive-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role === 'admin' ? 'Administrador' : 'Funcionário'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} title="Editar Usuário">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user)} title="Excluir Usuário" disabled={user.id === 'admin' /* Basic protection for main admin */}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {userToEdit && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setUserToEdit(null); }}
          user={userToEdit}
          onUserUpdated={fetchUsers}
        />
      )}

      {userToDelete && (
        <ConfirmDeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Confirmar Exclusão de Usuário"
          description={`Tem certeza que deseja excluir o usuário "${userToDelete.name}"? Todos os vales associados também serão excluídos. Esta ação não pode ser desfeita.`}
        />
      )}
    </div>
  );
}
