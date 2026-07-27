import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { loadData, deleteExpense } from './store';
import AddExpense from './components/AddExpense';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import IncomesPage from './components/Incomes';
import GoalsPage from './components/Goals';
import MoreMenu from './components/MoreMenu';
import MonthlySummary from './components/MonthlySummary';
import WeeklyBudget from './components/WeeklyBudget';
import DebtTracker from './components/DebtTracker';
import SanityCheck from './components/SanityCheck';
import SubscriptionsPage from './components/Subscriptions';
import DesktopLayout from './components/DesktopLayout';
import MobileLayout from './components/MobileLayout';
import { MonthlyChart, CashFlowChart, BalanceEvolution, IncomeExpenseComparison, SankeyChart } from './components/Charts';
import './App.css';

function getSavedLayout(): 'desktop' | 'mobile' {
  const v = localStorage.getItem('gastos_layout');
  if (v === 'mobile' || v === 'desktop') return v;
  return window.innerWidth < 768 ? 'mobile' : 'desktop';
}

function MonthlyCharts({ expenses, incomes }: { expenses: any[]; incomes: any[] }) {
  return (
    <>
      <CashFlowChart expenses={expenses} incomes={incomes} />
      <SankeyChart expenses={expenses} incomes={incomes} />
      <BalanceEvolution expenses={expenses} incomes={incomes} />
      <MonthlyChart expenses={expenses} />
      <MonthlySummary expenses={expenses} />
      <IncomeExpenseComparison expenses={expenses} incomes={incomes} />
    </>
  );
}

export default function App() {
  const [layout, setLayout] = useState<'desktop' | 'mobile'>(getSavedLayout);
  const [data, setData] = useState(() => loadData());
  const [editId, setEditId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('gastos_dark') === 'true');
  const [weeklyGoal, setWeeklyGoal] = useState(() => Number(localStorage.getItem('gastos_goal')) || 50);

  useEffect(() => { localStorage.setItem('gastos_layout', layout); }, [layout]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('gastos_dark', dark ? 'true' : 'false');
  }, [dark]);
  useEffect(() => { localStorage.setItem('gastos_goal', String(weeklyGoal)); }, [weeklyGoal]);

  const refresh = useCallback(() => { setData(loadData()); setEditId(null); }, []);

  const handleDelete = (id: string) => {
    if (!confirm('Eliminar este gasto?')) return;
    deleteExpense(id);
    refresh();
  };

  const handleEdit = (id: string) => { setEditId(id); setShowAddModal(true); };
  const handleCloseAdd = () => { setShowAddModal(false); setEditId(null); };
  const handleSave = () => { refresh(); setShowAddModal(false); setEditId(null); };

  const handleExportCSV = () => {
    const now = new Date();
    const headers = ['Fecha','Descripcion','Importe','Proposito','Motivo','Tipo','Metodo','Gasto Ajeno','Deudores','Metodo Devolucion','Devuelto','Me Corresponde','Viaje'];
    const rows = [headers];
    data.expenses.forEach((e: any) => {
      rows.push([e.date, e.desc, String(e.amount), e.proposito, e.motivo, e.tipo, e.metodo, String(e.ajeno), e.deudores, e.deudaMetodo, e.devuelto, String(e.meCorresponde), e.viaje]);
    });
    const csv = rows.map(r => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `gastos_${now.getFullYear()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `gastos_${new Date().getFullYear()}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const editExpense = editId ? data.expenses.find((e: any) => e.id === editId) || null : null;

  const sharedLayoutProps = {
    dark, onToggleDark: () => setDark((d: boolean) => !d),
    onExportCSV: handleExportCSV, onExportJSON: handleExportJSON,
    layout, onLayoutChange: setLayout,
  };

  const routes = (
    <Routes>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={
        <Dashboard expenses={data.expenses} incomes={data.incomes} goals={data.goals} subscriptions={data.subscriptions} />
      } />
      <Route path="/expenses" element={
        <ExpenseList expenses={data.expenses} onEdit={handleEdit} onDelete={handleDelete} />
      } />
      <Route path="/incomes" element={
        <IncomesPage incomes={data.incomes} onRefresh={refresh} />
      } />
      <Route path="/goals" element={
        <GoalsPage goals={data.goals} onRefresh={refresh} />
      } />
      <Route path="/subs" element={
        <SubscriptionsPage subscriptions={data.subscriptions} onRefresh={refresh} />
      } />
      <Route path="/more" element={<MoreMenu />} />
      <Route path="/more/monthly" element={
        <MonthlyCharts expenses={data.expenses} incomes={data.incomes} />
      } />
      <Route path="/more/weekly" element={
        <WeeklyBudget expenses={data.expenses} weeklyGoal={weeklyGoal} onGoalChange={setWeeklyGoal} />
      } />
      <Route path="/more/debts" element={
        <DebtTracker expenses={data.expenses} />
      } />
      <Route path="/more/subs" element={
        <SubscriptionsPage subscriptions={data.subscriptions} onRefresh={refresh} />
      } />
      <Route path="/more/sanity" element={
        <SanityCheck expenses={data.expenses} />
      } />
    </Routes>
  );

  if (layout === 'desktop') {
    return (
      <DesktopLayout
        expenses={data.expenses}
        onAddClick={() => { setEditId(null); setShowAddModal(true); }}
        {...sharedLayoutProps}
      >
        {routes}
        <AddExpense isOpen={showAddModal} editExpense={editExpense} onClose={handleCloseAdd} onSaved={handleSave} />
      </DesktopLayout>
    );
  }

  return (
    <>
      <MobileLayout
        onAddClick={() => { setEditId(null); setShowAddModal(true); }}
        {...sharedLayoutProps}
      >
        {routes}
      </MobileLayout>
      <AddExpense isOpen={showAddModal} editExpense={editExpense} onClose={handleCloseAdd} onSaved={handleSave} />
    </>
  );
}
