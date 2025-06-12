export interface User {
  id: string;
  email: string;
  password?: string; // Password should ideally not be stored or passed around like this
  name: string;
  role: 'admin' | 'user';
}

export interface Vale {
  id: number;
  userId: string;
  mes: string;
  ano: string;
  produto: string;
  data: string; // Store as ISO string e.g., "YYYY-MM-DD"
  valor: number;
  status: 'aberto' | 'baixado';
}

export type UserRole = 'admin' | 'user';

export const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
