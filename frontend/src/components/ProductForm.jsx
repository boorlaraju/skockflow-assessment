import { useEffect, useState } from 'react';

const blank = { name:'', sku:'', description:'', quantityOnHand:0, costPrice:'', sellingPrice:'', lowStockThreshold:'' };
export default function ProductForm({ initial, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  useEffect(() => setForm(initial ? { ...blank, ...initial } : blank), [initial]);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.name.trim() || !form.sku.trim()) return setError('Product name and SKU are required.');
    if (!Number.isInteger(Number(form.quantityOnHand)) || Number(form.quantityOnHand) < 0) return setError('Quantity must be a non-negative whole number.');
    try { await onSubmit({ ...form, quantityOnHand:Number(form.quantityOnHand) }); }
    catch (err) { setError(err.response?.data?.message || 'Could not save product.'); }
  };
  return <form className="product-form" onSubmit={submit}>
    {error && <div className="form-error">{error}</div>}
    <div className="form-grid">
      <label className="field full">Product name *<input name="name" value={form.name} onChange={change} placeholder="e.g. Wireless Keyboard" required/></label>
      <label className="field">SKU *<input name="sku" value={form.sku} onChange={change} placeholder="e.g. KB-1001" required/></label>
      <label className="field">Quantity on hand *<input name="quantityOnHand" type="number" min="0" step="1" value={form.quantityOnHand} onChange={change} required/></label>
      <label className="field">Cost price<input name="costPrice" type="number" min="0" step="0.01" value={form.costPrice ?? ''} onChange={change} placeholder="0.00"/></label>
      <label className="field">Selling price<input name="sellingPrice" type="number" min="0" step="0.01" value={form.sellingPrice ?? ''} onChange={change} placeholder="0.00"/></label>
      <label className="field">Low-stock threshold<input name="lowStockThreshold" type="number" min="0" step="1" value={form.lowStockThreshold ?? ''} onChange={change} placeholder="Use default setting"/></label>
      <label className="field full">Description <textarea name="description" rows="3" value={form.description || ''} onChange={change} placeholder="Optional product details"/></label>
    </div>
    <div className="modal-actions"><button type="button" className="button button-ghost" onClick={onCancel}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? 'Saving...' : initial ? 'Save changes' : 'Add product'}</button></div>
  </form>;
}
