import { useState, useEffect } from 'react';
import { REF } from '../types';
import { addExpense, updateExpense } from '../store';
import type { Expense } from '../types';

interface Props {
  isOpen: boolean;
  editExpense?: Expense | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddExpense({ isOpen, editExpense, onClose, onSaved }: Props) {
  const isEdit = !!editExpense;
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState(0);
  const [proposito, setProposito] = useState('Fijo');
  const [metodo, setMetodo] = useState('Tarjeta');
  const [motivo, setMotivo] = useState('');
  const [tipo, setTipo] = useState('');
  const [ajeno, setAjeno] = useState(0);
  const [deudores, setDeudores] = useState('');
  const [deudaMetodo, setDeudaMetodo] = useState('Bizum');
  const [devuelto, setDevuelto] = useState<'yes' | 'no'>('no');
  const [meCorresponde, setMeCorresponde] = useState(0);
  const [viaje, setViaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editExpense) {
      setDate(editExpense.date);
      setDesc(editExpense.desc);
      setAmount(editExpense.amount);
      setProposito(editExpense.proposito);
      setMetodo(editExpense.metodo);
      setMotivo(editExpense.motivo);
      setTipo(editExpense.tipo);
      setAjeno(editExpense.ajeno);
      setDeudores(editExpense.deudores);
      setDeudaMetodo(editExpense.deudaMetodo);
      setDevuelto(editExpense.devuelto);
      setMeCorresponde(editExpense.meCorresponde);
      setViaje(editExpense.viaje);
    } else {
      setDate(today);
      setDesc('');
      setAmount(0);
      setProposito('Fijo');
      setMetodo('Tarjeta');
      setMotivo('');
      setTipo('');
      setAjeno(0);
      setDeudores('');
      setDeudaMetodo('Bizum');
      setDevuelto('no');
      setMeCorresponde(0);
      setViaje('');
    }
    setError('');
  }, [editExpense, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!desc.trim()) { setError('La descripcion es obligatoria'); return; }
    if (!amount) { setError('El importe es obligatorio'); return; }

    const data = { date, desc: desc.trim(), amount, proposito, metodo, motivo: motivo.trim(), tipo: tipo.trim(), ajeno, deudores: deudores.trim(), deudaMetodo, devuelto, meCorresponde, viaje: viaje.trim() };

    if (isEdit && editExpense) {
      updateExpense(editExpense.id, data);
    } else {
      addExpense(data);
    }
    onSaved();
  };

  const quickFill = (cat: string) => setMotivo(cat);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${isEdit ? 'modal-edit' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Editar Gasto' : 'Nuevo Gasto'}</h2>
          <button className="modal-close" onClick={onClose} type="button" title="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row three">
            <div className="form-group">
              <label>Fecha</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Importe (EUR)</label>
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(Number(e.target.value))} placeholder="0.00" autoFocus={!isEdit} />
            </div>
            <div className="form-group">
              <label>Proposito</label>
              <select value={proposito} onChange={e => setProposito(e.target.value)}>
                {REF.propositos.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 10 }}>
            <label>Descripcion</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="En que te gastaste el dinero?" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Motivo / Categoria</label>
              <input type="text" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ej: Ocio, Comida..." />
              <div className="quick-tags">
                {REF.categorias.slice(0, 6).map(c => (
                  <button key={c} type="button" className="btn-tiny" onClick={() => quickFill(c)}>{c}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Metodo de pago</label>
              <select value={metodo} onChange={e => setMetodo(e.target.value)}>
                {REF.metodos.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <details className="modal-details">
            <summary>Gasto compartido / Deuda</summary>
            <div className="form-row three" style={{ marginTop: 8 }}>
              <div className="form-group">
                <label>Gasto ajeno (EUR)</label>
                <input type="number" step="0.01" value={ajeno} onChange={e => setAjeno(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Deudores</label>
                <input type="text" value={deudores} onChange={e => setDeudores(e.target.value)} placeholder="Quien debe?" />
              </div>
              <div className="form-group">
                <label>Metodo devolucion</label>
                <select value={deudaMetodo} onChange={e => setDeudaMetodo(e.target.value)}>
                  {REF.metodos.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row three">
              <div className="form-group">
                <label>Devuelto</label>
                <select value={devuelto} onChange={e => setDevuelto(e.target.value as 'yes' | 'no')}>
                  <option value="no">No</option>
                  <option value="yes">Si</option>
                </select>
              </div>
              <div className="form-group">
                <label>Me corresponde (EUR)</label>
                <input type="number" step="0.01" value={meCorresponde} onChange={e => setMeCorresponde(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Viaje</label>
                <input type="text" value={viaje} onChange={e => setViaje(e.target.value)} placeholder="Nombre del viaje" />
              </div>
            </div>
          </details>

          {error && <p style={{ color: 'var(--danger)', fontSize: '.85rem', marginTop: 8 }}>{error}</p>}

          <div className="form-actions">
            <button type="submit" className="btn primary">
              {isEdit ? 'Guardar Cambios' : 'Anadir Gasto'}
            </button>
            <button type="button" className="btn outline" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
