/* ── Admin Panel — Google OAuth Config ──────────────────────────────────────── */
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getOAuthConfig, updateOAuthConfig } from '../api';

export default function AdminPanel() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Edit state
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    try {
      setMsg('');
      const data = await getOAuthConfig();
      const google = data.configs.find(c => c.provider === 'google');
      if (google) {
        setClientId(google.client_id);
        setRedirectUri(google.redirect_uri);
        setEnabled(google.enabled);
      }
    } catch (e: any) {
      setMsg('Error: ' + e.message);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMsg('');
      await updateOAuthConfig({
        provider: 'google',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        enabled,
      });
      setMsg('Configuración guardada ✅');
    } catch (e: any) {
      setMsg('Error: ' + e.message);
    }
    setSaving(false);
  };

  if (!user?.is_admin) {
    return <div className="admin-panel"><p>Acceso denegado. Solo administradores.</p></div>;
  }
  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Admin — Configuración</h2>
      </div>

      <div className="admin-section">
        <h3>🔐 Google OAuth</h3>
        <p className="hint">
          Configura las credenciales de OAuth desde{' '}
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener">Google Cloud Console</a>.
          La URL de redirección debe ser <code>{redirectUri || window.location.origin + '/api/auth/google/callback'}</code>
        </p>
        <div className="auth-form">
          <label>Client ID</label>
          <input
            type="text"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            placeholder="Google OAuth Client ID"
          />
          <label>Client Secret</label>
          <input
            type="password"
            value={clientSecret}
            onChange={e => setClientSecret(e.target.value)}
            placeholder="Google OAuth Client Secret"
          />
          <label>Redirect URI</label>
          <input
            type="text"
            value={redirectUri}
            onChange={e => setRedirectUri(e.target.value)}
            placeholder="https://gastos.cabrasky.net/api/auth/google/callback"
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
            />
            {' '}OAuth habilitado
          </label>
          <button className="btn primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </div>
      </div>

      {msg && <p className={msg.startsWith('Error') ? 'error' : 'success'}>{msg}</p>}
    </div>
  );
}
