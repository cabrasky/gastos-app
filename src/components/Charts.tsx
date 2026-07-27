import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { getMonth } from '../types';
import type { Expense, Income } from '../types';

const COLORS = ['#6366f1', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];
const SHORT_MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const tooltipStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text)',
  fontSize: 13,
};

const formatEuro = (v: number | string) => `${Number(v).toFixed(0)}EUR`;

/* ── Monthly Expense Bar Chart (existing) ────────────────────────── */
export function MonthlyChart({ expenses }: { expenses: Expense[] }) {
  const { months, totals } = useMemo(() => {
    const data = SHORT_MONTHS.map((name, i) => {
      const exps = expenses.filter(e => getMonth(e.date) === i + 1);
      return { name, total: exps.reduce((s, e) => s + e.amount, 0) };
    });
    const t = {
      fijo: expenses.filter(e => e.proposito === 'Fijo').reduce((s, e) => s + e.amount, 0),
      puntual: expenses.filter(e => e.proposito === 'Puntual').reduce((s, e) => s + e.amount, 0),
      viajes: expenses.filter(e => e.proposito === 'Viajes').reduce((s, e) => s + e.amount, 0),
      vida: expenses.filter(e => e.proposito === 'Nivel de Vida').reduce((s, e) => s + e.amount, 0),
      inversion: expenses.filter(e => e.proposito === 'Inversión').reduce((s, e) => s + e.amount, 0),
    };
    return { months: data, totals: t };
  }, [expenses]);

  const pieData = [
    { name: 'Fijo', value: totals.fijo },
    { name: 'Puntual', value: totals.puntual },
    { name: 'Viajes', value: totals.viajes },
    { name: 'Nivel Vida', value: totals.vida },
    { name: 'Inversion', value: totals.inversion },
  ].filter(d => d.value > 0);

  return (
    <>
      <div className="card">
        <h3>Gastos Mensuales</h3>
        <div className="chart-container">
          <ResponsiveContainer>
            <BarChart data={months} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={formatEuro} />
              <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)}EUR`, 'Total']} contentStyle={tooltipStyle} />
              <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {pieData.length > 0 && (
        <div className="card">
          <h3>Distribucion por Proposito</h3>
          <div className="chart-container chart-pie">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)}EUR`]} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Cash Flow: Income vs Expenses per month (grouped bar) ──────── */
export function CashFlowChart({ expenses, incomes }: { expenses: Expense[]; incomes: Income[] }) {
  const data = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    return SHORT_MONTHS.map((name, i) => {
      const m = i + 1;
      const exps = expenses.filter(e => getMonth(e.date) === m && e.date.startsWith(String(year)));
      const incs = incomes.filter(e => getMonth(e.date) === m && e.date.startsWith(String(year)));
      return {
        name,
        gastos: exps.reduce((s, e) => s + e.amount, 0),
        ingresos: incs.reduce((s, i) => s + i.amount, 0),
      };
    });
  }, [expenses, incomes]);

  const totalIngresos = data.reduce((s, d) => s + d.ingresos, 0);
  const totalGastos = data.reduce((s, d) => s + d.gastos, 0);
  const balance = totalIngresos - totalGastos;

  return (
    <div className="card">
      <div className="card-header">
        <h3>Flujo de Caja Mensual</h3>
        <span className={`card-total ${balance >= 0 ? 'positive' : 'negative'}`}>
          {balance >= 0 ? '+' : ''}{balance.toFixed(0)} EUR
        </span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={formatEuro} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="ingresos" name="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={24} />
            <Bar dataKey="gastos" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-legend-row">
        <span><span className="legend-dot" style={{background:'#22c55e'}} /> Ingresos: {totalIngresos.toFixed(0)} EUR</span>
        <span><span className="legend-dot" style={{background:'#ef4444'}} /> Gastos: {totalGastos.toFixed(0)} EUR</span>
      </div>
    </div>
  );
}

/* ── Cumulative Balance Line (year evolution) ────────────────────── */
export function BalanceEvolution({ expenses, incomes }: { expenses: Expense[]; incomes: Income[] }) {
  const data = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    let running = 0;
    return SHORT_MONTHS.map((name, i) => {
      const m = i + 1;
      const exps = expenses.filter(e => getMonth(e.date) === m && e.date.startsWith(String(year)));
      const incs = incomes.filter(e => getMonth(e.date) === m && e.date.startsWith(String(year)));
      const monthInc = incs.reduce((s, i) => s + i.amount, 0);
      const monthExp = exps.reduce((s, e) => s + e.amount, 0);
      running += (monthInc - monthExp);
      return { name, balance: running, ingresos: monthInc, gastos: monthExp };
    });
  }, [expenses, incomes]);

  const finalBalance = data.length > 0 ? data[data.length - 1].balance : 0;

  return (
    <div className="card">
      <div className="card-header">
        <h3>Evolucion del Balance</h3>
        <span className={`card-total ${finalBalance >= 0 ? 'positive' : 'negative'}`}>
          {finalBalance.toFixed(0)} EUR
        </span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={formatEuro} />
            <Tooltip
              formatter={(v: any) => [`${Number(v).toFixed(2)}EUR`]}
              contentStyle={tooltipStyle}
              labelFormatter={(l) => `Balance: ${l}`}
            />
            <Area type="monotone" dataKey="balance" name="Balance" stroke="var(--primary)" fill="url(#balanceGrad)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--primary)' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Income vs Expense Distribution (horizontal comparison) ──────── */
export function IncomeExpenseComparison({ expenses, incomes }: { expenses: Expense[]; incomes: Income[] }) {
  const data = useMemo(() => {
    const expByCat: Record<string, number> = {};
    expenses.forEach(e => {
      const cat = e.proposito || 'Otros';
      expByCat[cat] = (expByCat[cat] || 0) + e.amount;
    });
    const incByCat: Record<string, number> = {};
    incomes.forEach(i => {
      incByCat[i.category] = (incByCat[i.category] || 0) + i.amount;
    });

    const topExp = Object.entries(expByCat).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topInc = Object.entries(incByCat).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxVal = Math.max(
      ...topExp.map(([, v]) => v),
      ...topInc.map(([, v]) => v),
      1
    );

    return { topExp, topInc, maxVal };
  }, [expenses, incomes]);

  return (
    <div className="card">
      <h3>Distribucion Comparativa</h3>
      <div className="comparison-grid">
        <div>
          <h4 style={{ color: '#ef4444', marginBottom: 8, fontSize: '.82rem' }}>Gastos por Proposito</h4>
          {data.topExp.map(([name, val]) => (
            <div key={name} className="bar-row" style={{ marginBottom: 4 }}>
              <span className="bar-label" style={{ minWidth: 80, fontSize: '.75rem' }}>{name}</span>
              <div className="progress-wrap" style={{ flex: 1 }}>
                <div className="progress-fill" style={{ width: `${(val / data.maxVal) * 100}%`, background: '#ef4444' }} />
              </div>
              <span className="bar-value" style={{ minWidth: 80, fontSize: '.75rem' }}>{val.toFixed(0)} EUR</span>
            </div>
          ))}
        </div>
        <div>
          <h4 style={{ color: '#22c55e', marginBottom: 8, fontSize: '.82rem' }}>Ingresos por Categoria</h4>
          {data.topInc.map(([name, val]) => (
            <div key={name} className="bar-row" style={{ marginBottom: 4 }}>
              <span className="bar-label" style={{ minWidth: 80, fontSize: '.75rem' }}>{name}</span>
              <div className="progress-wrap" style={{ flex: 1 }}>
                <div className="progress-fill" style={{ width: `${(val / data.maxVal) * 100}%`, background: '#22c55e' }} />
              </div>
              <span className="bar-value" style={{ minWidth: 80, fontSize: '.75rem' }}>{val.toFixed(0)} EUR</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Weekly Progress (existing) ──────────────────────────────────── */
export function WeeklyProgressChart({ weeks, goal }: { weeks: { num: number; spent: number }[]; goal: number }) {
  const data = weeks.map(w => ({ name: `S${w.num}`, spent: w.spent, goal }));
  return (
    <div className="card">
      <h3>Gasto Semanal vs Meta</h3>
      <div className="chart-container chart-small">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval={3} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={formatEuro} />
            <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)}EUR`]} contentStyle={tooltipStyle} />
            <Bar dataKey="goal" fill="var(--border)" radius={[2, 2, 0, 0]} maxBarSize={12} />
            <Bar dataKey="spent" fill="var(--primary)" radius={[2, 2, 0, 0]} maxBarSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Sankey Diagram: Income → Disponible → Destinations ──────────── */
export function SankeyChart({ expenses, incomes }: { expenses: Expense[]; incomes: Income[] }) {
  const sankey = useMemo(() => {
    // ── Sources: group small incomes ──
    const incMap: Record<string, number> = {};
    incomes.forEach(i => { incMap[i.category] = (incMap[i.category] || 0) + i.amount; });
    let rawSrc = Object.entries(incMap).sort((a, b) => b[1] - a[1]);
    const totalInc = rawSrc.reduce((s, [, v]) => s + v, 0);
    let sources: [string, number][] = [];
    if (rawSrc.length <= 2) {
      sources = rawSrc;
    } else {
      const top2 = rawSrc.slice(0, 2);
      const otherSum = rawSrc.slice(2).reduce((s, [, v]) => s + v, 0);
      sources = [...top2, ['Otros ingresos', otherSum]];
    }
    sources.sort((a, b) => b[1] - a[1]);

    // ── Targets: separate into groups ──
    const expMap: Record<string, number> = {};
    expenses.forEach(e => { expMap[e.proposito] = (expMap[e.proposito] || 0) + e.amount; });
    const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
    const remainder = Math.max(0, totalInc - totalExp);

    type TargetGroup = 'savings' | 'fixed' | 'disc' | 'other';
    const targets: { name: string; val: number; group: TargetGroup }[] = [];

    if (remainder > 0) targets.push({ name: 'Ahorro', val: remainder, group: 'savings' });
    if (expMap['Inversión']) targets.push({ name: 'Inversión', val: expMap['Inversión'], group: 'savings' });

    for (const n of ['Fijo', 'Nivel de Vida'] as const) {
      if (expMap[n]) targets.push({ name: n, val: expMap[n], group: 'fixed' });
    }

    for (const n of ['Viajes', 'Puntual'] as const) {
      if (expMap[n]) targets.push({ name: n, val: expMap[n], group: 'disc' });
    }

    for (const [n, v] of Object.entries(expMap)) {
      if (!targets.find(t => t.name === n)) {
        targets.push({ name: n, val: v, group: 'other' });
      }
    }

    return { sources, targets, totalInc };
  }, [expenses, incomes]);

  const { sources, targets } = sankey;

  // ── Layout constants ──
  const W = 640, H = 440, PAD = 30;
  const availH = H - 2 * PAD;
  const GAP = 8;
  const MIN_NODE_H = 8;                // minimum visible node height
  const LEFT_X = 80, S_RECT_W = 14;   // source column
  const HUB_X = 215, HUB_W = 0;       // hub is invisible — flows connect here
  const RIGHT_X = 395, T_RECT_W = 14; // target column
  // Flows converge slightly: hub is 85% of availH so outer nodes curve gently
  const HUB_H = Math.round(availH * 0.85);
  const HUB_Y = PAD + Math.round((availH - HUB_H) / 2);

  // ── Colors ──
  const srcColors = ['#22c55e', '#16a34a', '#86efac'];
  const groupColors: Record<string, string> = {
    savings: '#3b82f6', fixed: '#f59e0b', disc: '#ef4444', other: '#8b5cf6',
  };

  // ── Source node layout ──
  const srcTotal = sources.reduce((s, [, v]) => s + v, 0) || 1;
  const tgtTotal = targets.reduce((s, t) => s + t.val, 0) || 1;
  const srcAvail = availH - (sources.length - 1) * GAP;
  const srcH = sources.map(([, v]) => Math.max(MIN_NODE_H, (v / srcTotal) * srcAvail));
  let sy = PAD;
  const srcRects = sources.map(([name, val], i) => {
    const y = sy; sy += srcH[i] + GAP;
    return { name, val, y, h: srcH[i], cy: y + srcH[i] / 2, color: srcColors[i % srcColors.length] };
  });

  // ── Target node layout ──
  const tgtAvail = availH - (targets.length - 1) * GAP;
  const tgtH = targets.map(t => Math.max(MIN_NODE_H, (t.val / tgtTotal) * tgtAvail));
  let ty = PAD;
  const tgtRects = targets.map((t, i) => {
    const y = ty; ty += tgtH[i] + GAP;
    return { name: t.name, val: t.val, y, h: tgtH[i], cy: y + tgtH[i] / 2, color: groupColors[t.group] || '#8b5cf6', group: t.group };
  });

  // ── Hub entry/exit positions (no height compression — full node height) ──
  let cumSrc = 0;
  const srcHub = sources.map(([, _val], i) => {
    const h = srcH[i];  // same height as source node (no pinch)
    const cy = HUB_Y + (cumSrc + h / 2) / availH * HUB_H;
    cumSrc += h;
    return { cy, h };
  });
  let cumTgt = 0;
  const tgtHub = targets.map((_t, i) => {
    const h = tgtH[i];  // same height as target node (no pinch)
    const cy = HUB_Y + (cumTgt + h / 2) / availH * HUB_H;
    cumTgt += h;
    return { cy, h };
  });

  // ── Tapered flow path with natural curves ──
  // Control points: 75% of horizontal distance stays at source y,
  // then curves in the last 25% toward target y.
  const flowPath = (x1: number, y1: number, w1: number, x2: number, y2: number, w2: number) => {
    const dx = x2 - x1, cpx1 = x1 + dx * 0.78, cpx2 = x2 - dx * 0.10;
    const y1t = y1 - w1 / 2, y1b = y1 + w1 / 2;
    const y2t = y2 - w2 / 2, y2b = y2 + w2 / 2;
    return `M${x1} ${y1t} C${cpx1} ${y1t}, ${cpx2} ${y2t}, ${x2} ${y2t} L${x2} ${y2b} C${cpx2} ${y2b}, ${cpx1} ${y1b}, ${x1} ${y1b} Z`;
  };

  // ── Helpers ──
  const totalDisp = sankey.totalInc;
  // Custom formatter: "16 150 €" with thin spaces
  const fmt = (v: number) => {
    const s = Math.round(v).toString();
    const parts: string[] = [];
    for (let i = s.length; i > 0; i -= 3) parts.unshift(s.slice(Math.max(0, i - 3), i));
    return parts.join('\u00A0') + '\u00A0€';
  };
  const pct = (v: number) => ((v / totalDisp) * 100).toFixed(0) + '\u00A0%';

  // Dynamic opacity: large flows get lower opacity so small ones remain visible
  const flowOpacity = (val: number) => Math.max(0.07, Math.min(0.18, 25 / (val / totalDisp * 100 + 8)));

  // Group section info — divider between groups, label below
  const groupFirstIdx: Record<string, number> = {};
  targets.forEach((t, i) => { if (groupFirstIdx[t.group] === undefined) groupFirstIdx[t.group] = i; });
  const groupInfo = Object.entries(groupFirstIdx).map(([g, idx]) => ({
    label: g === 'savings' ? 'AHORRO' : g === 'fixed' ? 'GASTOS FIJOS' : g === 'disc' ? 'GASTOS VARIABLES' : '',
    color: groupColors[g],
    y: tgtRects[idx].y - GAP + 2,  // divider line between groups
  })).filter(g => g.label);

  // Center x for hub label
  const HUB_LABEL_X = Math.round((LEFT_X + S_RECT_W + RIGHT_X) / 2);

  return (
    <div className="card">
      <div className="card-header">
        <h3 style={{fontSize:'.85rem'}}>Flujo del Dinero</h3>
      </div>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 520, maxHeight: 440 }}>

          <defs>
            <filter id="hubShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx={0} dy={1} stdDeviation={1.5} floodColor="#000" floodOpacity={0.10} />
            </filter>
          </defs>

          {/* ═══ Source flows: income → hub (invisible) ═══ */}
          {srcRects.map((s, i) => (
            <path key={`sf${i}`}
              d={flowPath(LEFT_X + S_RECT_W, s.cy, s.h, HUB_X, srcHub[i].cy, srcHub[i].h)}
              fill={s.color} fillOpacity={flowOpacity(s.val)} stroke="none" />
          ))}

          {/* ═══ Target flows: hub (invisible) → destination ═══ */}
          {tgtRects.map((t, i) => (
            <path key={`tf${i}`}
              d={flowPath(HUB_X + HUB_W, tgtHub[i].cy, tgtHub[i].h, RIGHT_X, t.cy, t.h)}
              fill={t.color} fillOpacity={flowOpacity(t.val)} stroke="none" />
          ))}

          {/* ═══ Floating hub label over the flow — no badge, just text ═══ */}
          <g filter="url(#hubShadow)">
            <text x={HUB_LABEL_X} y={HUB_Y + HUB_H / 2 - 8}
              textAnchor="middle" fill="var(--text)" fontSize={12} fontWeight={700}
              stroke="var(--surface)" strokeWidth={3} paintOrder="stroke">Disponible</text>
            <text x={HUB_LABEL_X} y={HUB_Y + HUB_H / 2 + 14}
              textAnchor="middle" fill="var(--primary)" fontSize={16} fontWeight={800}
              stroke="var(--surface)" strokeWidth={3} paintOrder="stroke">{fmt(totalDisp)}</text>
          </g>

          {/* ═══ Source nodes (left) ═══ */}
          <text x={LEFT_X} y={PAD - 8} textAnchor="start" fill="var(--text-muted)"
            fontSize={9} fontWeight={700} letterSpacing="0.14em">INGRESOS</text>

          {srcRects.map((s, i) => (
            <g key={`s${i}`}>
              <rect x={LEFT_X} y={s.y} width={S_RECT_W} height={s.h} fill={s.color} rx={2} />
              <text x={LEFT_X - 4} y={s.y + s.h / 2 + 4} textAnchor="end" fill="var(--text)" fontSize={12} fontWeight={600}>{s.name}</text>
              <text x={LEFT_X - 4} y={s.y + s.h / 2 + 17} textAnchor="end" fill="var(--text-muted)" fontSize={10}>{fmt(s.val)}</text>
              <text x={LEFT_X - 4} y={s.y + s.h / 2 + 27} textAnchor="end" fill="var(--text-muted)" fontSize={9}>{pct(s.val)}</text>
            </g>
          ))}

          {/* ═══ Target nodes (right), grouped ═══ */}
          {groupInfo.map((g, gi) => (
            <g key={`gl${gi}`}>
              <line x1={RIGHT_X} y1={g.y} x2={RIGHT_X + T_RECT_W + 80} y2={g.y}
                stroke={g.color} strokeWidth={0.5} opacity={0.35} />
              <text x={RIGHT_X + T_RECT_W + 14} y={g.y + 16}
                textAnchor="start" fill={g.color} fontSize={9} fontWeight={700} letterSpacing="0.10em" opacity={0.65}>
                ─ {g.label}
              </text>
            </g>
          ))}
          {tgtRects.map((t, i) => (
            <g key={`t${i}`}>
              <rect x={RIGHT_X} y={t.y} width={T_RECT_W} height={t.h} fill={t.color} rx={2} />
              <text x={RIGHT_X + T_RECT_W + 14} y={t.y + t.h / 2 + 4} textAnchor="start" fill="var(--text)" fontSize={12} fontWeight={600}>{t.name}</text>
              <text x={RIGHT_X + T_RECT_W + 14} y={t.y + t.h / 2 + 17} textAnchor="start" fill="var(--text-muted)" fontSize={10} style={{fontVariantNumeric:'tabular-nums'}}>{fmt(t.val)}</text>
              <text x={RIGHT_X + T_RECT_W + 14} y={t.y + t.h / 2 + 27} textAnchor="start" fill="var(--text-muted)" fontSize={9} style={{fontVariantNumeric:'tabular-nums'}}>{pct(t.val)}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
