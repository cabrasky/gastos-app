/* ── Excel: importar / exportar con la Plantilla Gastos ─────────────────── */
import { useRef, useState } from 'react';
import { getToken } from '../api';

const P = { box: { border: '1px solid var(--border)', borderRadius: 14, padding: 18, background: 'var(--surface)', display: 'flex', flexDirection: 'column' as const, gap: 10 } };

export default function ExcelPage({ onImported }: { onImported?: () => void }) {
  const [msg, setMsg] = useState<{ ok?: string; err?: string }>({});
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const dl = (kind: 'plantilla' | 'exportar') => {
    const a = document.createElement('a');
    a.href = `/api/excel/${kind}?token=${encodeURIComponent(getToken() || '')}`;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const importFile = async (f: File) => {
    setBusy(true); setMsg({});
    try {
      const fd = new FormData();
      fd.append('file', f);
      const res = await fetch('/api/excel/importar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);
      setMsg({ ok: `Importadas ${data.creados} filas${data.duplicados ? ` (${data.duplicados} duplicadas omitidas)` : ''}${data.ignoradas ? ` (${data.ignoradas} filas incompletas ignoradas)` : ''}.` });
      if (onImported) onImported();
    } catch (e: any) {
      setMsg({ err: e?.message || 'Error al importar' });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
      <div style={P.box}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Excel — importar y exportar</h2>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>
          La app usa el mismo modelo que tu <b>Plantilla Gastos.xlsx</b>: columnas Fecha, Descripcion,
          Proposito, Motivo, Tipo, Metodo, Gasto ajeno, Deudores, M. devolucion, Devuelto, Me corresponde y Viaje,
          con desplegables de Propositos / Motivos / Tipos / Metodos en la hoja <i>Datos</i>.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn primary" onClick={() => dl('plantilla')}>Descargar plantilla</button>
          <button type="button" className="btn outline" onClick={() => dl('exportar')}>Exportar mis gastos (.xlsx)</button>
          <button type="button" className="btn outline" disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? 'Importando…' : 'Importar un .xlsx'}
          </button>
          <input ref={fileRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) importFile(f); }} />
        </div>
        {msg.ok && <div style={{ color: 'var(--positive)', fontSize: 13, fontWeight: 600 }}>{msg.ok}</div>}
        {msg.err && <div style={{ color: 'var(--danger)', fontSize: 13, fontWeight: 600 }}>{msg.err}</div>}
      </div>

      <div style={P.box}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Cómo usarlo</h3>
        <ol style={{ margin: 0, paddingLeft: 20, color: 'var(--text)', fontSize: 13.5, lineHeight: 1.7 }}>
          <li><b>Descarga la plantilla</b> y rellena las filas en la hoja <i>Gastos</i> (o sigue usando tu Excel de siempre).</li>
          <li><b>Importar</b>: sube el archivo y las filas completas (fecha + descripción + importe) se añaden como gastos. Las que ya existan se omiten, para que puedas reimportar sin duplicar.</li>
          <li><b>Exportar</b>: baja todos tus gastos en el mismo formato para llevarlos a tu Excel, hacer resúmenes o guardar copia.</li>
          <li>La fecha puede ir como <i>dd/mm/aaaa</i> o <i>aaaa-mm-dd</i>; el importe con coma o punto decimal (1.234,56 también vale).</li>
          <li>Si una fila usa un Propósito que no existe entre tus categorías, se crea el gasto igualmente; luego puedes crear esa categoría en <b>Más → Categorías</b>.</li>
        </ol>
      </div>
    </div>
  );
}
