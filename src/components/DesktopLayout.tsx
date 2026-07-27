import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Expense } from '../types';
import { getMonth } from '../types';
import { useLocale } from '../i18n';
import {
  IconPlus, IconList, IconChart, IconTarget, IconWallet, IconCheck,
  IconTrendingUp, IconEuro, IconCalendar, IconRefresh,
} from './Icons';

export type Tab = 'add' | 'list' | 'incomes' | 'monthly' | 'weekly' | 'goals' | 'debts' | 'subs' | 'sanity';

function pathToTab(pathname: string): Tab {
  if (pathname === '/expenses') return 'list';
  if (pathname === '/incomes') return 'incomes';
  if (pathname === '/goals') return 'goals';
  if (pathname === '/more/monthly') return 'monthly';
  if (pathname === '/more/weekly') return 'weekly';
  if (pathname === '/more/debts') return 'debts';
  if (pathname === '/more/subs') return 'subs';
  if (pathname === '/more/sanity') return 'sanity';
  if (pathname.startsWith('/more')) return 'list'; // fallback
  return 'list';
}

const NAV_ITEMS: { key: Tab; icon: React.ReactNode; i18nKey: string; path?: string }[] = [
  { key: 'add', icon: <IconPlus size={20} />, i18nKey: 'nav.add', path: 'add' },
  { key: 'list', icon: <IconList size={20} />, i18nKey: 'nav.expenses', path: '/expenses' },
  { key: 'incomes', icon: <IconTrendingUp size={20} />, i18nKey: 'nav.incomes', path: '/incomes' },
  { key: 'monthly', icon: <IconChart size={20} />, i18nKey: 'nav.monthly', path: '/more/monthly' },
  { key: 'weekly', icon: <IconTarget size={20} />, i18nKey: 'nav.weekly', path: '/more/weekly' },
  { key: 'goals', icon: <IconEuro size={20} />, i18nKey: 'nav.goals', path: '/goals' },
  { key: 'debts', icon: <IconWallet size={20} />, i18nKey: 'nav.debts', path: '/more/debts' },
  { key: 'subs', icon: <IconRefresh size={20} />, i18nKey: 'nav.subs', path: '/subs' },
  { key: 'sanity', icon: <IconCheck size={20} />, i18nKey: 'nav.check', path: '/more/sanity' },
];

interface Props {
  children: React.ReactNode;
  expenses: Expense[];
  onAddClick: () => void;
  dark: boolean;
  onToggleDark: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  layout: 'desktop' | 'mobile';
  onLayoutChange: (l: 'desktop' | 'mobile') => void;
}

export default function DesktopLayout({
  children, expenses, onAddClick,
  dark, onToggleDark, onExportCSV, onExportJSON,
  layout, onLayoutChange,
}: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = pathToTab(location.pathname);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();
    const totalYear = expenses.filter(e => e.date?.startsWith(String(thisYear))).reduce((s, e) => s + e.amount, 0);
    const thisMonthExps = expenses.filter(e => getMonth(e.date) === thisMonth && e.date?.startsWith(String(thisYear)));
    const totalMonth = thisMonthExps.reduce((s, e) => s + e.amount, 0);
    const monthCount = thisMonthExps.length;
    const avgMonth = monthCount > 0 ? totalMonth / monthCount : 0;
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const weekSpent = expenses.filter(e => {
      const d = new Date(e.date + 'T12:00:00');
      return d >= weekAgo && d <= now;
    }).reduce((s, e) => s + e.amount, 0);
    return { totalYear, totalMonth, monthCount, avgMonth, weekSpent };
  }, [expenses]);
  const { t, locale, setLocale } = useLocale();

  return (
    <div className="layout-desktop">
      <header className="desktop-header">
        <div className="header-brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span className="header-title">Control de Gastos</span>
        </div>
        <div className="header-stats">
          <div className="hs-item"><IconEuro size={13} /><span className="hs-label">{t('nav.monthly')}</span><span className="hs-value">{stats.totalMonth.toFixed(0)}</span></div>
          <div className="hs-item"><IconTrendingUp size={13} /><span className="hs-label">{t('monthly.totalYear')}</span><span className="hs-value">{stats.totalYear.toFixed(0)}</span></div>
          <div className="hs-item"><IconCalendar size={13} /><span className="hs-label">7d</span><span className="hs-value">{stats.weekSpent.toFixed(0)}</span></div>
        </div>
        <div className="header-actions">
          <button className="theme-btn" onClick={() => setLocale(locale === 'es' ? 'en' : locale === 'en' ? 'pt' : 'es')} title={t('lang.select')}>
            <span style={{fontWeight:700,fontSize:'.78rem'}}>{locale.toUpperCase()}</span>
          </button>
          <button className="layout-toggle-btn" onClick={() => onLayoutChange(layout === 'desktop' ? 'mobile' : 'desktop')} title={layout === 'desktop' ? t('nav.mobile') : t('nav.desktop')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </button>
          <button className="theme-btn" onClick={onToggleDark} title={t('theme.toggle')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {dark ? <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></> : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>}
            </svg>
          </button>
          <button className="theme-btn" onClick={onExportCSV} title="CSV">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button className="theme-btn" onClick={onExportJSON} title="JSON">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          </button>
        </div>
      </header>
      <div className="desktop-body">
        <nav className="desktop-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Menu</div>
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                className={`sidebar-item ${currentTab === item.key ? 'active' : ''}`}
                onClick={() => item.key === 'add' ? onAddClick() : item.path && navigate(item.path)}
              >
                {item.icon}<span>{t(item.i18nKey)}</span>
              </button>
            ))}
          </div>
          <div className="sidebar-footer">
            <div className="sidebar-label">{t('dashboard.goals')}</div>
            <div className="sidebar-mini-stat"><span className="sms-label">{t('nav.monthly')}</span><span className="sms-value">{stats.totalMonth.toFixed(0)} EUR</span></div>
            <div className="sidebar-mini-stat"><span className="sms-label">{t('monthly.count')}</span><span className="sms-value">{stats.monthCount}</span></div>
            <div className="sidebar-mini-stat"><span className="sms-label">{t('monthly.avgMonth')}</span><span className="sms-value">{stats.avgMonth.toFixed(0)} EUR</span></div>
          </div>
        </nav>
        <main className="desktop-content">{children}</main>
      </div>
    </div>
  );
}
