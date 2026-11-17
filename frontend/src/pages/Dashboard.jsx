import { useEffect, useState } from 'react';
import { Package, Boxes, AlertTriangle, ArrowUpRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const money = value => value == null ? '—' : new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:2 }).format(value);
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/dashboard').then(r => setData(r.data)).catch(e => setError(e.response?.data?.message || 'Could not load dashboard.')); }, []);
  if (error) return <div className="form-error">{error}</div>;
  if (!data) return <div className="loading-screen">Loading dashboard...</div>;
  return <div className="page">
    <div className="page-heading"><div><span className="eyebrow">OVERVIEW</span><h1>Dashboard</h1><p>Here's what's happening with your inventory today.</p></div><Link to="/products" className="button button-primary"><Plus size={17}/> Add product</Link></div>
    <div className="stats-grid">
      <div className="stat-card"><div className="stat-top"><span>Total products</span><span className="stat-icon purple"><Package size={19}/></span></div><strong>{data.totalProducts}</strong><small>Products in your catalog</small></div>
      <div className="stat-card"><div className="stat-top"><span>Units in stock</span><span className="stat-icon blue"><Boxes size={19}/></span></div><strong>{data.totalUnits.toLocaleString('en-IN')}</strong><small>Total quantity across products</small></div>
      <div className="stat-card"><div className="stat-top"><span>Low stock items</span><span className="stat-icon orange"><AlertTriangle size={19}/></span></div><strong>{data.lowStockCount}</strong><small>At or below stock threshold</small></div>
    </div>
    <section className="panel"><div className="panel-heading"><div><h2>Low stock items</h2><p>Products that may need replenishment</p></div><Link to="/products" className="text-link">View all products <ArrowUpRight size={15}/></Link></div>
      {data.lowStockItems.length ? <div className="table-wrap"><table><thead><tr><th>PRODUCT</th><th>SKU</th><th>QUANTITY</th><th>THRESHOLD</th><th>STATUS</th></tr></thead><tbody>{data.lowStockItems.map(p=><tr key={p.id}><td><strong className="product-name">{p.name}</strong></td><td className="muted-cell">{p.sku}</td><td><strong>{p.quantityOnHand}</strong></td><td>{p.lowStockThreshold}</td><td><span className="status-pill low"><i/>Low stock</span></td></tr>)}</tbody></table></div> : <div className="empty-state"><div className="empty-icon"><Package size={24}/></div><strong>You're in good shape</strong><p>No products are currently below their stock threshold.</p><Link to="/products" className="text-link">Manage products <ArrowUpRight size={15}/></Link></div>}
    </section>
    <div className="dashboard-note"><span className="note-icon">i</span><span>Your default low-stock threshold is <strong>{data.defaultThreshold} units</strong>. You can change it in <Link to="/settings">Settings</Link>.</span></div>
  </div>;
}
