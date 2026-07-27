import { useMemo } from 'react';
import type { Expense } from '../types';
import { updateExpense } from '../store';
import { IconCheckCircle, IconXCircle } from './Icons';

interface Props {
  expenses: Expense[];
}

export default function DebtTracker({ expenses }: Props) {
  const debts = useMemo(() => expenses.filter(e => e.deudores), [expenses]);
  const pending = debts.filter(e => e.devuelto !== 'yes');
  const repaid = debts.filter(e => e.devuelto === 'yes');

  const totalPending = pending.reduce((s, e) => s + e.ajeno, 0);
  const totalRepaid = repaid.reduce((s, e) => s + e.ajeno, 0);

  const toggle = (id: string) => {
    const e = expenses.find(x => x.id === id);
    if (!e) return;
    updateExpense(id, { devuelto: e.devuelto === 'yes' ? 'no' : 'yes' });
    window.location.reload();
  };

  const renderTable = (list: Expense[], showToggle: boolean) => (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Fecha</th><th>Descripcion</th><th>Deudores</th><th>Importe</th><th>Metodo</th><th>{showToggle ? '' : ''}</th></tr></thead>
        <tbody>
          {list.map(e => (
            <tr key={e.id}>
              <td>{e.date}</td>
              <td>{e.desc}</td>
              <td>{e.deudores}</td>
              <td className="td-amount">{e.ajeno.toFixed(2)} EUR</td>
              <td className="td-muted">{e.deudaMetodo}</td>
              <td>{showToggle && (
                <button className={`btn sm ${e.devuelto === 'yes' ? 'outline' : 'primary'}`} onClick={() => toggle(e.id)}>
                  {e.devuelto === 'yes' ? <IconXCircle size={14} /> : <IconCheckCircle size={14} />}
                  {e.devuelto === 'yes' ? ' Desmarcar' : ' Pagado'}
                </button>
              )}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="stats">
        <div className="stat"><div className="label">Pendientes</div><div className="value negative">{pending.length}</div></div>
        <div className="stat"><div className="label">Importe Pend.</div><div className="value negative">{totalPending.toFixed(2)} EUR</div></div>
        <div className="stat"><div className="label">Pagadas</div><div className="value positive">{repaid.length}</div></div>
        <div className="stat"><div className="label">Total Devuelto</div><div className="value positive">{totalRepaid.toFixed(2)} EUR</div></div>
      </div>
      <div className="card">
        <h3>Pendientes</h3>
        {pending.length === 0 ? <div className="empty">Todo pagado</div> : renderTable(pending, true)}
      </div>
      <div className="card">
        <h3>Pagadas</h3>
        {repaid.length === 0 ? <div className="empty">Ninguna aun</div> : renderTable(repaid, false)}
      </div>
    </>
  );
}
