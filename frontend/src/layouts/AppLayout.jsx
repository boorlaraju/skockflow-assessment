import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Boxes, LayoutDashboard, Package, Settings, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const leave = () => { logout(); navigate('/login'); };
  return <div className="app-shell">
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Boxes size={21}/></span><span>stockflow</span></div>
      <div className="workspace-label">WORKSPACE</div>
      <div className="org-card"><div className="org-avatar">{(user?.organizationName || 'S')[0].toUpperCase()}</div><div><strong>{user?.organizationName || 'My Store'}</strong><small>Owner workspace</small></div></div>
      <nav className="nav-links">
        <NavLink to="/" end onClick={() => setOpen(false)}><LayoutDashboard size={18}/>Dashboard</NavLink>
        <NavLink to="/products" onClick={() => setOpen(false)}><Package size={18}/>Products</NavLink>
        <NavLink to="/settings" onClick={() => setOpen(false)}><Settings size={18}/>Settings</NavLink>
      </nav>
      <div className="sidebar-bottom">
        <div className="user-mini"><div className="user-avatar">{(user?.name || user?.email || 'U')[0].toUpperCase()}</div><div className="user-meta"><strong>{user?.name || 'Account owner'}</strong><small>{user?.email}</small></div></div>
        <button className="logout-button" onClick={leave}><LogOut size={17}/>Sign out</button>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={() => setOpen(!open)}><Menu/></button><span className="breadcrumb">Workspace <span>/</span> Inventory</span><div className="topbar-right"><span className="status-dot"/> All changes saved</div></header>
      <div className="page-content"><Outlet/></div>
    </main>
  </div>;
}
