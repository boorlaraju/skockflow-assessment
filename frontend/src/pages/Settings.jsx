import { useEffect, useState } from 'react';
import { Save, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';

export default function Settings() {
  const [value, setValue] = useState(5);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { api.get('/settings').then(r=>setValue(r.data.defaultLowStockThreshold)).catch(()=>setError('Could not load settings.')); }, []);
  const save = async e => {
    e.preventDefault(); setError(''); setNotice('');
    if (!Number.isInteger(Number(value)) || Number(value)<0) return setError('Enter a valid non-negative whole number.');
    setBusy(true);
    try { const {data}=await api.put('/settings',{defaultLowStockThreshold:Number(value)}); setValue(data.defaultLowStockThreshold); setNotice('Settings saved successfully.'); }
    catch(err) { setError(err.response?.data?.message || 'Could not save settings.'); }
    finally { setBusy(false); }
  };
  return <div className="page">
    <div className="page-heading"><div><span className="eyebrow">PREFERENCES</span><h1>Settings</h1><p>Configure how StockFlow works for your workspace.</p></div></div>
    <section className="panel settings-panel"><div className="settings-title"><span className="settings-icon"><SlidersHorizontal size={20}/></span><div><h2>Inventory preferences</h2><p>Set the default behavior for your stock levels.</p></div></div>
      <form onSubmit={save}><div className="setting-row"><div><strong>Default low-stock threshold</strong><p>Products with no custom threshold will use this value. Products at or below this quantity are flagged as low stock.</p></div><div className="threshold-input"><input type="number" min="0" step="1" value={value} onChange={e=>setValue(e.target.value)}/><span>units</span></div></div>
      {error && <div className="form-error">{error}</div>}{notice && <div className="notice success">{notice}</div>}
      <div className="settings-actions"><button className="button button-primary" disabled={busy}><Save size={16}/>{busy?'Saving...':'Save settings'}</button></div></form>
    </section>
    <div className="dashboard-note"><span className="note-icon">i</span><span>These settings apply only to your workspace. Each product can also have its own low-stock threshold.</span></div>
  </div>;
}
