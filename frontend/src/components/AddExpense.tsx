import { useState, useEffect, useRef } from 'react';
import { REF } from '../types';
import { addExpense, updateExpense, loadData, suggestExpense, type Suggestion } from '../store';
import type { Expense } from '../types';

interface Props {
  isOpen: boolean;
  editExpense?: Expense | null;
  onClose: () => void;
  onSaved: () => void;
  presetProjectId?: string;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export default function AddExpense({ isOpen, editExpense, onClose, onSaved, presetProjectId = '' }: Props) {
  const isEdit = !!editExpense;
  const today = new Date().toISOString().slice(0, 10);
  const projects = loadData().projects;

  const [date, setDate] = useState(today);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState(0);
  const [proposito, setProposito] = useState('');
  const [metodo, setMetodo] = useState('Tarjeta');
  const [motivo, setMotivo] = useState('');
  const [tipo, setTipo] = useState('Puntual');
  const [proyectoId, setProyectoId] = useState('');
  const [showShared, setShowShared] = useState(false);
  const [ajeno, setAjeno] = useState(0);
  const [invitacion, setInvitacion] = useState(0);
  const [deudores, setDeudores] = useState('');
  const [deudaMetodo, setDeudaMetodo] = useState('Bizum');
  const [devuelto, setDevuelto] = useState<'yes' | 'no'>('no');
  const [viaje, setViaje] = useState('');
  const [errors, setErrors] = useState<{ desc?: string; amount?: string }>({});
  const [sug, setSug] = useState<Suggestion | null>(null);
  const sugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sugTimer.current) clearTimeout(sugTimer.current);
    const q = desc.trim();
    if (!q || q.length < 3) { setSug(null); return; }
    sugTimer.current = setTimeout(() => {
      if (editExpense) { setSug(null); return; }
      const s = suggestExpense(q);
      setSug(s && (s.proposito || s.tipo || s.motivo || s.metodo !== 'Tarjeta') ? s : null);
    }, 300);
    return () => { if (sugTimer.current) clearTimeout(sugTimer.current); };
  }, [desc, editExpense]);

  const applySug = () => {
    if (!sug) return;
    setProposito(sug.proposito); setTipo(sug.tipo); setMotivo(sug.motivo); setMetodo(sug.metodo);
    if (sug.proyectoId) setProyectoId(sug.proyectoId);
    setSug(null);
  };

  useEffect(() => {
    if (editExpense) {
      setDate(editExpense.date);
      setDesc(editExpense.desc);
      setAmount(editExpense.amount);
      setProposito(editExpense.proposito);
      setMetodo(editExpense.metodo || 'Tarjeta');
      setMotivo(editExpense.motivo);
      setTipo(editExpense.tipo || 'Puntual');
      setProyectoId(editExpense.proyectoId || '');
      setAjeno(editExpense.ajeno || 0);
      setInvitacion(editExpense.invitacion ? 1 : 0);
      setDeudores(editExpense.deudores || '');
      setDeudaMetodo(editExpense.deudaMetodo || 'Bizum');
      setDevuelto(editExpense.devuelto || 'no');
      setViaje(editExpense.viaje || '');
      setShowShared(!!(editExpense.ajeno || editExpense.deudores || editExpense.devuelto === 'yes' || editExpense.viaje));
    } else {
      setDate(today);
      setDesc('');
      setAmount(0);
      setProposito('');
      setMetodo('Tarjeta');
      setMotivo('');
      setTipo('Puntual');
      setProyectoId(presetProjectId);
      setAjeno(0);
      setInvitacion(0);
      setDeudores('');
      setDeudaMetodo('Bizum');
      setDevuelto('no');
      setViaje('');
      setShowShared(false);
    }
    setErrors({});
  }, [editExpense, isOpen, presetProjectId]);

  if (!isOpen) return null;

  // "Me corresponde" se calcula solo (importe − gasto ajeno), como en la plantilla
  const meCorresponde = round2(Math.max(0, amount - ajeno));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { desc?: string; amount?: string } = {};
    if (!desc.trim()) errs.desc = 'La descripción es obligatoria';
    const amt = Number(amount);
    if (!amt || amt <= 0 || !isFinite(amt)) errs.amount = 'Introduce un importe mayor que 0';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const data = {
      date, desc: desc.trim(), amount: round2(amt), proposito, metodo,
      motivo: motivo.trim(), tipo: tipo.trim(),
      ajeno: showShared ? Math.min(ajeno, round2(amt)) : 0,
      invitacion: invitacion ? 1 : 0,
      deudores: showShared ? deudores.trim() : '',
      deudaMetodo: showShared ? deudaMetodo : 'Bizum',
      devuelto: showShared ? devuelto : 'no',
      meCorresponde: showShared ? meCorresponde : round2(amt),
      viaje: showShared ? viaje.trim() : '',
      proyectoId,
    };

    if (isEdit && editExpense) {
      updateExpense(editExpense.id, data);
    } else {
      addExpense(data);
    }
    onSaved();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${isEdit ? 'modal-edit' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Editar gasto' : 'Nuevo gasto'}</h2>
          <button className="modal-close" onClick={onClose} type="button" title="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-section">
            <div className="form-section-title">General</div>
            <div className="form-row three">
              <div className="form-group required">
                <label>Fecha</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-group required">
                <label>Importe (EUR)</label>
                <div className="amount-input-wrap">
                  <span className="cur">€</span>
                  <input
                    type="number" step="0.01" min="0.01" value={amount || ''}
                    onChange={e => setAmount(Number(e.target.value))}
                    placeholder="0,00" autoFocus={!isEdit}
                    className={errors.amount ? 'input-error' : ''}
                  />
                </div>
                {errors.amount && <span className="field-error">{errors.amount}</span>}
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select value={tipo} onChange={e => setTipo(e.target.value)}>
                  {REF.tipos.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group required" style={{ marginBottom: 12 }}>
              <label>Descripción</label>
              <input
                type="text" value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="¿En qué te gastaste el dinero?" className={errors.desc ? 'input-error' : ''}
              />
              {errors.desc && <span className="field-error">{errors.desc}</span>}
              {sug && !errors.desc && (
                <div className="sug-bar">
                  <span className="sug-icon">✦</span>
                  <span className="sug-text">
                    Según «{sug.match}»: <b>{sug.proposito || '—'}</b> · {sug.tipo} · {sug.motivo || 'sin motivo'} · {sug.metodo}
                  </span>
                  <button type="button" className="btn sm" onClick={applySug}>Usar</button>
                </div>
              )}
            </div>

            <div className="form-row three">
              <div className="form-group">
                <label>Categoría (Propósito)</label>
                <select value={proposito} onChange={e => setProposito(e.target.value)}>
                  <option value="">— Elige categoría —</option>
                  {REF.propositos.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Motivo / Evento</label>
                <select value={motivo} onChange={e => setMotivo(e.target.value)}>
                  <option value="">— Ninguno —</option>
                  {REF.motivos.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Método de pago</label>
                <select value={metodo} onChange={e => setMetodo(e.target.value)}>
                  <option value="">—</option>
                  {REF.metodos.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="invit-check" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                  <input type="checkbox" checked={!!invitacion} onChange={e => setInvitacion(e.target.checked ? 1 : 0)} />
                  Invitación (invito yo, sin devolución)
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Proyecto (opcional)</label>
              <select value={proyectoId} onChange={e => setProyectoId(e.target.value)}>
                <option value="">— Ninguno (uso general) —</option>
                {projects.map(p => <option key={p.id} value={p.id}>📁 {p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-section">
            <label className="toggle-row">
              <input
                type="checkbox" checked={showShared}
                onChange={e => setShowShared(e.target.checked)}
              />
              Gasto compartido / deuda
            </label>

            {showShared && (
              <>
                <div className="form-row three">
                  <div className="form-group">
                    <label>Gasto ajeno (EUR)</label>
                    <input type="number" step="0.01" min="0" value={ajeno || ''} onChange={e => setAjeno(Math.max(0, Number(e.target.value)))} placeholder="0,00" />
                  </div>
                  <div className="form-group">
                    <label>Deudores</label>
                    <input type="text" value={deudores} onChange={e => setDeudores(e.target.value)} placeholder="¿Quién debe?" />
                  </div>
                  <div className="form-group">
                    <label>Método devolución</label>
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
                      <option value="yes">Sí</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Viaje</label>
                    <input type="text" value={viaje} onChange={e => setViaje(e.target.value)} placeholder="Nombre del viaje" />
                  </div>
                </div>
                <div className="amount-preview">
                  <span>Te corresponde</span>
                  <span>{meCorresponde.toFixed(2).replace('.', ',')} €</span>
                </div>
              </>
            )}
          </div>

          <div className="form-actions" style={{ marginTop: 6 }}>
            <button type="submit" className="btn primary">
              {isEdit ? 'Guardar cambios' : 'Añadir gasto'}
            </button>
            <button type="button" className="btn outline" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
