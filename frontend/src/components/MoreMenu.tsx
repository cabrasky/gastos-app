import { Link } from 'react-router-dom';
import { IconChart, IconTarget, IconWallet, IconRefresh, IconCheck } from './Icons';
import { useLocale } from '../i18n';

const ITEMS = [
  { key: 'monthly', icon: <IconChart size={28} />, i18nKey: 'nav.monthly', descKey: 'more.monthly', path: '/more/monthly' },
  { key: 'weekly', icon: <IconTarget size={28} />, i18nKey: 'nav.weekly', descKey: 'more.weekly', path: '/more/weekly' },
  { key: 'debts', icon: <IconWallet size={28} />, i18nKey: 'nav.debts', descKey: 'more.debts', path: '/more/debts' },
  { key: 'subs', icon: <IconRefresh size={28} />, i18nKey: 'nav.subs', descKey: 'more.subs', path: '/subs' },
  { key: 'sanity', icon: <IconCheck size={28} />, i18nKey: 'nav.check', descKey: 'more.check', path: '/more/sanity' },
];

export default function MoreMenu() {
  const { t } = useLocale();
  return (
    <div className="more-grid">
      {ITEMS.map(item => (
        <Link key={item.key} to={item.path} className="more-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="more-icon">{item.icon}</div>
          <div className="more-label">{t(item.i18nKey)}</div>
          <div className="more-desc">{t(item.descKey)}</div>
        </Link>
      ))}
      <Link to="/admin" className="more-card admin-card" style={{ textDecoration: 'none' }}>
        <div className="more-icon">⚙️</div>
        <div className="more-label">Admin</div>
        <div className="more-desc">Configuración de OAuth y usuarios</div>
      </Link>
    </div>
  );
}
