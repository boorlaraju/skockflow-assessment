import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Boxes, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name:'', email:'', password:'', organizationName:'' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const change = e => setForm({ ...form, [e.target.name]:e.target.value });
  const submit = async e => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      if (isRegister) await register(form); else await login({ email:form.email, password:form.password });
      navigate(location.state?.from || '/', { replace:true });
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  };
  return <div className="auth-page"><div className="auth-decoration"><div className="auth-orb orb-one"/><div className="auth-orb orb-two"/><div className="auth-brand"><span className="brand-mark"><Boxes size={22}/></span>stockflow</div><div className="auth-message"><span className="eyebrow light">INVENTORY, SIMPLIFIED</span><h1>Know your stock.<br/><em>Grow with confidence.</em></h1><p>A clear view of your inventory, all in one calm and simple workspace.</p><div className="auth-feature"><span>✓</span> One place for every product</div><div className="auth-feature"><span>✓</span> Stay ahead of low stock</div></div><div className="auth-footer">A simpler way to manage what matters.</div></div>
    <div className="auth-panel"><div className="auth-card"><div className="auth-mobile-brand"><span className="brand-mark"><Boxes size={20}/></span>stockflow</div><span className="eyebrow">{isRegister ? 'GET STARTED' : 'WELCOME BACK'}</span><h2>{isRegister ? 'Create your workspace' : 'Sign in to StockFlow'}</h2><p className="auth-subtitle">{isRegister ? 'Set up your store inventory in minutes.' : 'Enter your details to access your inventory.'}</p>
      <form onSubmit={submit} className="auth-form">
        {error && <div className="form-error">{error}</div>}
        {isRegister && <><label className="field">Your name<input name="name" value={form.name} onChange={change} placeholder="Your name"/></label><label className="field">Organization name<input name="organizationName" value={form.organizationName} onChange={change} placeholder="e.g. My Test Store" required/></label></>}
        <label className="field">Email address<input name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" required/></label>
        <label className="field">Password<input name="password" type="password" value={form.password} onChange={change} placeholder="At least 8 characters" minLength={isRegister ? 8 : 1} required/></label>
        <button className="button button-primary auth-submit" disabled={busy}>{busy ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'} <ArrowRight size={17}/></button>
      </form><p className="auth-switch">{isRegister ? 'Already have an account?' : "Don't have an account?"} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create account'}</Link></p>
    </div></div></div>;
}
