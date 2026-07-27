import type { Expense, Income, Goal, Subscription, AppData } from './types';

const STORAGE_KEY = 'gastos_app_data';

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { expenses: [], incomes: [], goals: [], subscriptions: [] };
    return JSON.parse(raw) as AppData;
  } catch {
    return { expenses: [], incomes: [], goals: [], subscriptions: [] };
  }
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ===== EXPENSES ===== */
interface ExpenseInput {
  date: string; desc: string; amount: number;
  proposito?: string; metodo?: string; motivo?: string; tipo?: string;
  ajeno?: number; deudores?: string; deudaMetodo?: string;
  devuelto?: 'yes' | 'no'; meCorresponde?: number; viaje?: string;
}

export function addExpense(input: ExpenseInput): Expense {
  const data = loadData();
  const expense: Expense = {
    id: genId(), date: input.date, desc: input.desc, amount: input.amount,
    proposito: input.proposito || 'Fijo', metodo: input.metodo || 'Tarjeta',
    motivo: input.motivo || '', tipo: input.tipo || '', ajeno: input.ajeno || 0,
    deudores: input.deudores || '', deudaMetodo: input.deudaMetodo || 'Bizum',
    devuelto: input.devuelto || 'no', meCorresponde: input.meCorresponde || 0,
    viaje: input.viaje || '', createdAt: new Date().toISOString(),
  };
  data.expenses.push(expense);
  saveData(data);
  return expense;
}

export function updateExpense(id: string, updates: Partial<ExpenseInput>) {
  const data = loadData();
  const idx = data.expenses.findIndex(e => e.id === id);
  if (idx === -1) return;
  data.expenses[idx] = { ...data.expenses[idx], ...updates };
  saveData(data);
}

export function deleteExpense(id: string) {
  const data = loadData();
  data.expenses = data.expenses.filter(e => e.id !== id);
  saveData(data);
}

/* ===== INCOMES ===== */
interface IncomeInput {
  date: string; desc: string; amount: number;
  category?: string; notes?: string;
}

export function addIncome(input: IncomeInput): Income {
  const data = loadData();
  const income: Income = {
    id: genId(), date: input.date, desc: input.desc, amount: input.amount,
    category: input.category || 'Otro', notes: input.notes || '',
    createdAt: new Date().toISOString(),
  };
  data.incomes.push(income);
  saveData(data);
  return income;
}

export function updateIncome(id: string, updates: Partial<IncomeInput>) {
  const data = loadData();
  const idx = data.incomes.findIndex(i => i.id === id);
  if (idx === -1) return;
  data.incomes[idx] = { ...data.incomes[idx], ...updates };
  saveData(data);
}

export function deleteIncome(id: string) {
  const data = loadData();
  data.incomes = data.incomes.filter(i => i.id !== id);
  saveData(data);
}

/* ===== GOALS ===== */
interface GoalInput {
  name: string; targetAmount: number; currentAmount?: number;
  deadline?: string; category?: string; notes?: string;
}

export function addGoal(input: GoalInput): Goal {
  const data = loadData();
  const goal: Goal = {
    id: genId(), name: input.name, targetAmount: input.targetAmount,
    currentAmount: input.currentAmount || 0, deadline: input.deadline || '',
    category: input.category || '', notes: input.notes || '',
    createdAt: new Date().toISOString(),
  };
  data.goals.push(goal);
  saveData(data);
  return goal;
}

export function updateGoal(id: string, updates: Partial<GoalInput & { currentAmount?: number }>) {
  const data = loadData();
  const idx = data.goals.findIndex(g => g.id === id);
  if (idx === -1) return;
  data.goals[idx] = { ...data.goals[idx], ...updates };
  saveData(data);
}

export function deleteGoal(id: string) {
  const data = loadData();
  data.goals = data.goals.filter(g => g.id !== id);
  saveData(data);
}

/* ===== SUBSCRIPTIONS ===== */
interface SubscriptionInput {
  name: string; amount: number;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
  nextBilling: string; category?: string; metodo?: string;
  active?: boolean; notes?: string;
}

export function addSubscription(input: SubscriptionInput): Subscription {
  const data = loadData();
  const sub: Subscription = {
    id: genId(), name: input.name, amount: input.amount,
    billingCycle: input.billingCycle, nextBilling: input.nextBilling,
    category: input.category || '', metodo: input.metodo || 'Tarjeta',
    active: input.active ?? true, notes: input.notes || '',
    createdAt: new Date().toISOString(),
  };
  data.subscriptions.push(sub);
  saveData(data);
  return sub;
}

export function updateSubscription(id: string, updates: Partial<SubscriptionInput>) {
  const data = loadData();
  const idx = data.subscriptions.findIndex(s => s.id === id);
  if (idx === -1) return;
  data.subscriptions[idx] = { ...data.subscriptions[idx], ...updates };
  saveData(data);
}

export function deleteSubscription(id: string) {
  const data = loadData();
  data.subscriptions = data.subscriptions.filter(s => s.id !== id);
  saveData(data);
}

export function advanceSubscription(sub: Subscription): Subscription {
  const next = new Date(sub.nextBilling + 'T12:00:00');
  switch (sub.billingCycle) {
    case 'weekly': next.setDate(next.getDate() + 7); break;
    case 'monthly': next.setMonth(next.getMonth() + 1); break;
    case 'quarterly': next.setMonth(next.getMonth() + 3); break;
    case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
  }
  const updated = { ...sub, nextBilling: next.toISOString().slice(0, 10) };
  updateSubscription(sub.id, { nextBilling: updated.nextBilling });
  return updated;
}
