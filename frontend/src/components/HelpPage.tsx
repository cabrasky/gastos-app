/* ── Cómo se usa ─────────────────────────────────────────────────────────── */
import { Link } from 'react-router-dom';

const B = { border: '1px solid var(--border)', borderRadius: 14, padding: 16, background: 'var(--surface)', marginBottom: 12 };
const H = { margin: '0 0 8px', fontSize: 15.5, fontWeight: 800 } as const;
const LI = { lineHeight: 1.75, fontSize: 13.5, color: 'var(--text)' } as const;

export default function HelpPage() {
  return (
    <div style={{ maxWidth: 720 }}>
      <section style={B}>
        <h2 style={H}>Empezar</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li style={LI}><b>Apuntar un gasto</b>: botón “Nuevo gasto” (arriba a la derecha). Importe con coma (0,50), elige Propósito, Motivo, Tipo y Método; lo demás es opcional.</li>
          <li style={LI}><b>Gastos compartidos</b>: activa “Gasto compartido” y “Te corresponde” se calcula solo (importe − gasto ajeno).</li>
          <li style={LI}><b>Categorías tuyas</b>: en Más → <Link to="/categories">Categorías</Link> puedes crear, renombrar o borrar las tuyas (partes de las actuales). Renombrar actualiza también el histórico.</li>
          <li style={LI}><b>Proyectos</b>: enlaza gastos a proyectos (p. ej. el NAS) y consulta su desglose en <Link to="/projects">Proyectos</Link>.</li>
        </ul>
      </section>

      <section style={B}>
        <h2 style={H}>Ingresos, metas y suscripciones</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li style={LI}><b>Ingresos</b>: nómina, freelance, ventas… con su categoría.</li>
          <li style={LI}><b>Metas</b>: define objetivo e importe (p. ej. 2.000 €) y ve el progreso; “Aportar” suma sin tocar el total.</li>
          <li style={LI}><b>Suscripciones</b>: ciclo (semanal/mensual/trimestral/anual), próximo cobro y botón <b>“Pagado ✓”</b> que registra el gasto automáticamente y avanza el ciclo.</li>
        </ul>
      </section>

      <section style={B}>
        <h2 style={H}>Estadísticas y resúmenes</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li style={LI}><b>Resumen mensual / semanal / Sanidad financiera</b> y <b>Estadísticas</b> (gráficas) en el menú Más.</li>
          <li style={LI}>Los <b>tipos automáticos</b> funcionan como tu Excel: Recurrente → Fijo, Viajes → Viajes, Ahorro/Inversión + Transferencia → Inversión, el resto → Puntual.</li>
        </ul>
      </section>

      <section style={B}>
        <h2 style={H}>Excel (importar / exportar)</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li style={LI}>En Más → <Link to="/excel">Excel</Link> tienes la <b>misma plantilla</b> que usas (con desplegables), <b>exportar</b> tus gastos y <b>importar</b> un archivo rellenado.</li>
          <li style={LI}>Reimportar no duplica: las filas ya existentes se omiten.</li>
        </ul>
      </section>

      <section style={B}>
        <h2 style={H}>Privacidad y datos</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li style={LI}>Tus datos viven en <b>tu servidor</b> (gastos.cabrasky.net). Nada de anuncios ni terceros.</li>
          <li style={LI}>Puedes entrar con email o con Google, y exportar a Excel cuando quieras para tener tu copia.</li>
        </ul>
      </section>
    </div>
  );
}
