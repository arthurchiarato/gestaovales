"use server";

import { createUser, getAllUsers, updateUser as updateUserData, deleteUser as deleteUserData, findUserById, findUserByEmail } from "@/lib/data";
import type { User, UserRole } from "@/lib/definitions";
import { revalidatePath } from "next/cache";

interface UserActionResult {
  success: boolean;
  error?: string;
  user?: User;
  users?: User[];
}

export async function getUsersAction(): Promise<UserActionResult> {
  try {
    const users = getAllUsers();
    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Falha ao buscar usuários." };
  }
}

export async function getUsersForSelectAction(): Promise<{ success: boolean; users?: { value: string; label: string }[], error?: string }> {
  try {
    const users = getAllUsers().filter(u => u.role === 'user');
    return { success: true, users: users.map(u => ({ value: u.id, label: u.name })) };
  } catch (error) {
    console.error("Error fetching users for select:", error);
    return { success: false, error: "Falha ao buscar funcionários." };
  }
}


export async function addUserAction(formData: FormData): Promise<UserActionResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as UserRole;

  if (!name || !email || !password || !role) {
    return { success: false, error: "Todos os campos são obrigatórios." };
  }
  if (password.length < 6) {
     return { success: false, error: "A senha deve ter pelo menos 6 caracteres." };
  }

  const existingUser = findUserByEmail(email);
  if (existingUser) {
    return { success: false, error: "Este email já está cadastrado." };
  }
  
  try {
    const newUser = createUser({ name, email, password, role });
    revalidatePath("/dashboard"); // Revalidate to update users list
    return { success: true, user: newUser };
  } catch (error) {
    console.error("Error adding user:", error);
    return { success: false, error: "Falha ao adicionar usuário." };
  }
}

export async function updateUserAction(userId: string, formData: FormData): Promise<UserActionResult> {
  const name = formData.get("name") as string;
  // const email = formData.get("email") as string; // Email should not be updatable this way easily
  const role = formData.get("role") as UserRole;

  if (!name || !role) {
    return { success: false, error: "Nome e tipo de usuário são obrigatórios." };
  }
  
  const userToUpdate = findUserById(userId);
  if (!userToUpdate) {
    return { success: false, error: "Usuário não encontrado." };
  }

  // Prevent admin from demoting self if they are the only admin
  if (userToUpdate.role === 'admin' && role === 'user') {
    const allUsers = getAllUsers();
    const adminCount = allUsers.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      return { success: false, error: "Não é possível remover o último administrador." };
    }
  }

  try {
    const updatedUser = updateUserData(userId, { name, role });
    if (!updatedUser) {
      return { success: false, error: "Falha ao atualizar usuário." };
    }
    revalidatePath("/dashboard");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Falha ao atualizar usuário." };
  }
}

export async function deleteUserAction(userId: string): Promise<Omit<UserActionResult, 'user' | 'users'>> {
  if (userId === 'admin') { // Assuming 'admin' is a special ID for the main admin
    return { success: false, error: "Não é possível excluir o usuário administrador principal." };
  }
  
  // Prevent deletion if it's the last admin
  const userToDelete = findUserById(userId);
  if (userToDelete?.role === 'admin') {
    const allUsers = getAllUsers();
    const adminCount = allUsers.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      return { success: false, error: "Não é possível excluir o último administrador." };
    }
  }

  try {
    const success = deleteUserData(userId);
    if (!success) {
      return { success: false, error: "Usuário não encontrado para exclusão." };
    }
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Falha ao excluir usuário." };
  }
}
