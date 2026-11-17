import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Package, X } from 'lucide-react';
import api from '../services/api';
import ProductForm from '../components/ProductForm';

const money = v => v == null ? '—' : new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:2 }).format(v);
export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const load = async () => { const { data } = await api.get('/products'); setProducts(data.products); };
  useEffect(() => { load().catch(() => setError('Could not load products.')); }, []);
  const filtered = useMemo(() => products.filter(p => `${p.name} ${p.sku}`.toLowerCase().includes(search.toLowerCase())), [products, search]);
  const openAdd = () => { setEditing(null); setModal(true); };
  const openEdit = p => { setEditing(p); setModal(true); };
  const save = async values => {
    setBusy(true);
    try {
      if (editing) await api.put(`/products/${editing.id}`, values); else await api.post('/products', values);
      await load(); setModal(false); setNotice(editing ? 'Product updated successfully.' : 'Product added successfully.');
    } finally { setBusy(false); }
  };
  const remove = async p => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try { await api.delete(`/products/${p.id}`); await load(); setNotice('Product deleted.'); }
    catch (e) { setError(e.response?.data?.message || 'Could not delete product.'); }
  };
  return <div className="page">
    <div className="page-heading"><div><span className="eyebrow">CATALOG</span><h1>Products</h1><p>Manage your products and keep stock levels up to date.</p></div><button className="button button-primary" onClick={openAdd}><Plus size={17}/> Add product</button></div>
    {notice && <div className="notice success">{notice}<button onClick={()=>setNotice('')}><X size={15}/></button></div>}
    {error && <div className="form-error">{error}</div>}
    <section className="panel">
      <div className="list-toolbar"><div><h2>All products <span className="count-badge">{products.length}</span></h2><p>Your organization's inventory catalog</p></div><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or SKU..."/></div></div>
      {filtered.length ? <div className="table-wrap"><table><thead><tr><th>PRODUCT</th><th>SKU</th><th>QUANTITY</th><th>SELLING PRICE</th><th>STOCK STATUS</th><th className="align-right">ACTIONS</th></tr></thead><tbody>{filtered.map(p=>{
        const threshold = p.lowStockThreshold;
        return <tr key={p.id}><td><strong className="product-name">{p.name}</strong>{p.description && <small className="table-description">{p.description}</small>}</td><td className="muted-cell">{p.sku}</td><td><strong>{p.quantityOnHand}</strong><small className="table-description">units</small></td><td>{money(p.sellingPrice)}</td><td><span className={`status-pill ${p.quantityOnHand <= (threshold ?? 5) ? 'low':'healthy'}`}><i/>{p.quantityOnHand <= (threshold ?? 5) ? 'Low stock':'In stock'}</span></td><td><div className="row-actions"><button title="Edit product" onClick={()=>openEdit(p)}><Pencil size={16}/></button><button title="Delete product" className="danger-action" onClick={()=>remove(p)}><Trash2 size={16}/></button></div></td></tr>;
      })}</tbody></table></div> : <div className="empty-state"><div className="empty-icon"><Package size={24}/></div><strong>{search ? 'No matching products' : 'No products yet'}</strong><p>{search ? 'Try a different search term.' : 'Add your first product to start tracking inventory.'}</p>{!search && <button className="button button-primary" onClick={openAdd}><Plus size={16}/> Add your first product</button>}</div>}
    </section>
    {modal && <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget && setModal(false)}><div className="modal"><div className="modal-heading"><div><span className="eyebrow">{editing ? 'EDIT PRODUCT':'NEW PRODUCT'}</span><h2>{editing ? 'Update product':'Add a product'}</h2></div><button className="icon-button" onClick={()=>setModal(false)}><X size={20}/></button></div><ProductForm initial={editing} onSubmit={save} onCancel={()=>setModal(false)} busy={busy}/></div></div>}
  </div>;
}
