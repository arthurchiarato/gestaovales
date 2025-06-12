"use server";

import { findUserByEmail } from "@/lib/data";
import { createSession, clearSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { User } from "../definitions";

interface ActionResult {
  success: boolean;
  error?: string;
  user?: User;
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const passwordInput = formData.get("password") as string;

  if (!email || !passwordInput) {
    return { success: false, error: "Email e senha são obrigatórios." };
  }

  const user = findUserByEmail(email);

  if (!user || user.password !== passwordInput) {
    return { success: false, error: "Email ou senha inválidos." };
  }

  // Do not include password in session or returned user object
  const { password, ...userWithoutPassword } = user;
  await createSession(userWithoutPassword);
  
  return { success: true, user: userWithoutPassword };
  // Client-side will handle redirect after context update
}

export async function logoutAction() {
  await clearSession();
  revalidatePath("/", "layout"); // Revalidate all paths to ensure session check
  redirect("/login");
}
