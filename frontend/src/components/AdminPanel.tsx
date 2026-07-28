/* ── Admin Panel — Google OAuth + SMTP Config ───────────────────────────────── */
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getOAuthConfig, updateOAuthConfig, getSmtpConfig, updateSmtpConfig } from '../api';

export default function AdminPanel() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  // OAuth state
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [oauthEnabled, setOauthEnabled] = useState(false);

  // SMTP state
  const [smtpHost, setSmtpHost] = useState('mail.cabrasky.net');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpFromEmail, setSmtpFromEmail] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('Gastos App');
  const [smtpPasswordSet, setSmtpPasswordSet] = useState(false);

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    try {
      setMsg('');
      const [oauthData, smtpData] = await Promise.all([
        getOAuthConfig(),
        getSmtpConfig(),
      ]);
      const google = oauthData.configs.find(c => c.provider === 'google');
      if (google) {
        setClientId(google.client_id);
        setRedirectUri(google.redirect_uri);
        setOauthEnabled(google.enabled);
      }
      setSmtpHost(smtpData.host);
      setSmtpPort(smtpData.port);
      setSmtpUser(smtpData.user);
      setSmtpFromEmail(smtpData.from_email);
      setSmtpFromName(smtpData.from_name);
      setSmtpPasswordSet(smtpData.password_set);
    } catch (e: any) {
      setMsg('Error: ' + e.message);
    }
    setLoading(false);
  };

  const handleSaveOAuth = async () => {
    try {
      setSaving('oauth');
      setMsg('');
      await updateOAuthConfig({
        provider: 'google',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        enabled: oauthEnabled,
      });
      setMsg('Configuración OAuth guardada ✅');
    } catch (e: any) {
      setMsg('Error: ' + e.message);
    }
    setSaving(null);
  };

  const handleSaveSmtp = async () => {
    try {
      setSaving('smtp');
      setMsg('');
      await updateSmtpConfig({
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        password: smtpPassword,
        from_email: smtpFromEmail,
        from_name: smtpFromName,
      });
      setSmtpPassword('');
      setSmtpPasswordSet(true);
      setMsg('Configuración SMTP guardada ✅');
    } catch (e: any) {
      setMsg('Error: ' + e.message);
    }
    setSaving(null);
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
          <input type="text" value={clientId} onChange={e => setClientId(e.target.value)} placeholder="Google OAuth Client ID" />
          <label>Client Secret</label>
          <input type="password" value={clientSecret} onChange={e => setClientSecret(e.target.value)} placeholder="Google OAuth Client Secret" />
          <label>Redirect URI</label>
          <input type="text" value={redirectUri} onChange={e => setRedirectUri(e.target.value)} placeholder="https://gastos.cabrasky.net/api/auth/google/callback" />
          <label className="checkbox-label">
            <input type="checkbox" checked={oauthEnabled} onChange={e => setOauthEnabled(e.target.checked)} />
            {' '}OAuth habilitado
          </label>
          <button className="btn primary" onClick={handleSaveOAuth} disabled={saving === 'oauth'}>
            {saving === 'oauth' ? 'Guardando...' : 'Guardar OAuth'}
          </button>
        </div>
      </div>

      <div className="admin-section">
        <h3>📧 SMTP — Correo saliente</h3>
        <p className="hint">
          Configuraci&oacute;n del servidor SMTP para enviar correos de recuperaci&oacute;n de contrase&ntilde;a.
        </p>
        <div className="auth-form">
          <label>Host</label>
          <input type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="mail.cabrasky.net" />
          <label>Puerto</label>
          <input type="number" value={smtpPort} onChange={e => setSmtpPort(Number(e.target.value))} placeholder="587" />
          <label>Usuario</label>
          <input type="text" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="gastos@cabrasky.net" />
          <label>Contrase&ntilde;a {smtpPasswordSet && <span className="hint">(ya configurada — d&eacute;jala vac&iacute;a para mantenerla)</span>}</label>
          <input type="password" value={smtpPassword} onChange={e => setSmtpPassword(e.target.value)} placeholder={smtpPasswordSet ? '•••••••• (dejar vacío para mantener)' : 'Contraseña SMTP'} />
          <label>From Email</label>
          <input type="email" value={smtpFromEmail} onChange={e => setSmtpFromEmail(e.target.value)} placeholder="gastos@cabrasky.net" />
          <label>From Name</label>
          <input type="text" value={smtpFromName} onChange={e => setSmtpFromName(e.target.value)} placeholder="Gastos App" />
          <button className="btn primary" onClick={handleSaveSmtp} disabled={saving === 'smtp'}>
            {saving === 'smtp' ? 'Guardando...' : 'Guardar SMTP'}
          </button>
        </div>
      </div>

      {msg && <p className={msg.startsWith('Error') ? 'error' : 'success'}>{msg}</p>}
    </div>
  );
}
