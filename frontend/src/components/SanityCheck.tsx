import { useMemo } from 'react';
import type { Expense } from '../types';
import { MOCK_EXPENSES, MOCK_INCOMES, MOCK_GOALS, MOCK_SUBSCRIPTIONS } from '../mockData';
import { IconCheckCircle, IconAlertTriangle, IconAlertCircle, IconInfo, IconRefresh } from './Icons';

interface Props {
  expenses: Expense[];
}

export default function SanityCheck({ expenses }: Props) {
  const checks = useMemo(() => {
    const list: { text: string; cls: 'ok' | 'warn' | 'err' }[] = [];
    const seen: Record<string, number> = {};

    expenses.forEach(e => {
      if (!e.date) list.push({ text: `"${e.desc}" sin fecha`, cls: 'err' });
      if (!e.amount) list.push({ text: `"${e.desc}" sin importe`, cls: 'warn' });
      if (e.ajeno && e.deudores && !e.deudaMetodo) list.push({ text: `"${e.desc}" tiene deudores pero no metodo de devolucion`, cls: 'warn' });
      if (e.ajeno && !e.deudores) list.push({ text: `"${e.desc}" tiene gasto ajeno pero no deudores`, cls: 'warn' });
      if (e.amount > 1000) list.push({ text: `Gasto alto: ${e.amount.toFixed(2)}EUR — "${e.desc}"`, cls: 'warn' });
      if (e.amount < 0) list.push({ text: `Importe negativo: "${e.desc}"`, cls: 'err' });

      const key = `${e.date}|${e.desc}|${e.amount}`;
      if (seen[key]) list.push({ text: `Posible duplicado: "${e.desc}" (${e.date})`, cls: 'warn' });
      seen[key] = (seen[key] || 0) + 1;
    });

    if (list.length === 0) list.push({ text: 'Todo correcto, sin incidencias', cls: 'ok' });
    return list;
  }, [expenses]);

  const counts = { ok: checks.filter(c => c.cls === 'ok').length, warn: checks.filter(c => c.cls === 'warn').length, err: checks.filter(c => c.cls === 'err').length };

  const loadTestData = () => {
    if (!confirm('Cargar datos de prueba?\n\nSe borraran los datos actuales y se crearan ~25 gastos,\n11 ingresos, 5 metas y 9 subscripciones de ejemplo.')) return;
    const data = { expenses: MOCK_EXPENSES, incomes: MOCK_INCOMES, goals: MOCK_GOALS, subscriptions: MOCK_SUBSCRIPTIONS };
    localStorage.setItem('gastos_app_data', JSON.stringify(data));
    window.location.reload();
  };

  const IconComponent = (cls: string) => {
    switch (cls) {
      case 'ok': return <IconCheckCircle size={16} className="icon-success" />;
      case 'warn': return <IconAlertTriangle size={16} className="icon-warning" />;
      case 'err': return <IconAlertCircle size={16} className="icon-danger" />;
      default: return <IconInfo size={16} />;
    }
  };

  return (
    <>
      <div className="stats">
        <div className="stat"><div className="label">Correcto</div><div className="value positive">{counts.ok}</div></div>
        <div className="stat"><div className="label">Avisos</div><div className="value warning">{counts.warn}</div></div>
        <div className="stat"><div className="label">Errores</div><div className="value negative">{counts.err}</div></div>
        <div className="stat"><div className="label">Total Gastos</div><div className="value primary">{expenses.length}</div></div>
      </div>
      <div className="card">
        <h3>Control de Calidad</h3>
        {checks.length === 0 ? (
          <div className="empty">
            <IconCheckCircle size={24} className="icon-success" />
            <p>Sin incidencias</p>
          </div>
        ) : (
          <ul className="sanity-list">
            {checks.map((c, i) => (
              <li key={i} className={`sanity-item sanity-${c.cls}`}>
                {IconComponent(c.cls)}
                <span>{c.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card">
        <div className="card-header">
          <h3>Datos de Prueba</h3>
          <button className="btn sm outline" onClick={loadTestData} title="Cargar datos mock">
            <IconRefresh size={14} /> Cargar
          </button>
        </div>
        <p style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
          Carga ~25 gastos, 11 ingresos, 5 metas de ahorro y 9 subscripciones
          para probar todas las funciones de la app.
          <br /><strong style={{ color: 'var(--danger)' }}>Esto sobrescribira todos tus datos actuales.</strong>
        </p>
      </div>
    </>
  );
}
