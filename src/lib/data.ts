import type { User, Vale } from './definitions';

// Ensure this file is treated as a module
export {};

// Using global to persist data across hot reloads in development
declare global {
  var mockUsers: User[];
  var mockVales: Vale[];
}

global.mockUsers = global.mockUsers || [
  { id: 'admin', email: 'admin@empresa.com', password: 'admin123', name: 'Administrador', role: 'admin' },
  { id: 'user1', email: 'funcionario1@empresa.com', password: 'func123', name: 'Ana Silva', role: 'user' },
  { id: 'user2', email: 'funcionario2@empresa.com', password: 'func123', name: 'Carlos Santos', role: 'user' },
  { id: 'user3', email: 'funcionario3@empresa.com', password: 'func123', name: 'Mariana Oliveira', role: 'user' }
];

global.mockVales = global.mockVales || [
  { id: 1, userId: 'user1', mes: 'Janeiro', ano: '2023', produto: 'Vale Alimentação', data: '2023-01-05', valor: 500.00, status: 'baixado' },
  { id: 2, userId: 'user1', mes: 'Janeiro', ano: '2023', produto: 'Vale Transporte', data: '2023-01-05', valor: 200.00, status: 'baixado' },
  { id: 3, userId: 'user1', mes: 'Fevereiro', ano: '2023', produto: 'Vale Alimentação', data: '2023-02-05', valor: 500.00, status: 'baixado' },
  { id: 4, userId: 'user1', mes: 'Janeiro', ano: '2024', produto: 'Vale Alimentação', data: '2024-01-05', valor: 550.00, status: 'aberto' },
  { id: 5, userId: 'user2', mes: 'Janeiro', ano: '2023', produto: 'Vale Alimentação', data: '2023-01-05', valor: 500.00, status: 'baixado' },
  { id: 6, userId: 'user2', mes: 'Fevereiro', ano: '2023', produto: 'Vale Alimentação', data: '2023-02-05', valor: 500.00, status: 'baixado' },
  { id: 7, userId: 'user2', mes: 'Janeiro', ano: '2024', produto: 'Vale Alimentação', data: '2024-01-05', valor: 550.00, status: 'aberto' },
  { id: 8, userId: 'user3', mes: 'Janeiro', ano: '2023', produto: 'Vale Alimentação', data: '2023-01-05', valor: 500.00, status: 'baixado' },
  { id: 9, userId: 'user3', mes: 'Janeiro', ano: '2023', produto: 'Vale Refeição', data: '2023-01-05', valor: 350.00, status: 'baixado' },
  { id: 10, userId: 'user3', mes: 'Fevereiro', ano: '2023', produto: 'Vale Alimentação', data: '2023-02-05', valor: 500.00, status: 'baixado' },
  { id: 11, userId: 'user3', mes: 'Janeiro', ano: '2024', produto: 'Vale Alimentação', data: '2024-01-05', valor: 550.00, status: 'aberto' },
  { id: 12, userId: 'user3', mes: 'Janeiro', ano: '2024', produto: 'Vale Refeição', data: '2024-01-05', valor: 380.00, status: 'aberto' }
];


// --- User Data Access ---
export function findUserByEmail(email: string): User | undefined {
  return global.mockUsers.find(u => u.email === email);
}

export function findUserById(id: string): User | undefined {
  return global.mockUsers.find(u => u.id === id);
}

export function getAllUsers(): User[] {
  return global.mockUsers.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
}

export function createUser(userData: Omit<User, 'id'>): User {
  const newUser: User = { ...userData, id: `user${Date.now()}` };
  global.mockUsers.push(newUser);
  const { password, ...userWithoutPassword } = newUser; // Don't return password
  return userWithoutPassword;
}

export function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'email'>>): User | null {
  const userIndex = global.mockUsers.findIndex(u => u.id === id);
  if (userIndex === -1) return null;
  
  // Prevent email change
  const { email, ...restOfUpdates } = updates;
  
  global.mockUsers[userIndex] = { ...global.mockUsers[userIndex], ...restOfUpdates };
  const { password, ...updatedUserWithoutPassword } = global.mockUsers[userIndex];
  return updatedUserWithoutPassword;
}

export function deleteUser(id: string): boolean {
  const initialLength = global.mockUsers.length;
  global.mockUsers = global.mockUsers.filter(u => u.id !== id);
  // Also delete vales associated with this user
  global.mockVales = global.mockVales.filter(v => v.userId !== id);
  return global.mockUsers.length < initialLength;
}

// --- Vale Data Access ---
export function getVales(userId?: string, ano?: string, mes?: string): Vale[] {
  let filteredVales = [...global.mockVales];
  if (userId) {
    filteredVales = filteredVales.filter(v => v.userId === userId);
  }
  if (ano) {
    filteredVales = filteredVales.filter(v => v.ano === ano);
  }
  if (mes) {
    filteredVales = filteredVales.filter(v => v.mes === mes);
  }
  return filteredVales.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export function getValeById(id: number): Vale | undefined {
  return global.mockVales.find(v => v.id === id);
}

export function createVale(valeData: Omit<Vale, 'id'>): Vale {
  const newVale: Vale = { ...valeData, id: Date.now() };
  global.mockVales.push(newVale);
  return newVale;
}

export function updateVale(id: number, updates: Partial<Omit<Vale, 'id'>>): Vale | null {
  const valeIndex = global.mockVales.findIndex(v => v.id === id);
  if (valeIndex === -1) return null;
  global.mockVales[valeIndex] = { ...global.mockVales[valeIndex], ...updates };
  return global.mockVales[valeIndex];
}

export function deleteVale(id: number): boolean {
  const initialLength = global.mockVales.length;
  global.mockVales = global.mockVales.filter(v => v.id !== id);
  return global.mockVales.length < initialLength;
}

export function getAvailableYears(): string[] {
    const years = new Set(global.mockVales.map(v => v.ano));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
}
