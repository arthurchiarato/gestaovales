
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Vale, User } from '@/lib/definitions';
import { getValesAction, toggleValeStatusAction, deleteValeAction } from '@/lib/actions/vale.actions';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import EditValeModal from '@/components/modals/EditValeModal';
import ConfirmDeleteDialog from '@/components/modals/ConfirmDeleteDialog';
import { getUsersForSelectAction } from '@/lib/actions/user.actions';
import { cn } from "@/lib/utils";

interface ValesDisplayProps {
  year: string;
  month: string;
  currentUser: User; // Assuming DashboardPage ensures this is non-null
}

export default function ValesDisplay({ year, month, currentUser }: ValesDisplayProps) {
  const [vales, setVales] = useState<Vale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalVales, setTotalVales] = useState(0);
  const { toast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [valeToEdit, setValeToEdit] = useState<Vale | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [valeToDelete, setValeToDelete] = useState<Vale | null>(null);
  
  const [employeeOptions, setEmployeeOptions] = useState<{ value: string; label: string }[]>([]);

  const fetchValesData = useCallback(async (isMountedCheck: () => boolean) => {
    if (!currentUser) { // Defensive check, though parent should ensure currentUser is valid
      setIsLoading(false);
      setVales([]);
      setTotalVales(0);
      return;
    }
    setIsLoading(true);
    try {
      const result = await getValesAction({
        userId: currentUser.role === 'admin' ? undefined : currentUser.id,
        ano: year,
        mes: month,
      });

      if (!isMountedCheck()) return;

      if (result.success && result.vales) {
        setVales(result.vales);
        setTotalVales(result.vales.reduce((sum, vale) => sum + vale.valor, 0));
      } else {
        setVales([]);
        setTotalVales(0);
        // Consider if toast is desired for non-critical "no vales found"
        // toast({ variant: "destructive", title: "Erro ao buscar vales", description: result.error });
      }
    } catch (error) {
      if (!isMountedCheck()) return;
      toast({ variant: "destructive", title: "Erro de Conexão", description: "Não foi possível buscar os vales." });
      setVales([]);
      setTotalVales(0);
    } finally {
      if (isMountedCheck()) {
        setIsLoading(false);
      }
    }
  }, [year, month, currentUser, toast]);

  useEffect(() => {
    let isMounted = true;
    const isMountedCheck = () => isMounted;
    
    fetchValesData(isMountedCheck);

    return () => {
      isMounted = false;
    };
  }, [fetchValesData]);

  useEffect(() => {
    let isMounted = true;
    if (currentUser?.role === 'admin') {
      const fetchEmployees = async () => {
        const usersResult = await getUsersForSelectAction();
        if (!isMounted) return;
        if (usersResult.success && usersResult.users) {
          setEmployeeOptions(usersResult.users);
        }
      };
      fetchEmployees();
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser?.role]);


  const handleToggleStatus = async (valeId: number) => {
    const result = await toggleValeStatusAction(valeId);
    if (result.success && result.vale) {
      toast({ title: "Status Alterado", description: `Status do vale atualizado para ${result.vale.status}.` });
      fetchValesData(() => true); // Re-fetch, assume component is still mounted for this action
    } else {
      toast({ variant: "destructive", title: "Erro", description: result.error });
    }
  };

  const handleEditVale = (vale: Vale) => {
    setValeToEdit(vale);
    setIsEditModalOpen(true);
  };

  const handleDeleteVale = (vale: Vale) => {
    setValeToDelete(vale);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!valeToDelete) return;
    const result = await deleteValeAction(valeToDelete.id);
    if (result.success) {
      toast({ title: "Vale Excluído", description: "O vale foi excluído com sucesso." });
      fetchValesData(() => true); // Re-fetch
    } else {
      toast({ variant: "destructive", title: "Erro", description: result.error });
    }
    setIsDeleteDialogOpen(false);
    setValeToDelete(null);
  };

  if (isLoading) {
    return <div className="text-center py-6 sm:py-8 text-muted-foreground p-4">Carregando vales...</div>;
  }

  return (
    <Card className="mt-[-1px] rounded-t-none shadow-md">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4">
        <CardTitle className="text-lg sm:text-xl mb-2 sm:mb-0">Vales de {month}/{year}</CardTitle>
        {vales.length > 0 && (
          <div className="text-right">
            <span className="text-foreground font-semibold text-lg">{formatCurrency(totalVales)}</span>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {vales.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            Nenhum vale encontrado para {month}/{year}.
          </div>
        ) : (
          <div className="responsive-table">
            <Table>
              <TableHeader>
                <TableRow>
                  {currentUser?.role === 'admin' && <TableHead>Funcionário</TableHead>}
                  <TableHead>Produto</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  {currentUser?.role === 'admin' && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {vales.map((vale) => (
                  <TableRow key={vale.id}>
                    {currentUser?.role === 'admin' && (
                      <TableCell className="font-medium">
                        {employeeOptions.find(e => e.value === vale.userId)?.label || vale.userId}
                      </TableCell>
                    )}
                    <TableCell>{vale.produto}</TableCell>
                    <TableCell>{formatDate(vale.data)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(vale.valor)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={vale.status === 'aberto' ? 'destructive' : 'default'} 
                             className={cn(vale.status === 'aberto' ? 'status-aberto' : 'status-baixado', currentUser?.role === 'admin' && "cursor-pointer")}
                             onClick={currentUser?.role === 'admin' ? () => handleToggleStatus(vale.id) : undefined}
                             title={currentUser?.role === 'admin' ? "Clique para mudar status" : ""}
                      >
                        {vale.status === 'aberto' ? 'Aberto' : 'Baixado'}
                      </Badge>
                    </TableCell>
                    {currentUser?.role === 'admin' && (
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                           <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(vale.id)} title="Mudar Status">
                            {vale.status === 'aberto' ? <XCircle className="h-4 w-4 text-red-500"/> : <CheckCircle className="h-4 w-4 text-green-500"/>}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditVale(vale)} title="Editar Vale">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteVale(vale)} title="Excluir Vale">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {valeToEdit && currentUser?.role === 'admin' && ( // Ensure modal only renders for admin
        <EditValeModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setValeToEdit(null); }}
          vale={valeToEdit}
          onValeUpdated={() => fetchValesData(() => true)} // Re-fetch
          employeeOptions={employeeOptions}
        />
      )}

      {valeToDelete && (
         <ConfirmDeleteDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={confirmDelete}
            title="Confirmar Exclusão de Vale"
            description={`Tem certeza que deseja excluir o vale "${valeToDelete.produto}"? Esta ação não pode ser desfeita.`}
          />
      )}
    </Card>
  );
}
