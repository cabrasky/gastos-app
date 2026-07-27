export function getMonth(dateStr: string): number {
  return new Date(dateStr + 'T12:00:00').getMonth() + 1;
}

export interface Expense {
  id: string;
  date: string;
  desc: string;
  amount: number;
  proposito: string;
  metodo: string;
  motivo: string;
  tipo: string;
  ajeno: number;
  deudores: string;
  deudaMetodo: string;
  devuelto: 'yes' | 'no';
  meCorresponde: number;
  viaje: string;
  createdAt: string;
}

export interface Income {
  id: string;
  date: string;
  desc: string;
  amount: number;
  category: string;
  notes: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  notes: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
  nextBilling: string;
  category: string;
  metodo: string;
  active: boolean;
  notes: string;
  createdAt: string;
}

export interface AppData {
  expenses: Expense[];
  incomes: Income[];
  goals: Goal[];
  subscriptions: Subscription[];
}

export const REF = {
  propositos: ['Fijo', 'Puntual', 'Viajes', 'Nivel de Vida', 'Inversion'],
  metodos: ['Tarjeta', 'Bizum', 'Split App', 'Efectivo', 'Deposito', 'Online', 'Transferencia'],
  categorias: ['Ocio', 'Comida', 'Bebida', 'Transporte', 'Estancia', 'Ahorro/Inversion', 'Productos', 'Deporte/Ejercicio', 'Farmacia', 'Otros'],
  meses: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  billingCycles: ['weekly', 'monthly', 'quarterly', 'yearly'] as const,
  incomeCategories: ['Salario', 'Freelance', 'Inversion', 'Regalo', 'Venta', 'Devolucion', 'Otro'],
  goalCategories: ['Viaje', 'Compra', 'Emergencia', 'Inversion', 'Educacion', 'Salud', 'Otro'],
};
