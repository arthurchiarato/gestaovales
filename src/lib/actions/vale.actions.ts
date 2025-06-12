"use server";

import { createVale, getVales, updateVale as updateValeData, deleteVale as deleteValeData, getValeById } from "@/lib/data";
import type { Vale } from "@/lib/definitions";
import { revalidatePath } from "next/cache";

interface ValeActionResult {
  success: boolean;
  error?: string;
  vale?: Vale;
  vales?: Vale[];
}

interface GetValesParams {
  userId?: string;
  ano?: string;
  mes?: string;
}

export async function getValesAction(params: GetValesParams): Promise<ValeActionResult> {
  try {
    const vales = getVales(params.userId, params.ano, params.mes);
    return { success: true, vales };
  } catch (error) {
    console.error("Error fetching vales:", error);
    return { success: false, error: "Falha ao buscar vales." };
  }
}

export async function addValeAction(formData: FormData): Promise<ValeActionResult> {
  const userId = formData.get("userId") as string;
  const mes = formData.get("mes") as string;
  const ano = formData.get("ano") as string;
  const produto = formData.get("produto") as string;
  const data = formData.get("data") as string; // Expecting YYYY-MM-DD
  const valorString = formData.get("valor") as string;
  const status = formData.get("status") as 'aberto' | 'baixado';

  if (!userId || !mes || !ano || !produto || !data || !valorString || !status) {
    return { success: false, error: "Todos os campos são obrigatórios." };
  }
  
  const valor = parseFloat(valorString.replace(',', '.'));
  if (isNaN(valor) || valor <= 0) {
    return { success: false, error: "Valor inválido." };
  }

  try {
    const newVale = createVale({ userId, mes, ano, produto, data, valor, status });
    revalidatePath("/dashboard"); // Revalidate to update vales list
    return { success: true, vale: newVale };
  } catch (error) {
    console.error("Error adding vale:", error);
    return { success: false, error: "Falha ao adicionar vale." };
  }
}

export async function updateValeAction(valeId: number, formData: FormData): Promise<ValeActionResult> {
  const userId = formData.get("userId") as string;
  const mes = formData.get("mes") as string;
  const ano = formData.get("ano") as string;
  const produto = formData.get("produto") as string;
  const data = formData.get("data") as string;
  const valorString = formData.get("valor") as string;
  const status = formData.get("status") as 'aberto' | 'baixado';

  if (!userId || !mes || !ano || !produto || !data || !valorString || !status) {
    return { success: false, error: "Todos os campos são obrigatórios." };
  }
  
  const valor = parseFloat(valorString.replace(',', '.'));
   if (isNaN(valor) || valor <= 0) {
    return { success: false, error: "Valor inválido." };
  }

  try {
    const updatedVale = updateValeData(valeId, { userId, mes, ano, produto, data, valor, status });
    if (!updatedVale) {
      return { success: false, error: "Vale não encontrado para atualização." };
    }
    revalidatePath("/dashboard");
    return { success: true, vale: updatedVale };
  } catch (error) {
    console.error("Error updating vale:", error);
    return { success: false, error: "Falha ao atualizar vale." };
  }
}

export async function deleteValeAction(valeId: number): Promise<Omit<ValeActionResult, 'vale' | 'vales'>> {
  try {
    const success = deleteValeData(valeId);
    if (!success) {
      return { success: false, error: "Vale não encontrado para exclusão." };
    }
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting vale:", error);
    return { success: false, error: "Falha ao excluir vale." };
  }
}

export async function toggleValeStatusAction(valeId: number): Promise<ValeActionResult> {
  try {
    const vale = getValeById(valeId);
    if (!vale) {
      return { success: false, error: "Vale não encontrado." };
    }
    const newStatus = vale.status === 'aberto' ? 'baixado' : 'aberto';
    const updatedVale = updateValeData(valeId, { status: newStatus });
    if (!updatedVale) {
      return { success: false, error: "Falha ao atualizar status do vale." };
    }
    revalidatePath("/dashboard");
    return { success: true, vale: updatedVale };
  } catch (error) {
    console.error("Error toggling vale status:", error);
    return { success: false, error: "Falha ao alterar status do vale." };
  }
}
