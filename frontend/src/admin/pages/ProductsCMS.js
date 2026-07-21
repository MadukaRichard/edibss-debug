import React, { useEffect, useState } from 'react';
import api, { apiUpload, API_ORIGIN } from '../../services/api';
import toast from 'react-hot-toast';
import { CategoryIcon } from '../../components/UiIcons';

const FALLBACK_CATS = ['Medicines','Devices','Baby Care','Vitamins','First Aid','Diagnostics','Other'];
// 1. ADDED variants array to the empty state
const EMPTY = { name:'', description:'', price:'', category:'Medicines', stock:'', isActive:true, requiresPrescription:false, unitSize: 1, unit: 'item', allowCustomAmount: false, variants: [] };
const UNITS = ['item', 'g', 'mg', 'kg', 'ml', 'cl', 'L'];

export default function ProductsCMS() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(FALLBACK_CATS);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/products');
      setProducts(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    api.get('/admin/site-content').then(({data}) => {
      const catEntry = data.find(d => d.key === 'categoryOrder');
      if (catEntry?.value && catEntry.value.length > 0) {
        const loadedCats = [...catEntry.value];
        if (!loadedCats.includes('Other')) loadedCats.push('Other');
        setCategories(loadedCats);
      }
    }).catch(()=>{});
  }, []);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await apiUpload('/admin/upload', (() => { const fd = new FormData(); fd.append('file', file); return fd; })());
      set('image', `${API_ORIGIN}${data.url}`);
      toast.success('Image uploaded');
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const openAdd = () => { 
    setForm({...EMPTY, category: categories[0] || 'Medicines'}); 
    setEditing(null); 
    setModal(true); 
  };
  
  const openEdit = (p) => { 
    // 2. Load existing variants when editing
    setForm({...p, price:p.price, stock:p.stock, unitSize: p.unitSize || 1, unit: p.unit || 'item', allowCustomAmount: p.allowCustomAmount || false, variants: p.variants || []}); 
    setEditing(p._id); 
    setModal(true); 
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...form.variants];
    newVariants[index][field] = value;
    set('variants', newVariants);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return toast.error('Name and Base Price required');
    setLoading(true);
    try {
      if (editing) await api.put(`/admin/products/${editing}`, form);
      else await api.post('/admin/products', form);
      toast.success(editing ? 'Product updated' : 'Product added');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/admin/products/${id}`);
    toast.success('Deleted'); load();
  };

  return (
    <div>
      <div style={styles.head}>
        <h1 style={styles.pageTitle}>Products & Categories</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add product</button>
      </div>

      <div style={styles.card}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tr}>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="6" style={{padding: 20, textAlign: 'center'}}>Loading...</td></tr> : products.map(p => (
                <tr key={p._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <CategoryIcon category={p.category} size={22} />
                      <div>
                        <div style={{ fontWeight:600, fontSize:14 }}>
                          {p.name}
                          {p.variants?.length > 0 ? (
                            <span style={{ color: 'var(--teal)', fontSize: 11, marginLeft: 6, background: 'var(--teal-lt)', padding: '2px 6px', borderRadius: 4 }}>{p.variants.length} Sizes</span>
                          ) : (
                            p.unit && p.unit !== 'item' && <span style={{ color: 'var(--gray-500)', fontWeight: 400, marginLeft: 4 }}>({p.unitSize}{p.unit})</span>
                          )}
                        </div>
                        {p.requiresPrescription && <span style={{ fontSize:11,color:'var(--amber)' }}>Rx</span>}
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}><span className="badge badge-gray">{p.category}</span></td>
                  <td style={{ ...styles.td, fontWeight:600 }}>₦{p.price?.toLocaleString()}</td>
                  <td style={styles.td}><span style={{ color: p.stock===0?'var(--coral)':p.stock<5?'var(--amber)':'inherit' }}>{p.stock}</span></td>
                  <td style={styles.td}><span className={`badge ${p.isActive?'badge-success':'badge-gray'}`}>{p.isActive?'Active':'Inactive'}</span></td>
                  <td style={styles.td}>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn btn-sm" onClick={()=>openEdit(p)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={()=>handleDelete(p._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHead}><h2 style={{ fontSize:18, fontWeight:700 }}>{editing?'Edit':'Add'} product</h2><button style={styles.closeBtn} onClick={()=>setModal(false)}>✕</button></div>
            <div className="form-row">
              <div className="form-group"><label>Product name</label><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Amoxicillin 500mg"/></div>
              <div className="form-group"><label>Icon preview</label><div style={{ display:'flex', alignItems:'center', minHeight:42, padding:'0 14px', border:'1.5px solid var(--gray-200)', borderRadius:8, background:'var(--gray-50)' }}><CategoryIcon category={form.category} size={20} /><span style={{ marginLeft:10, fontSize:13, color:'var(--gray-500)' }}>Based on category</span></div></div>
            </div>
            
            <div className="form-row">
              <div className="form-group"><label>Base Size/Amount (e.g., 500)</label><input type="number" value={form.unitSize} onChange={e=>set('unitSize',Number(e.target.value))} placeholder="1"/></div>
              <div className="form-group"><label>Measurement Unit</label><select value={form.unit} onChange={e=>set('unit',e.target.value)}>{UNITS.map(u=><option key={u}>{u === 'item' ? 'Single Item / Box' : u}</option>)}</select></div>
            </div>

            <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={3} style={{ width:'100%', padding:'10px 14px', border:'1.5px solid var(--gray-200)', borderRadius:8, fontFamily:'var(--font)', fontSize:14, resize:'vertical' }}/></div>
            <div className="form-row">
              <div className="form-group"><label>Base Price (₦)</label><input type="number" value={form.price} onChange={e=>set('price',e.target.value)} placeholder="1800"/></div>
              <div className="form-group"><label>Stock quantity</label><input type="number" value={form.stock} onChange={e=>set('stock',e.target.value)} placeholder="100"/></div>
            </div>

            {/* 3. NEW VARIANTS SECTION FOR DRINKS / SIZES */}
            <div className="form-group" style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 8, border: '1px dashed var(--gray-300)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <label style={{ margin: 0, color: 'var(--gray-700)' }}>Different Sizes & Prices (Variants)</label>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>e.g., 50cl for ₦500, 1L for ₦900</div>
                </div>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => set('variants', [...form.variants, { name: '', price: '' }])}>+ Add Size</button>
              </div>
              
              {form.variants.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--gray-500)', fontStyle: 'italic' }}>No sizes added. The Base Price will be used.</div>
              ) : (
                form.variants.map((v, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <input style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--gray-300)', borderRadius: 6 }} placeholder="Size Name (e.g. 50cl)" value={v.name} onChange={e => handleVariantChange(i, 'name', e.target.value)} />
                    <input style={{ width: 120, padding: '8px 12px', border: '1px solid var(--gray-300)', borderRadius: 6 }} type="number" placeholder="Price (₦)" value={v.price} onChange={e => handleVariantChange(i, 'price', e.target.value)} />
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => { const nv = [...form.variants]; nv.splice(i,1); set('variants', nv); }}>✕</button>
                  </div>
                ))
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e=>set('category',e.target.value)}>
                  {categories.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Product image</label>
                <input value={form.image||''} onChange={e=>set('image',e.target.value)} placeholder="Paste image URL, or upload below" style={{ marginBottom:6 }}/>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>handleImageUpload(e.target.files[0])} disabled={uploading}/>
                {uploading && <span style={{ fontSize:12, color:'var(--gray-500)' }}>Uploading…</span>}
                {form.image && <img src={form.image} alt="preview" style={{ width:60, height:60, objectFit:'cover', borderRadius:8, marginTop:8 }}/>}
              </div>
            </div>
            
            <div style={{ display:'flex', gap:20, marginBottom:16, flexWrap: 'wrap' }}>
              <label style={{ display:'flex', gap:8, alignItems:'center', fontSize:14, cursor:'pointer' }}><input type="checkbox" checked={form.isActive} onChange={e=>set('isActive',e.target.checked)}/> Active</label>
              <label style={{ display:'flex', gap:8, alignItems:'center', fontSize:14, cursor:'pointer' }}><input type="checkbox" checked={form.requiresPrescription} onChange={e=>set('requiresPrescription',e.target.checked)}/> Requires prescription</label>
              
              {form.unit !== 'item' && form.variants.length === 0 && (
                <label style={{ display:'flex', gap:8, alignItems:'center', fontSize:14, cursor:'pointer', color: 'var(--teal-dk)', fontWeight: 600 }}>
                  <input type="checkbox" checked={form.allowCustomAmount} onChange={e=>set('allowCustomAmount',e.target.checked)}/> 
                  Allow manual customer input (e.g. typing 2.5 {form.unit})
                </label>
              )}
            </div>
            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button className="btn" onClick={()=>setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading?'Saving…':'Save product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  head: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 },
  pageTitle: { fontSize:24, fontWeight:700, color:'var(--gray-700)' },
  card: { background:'#fff', borderRadius:12, border:'1px solid var(--gray-200)', overflow:'hidden' },
  tableWrapper: { overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' },
  table: { width:'100%', borderCollapse:'collapse', minWidth: '800px' },
  th: { background:'var(--gray-50)', textAlign:'left', padding: '14px 16px', color: 'var(--gray-500)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' },
  tr: { borderBottom:'1px solid var(--gray-100)' },
  td: { padding: '16px', fontSize: 14, whiteSpace: 'nowrap' },
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:20 },
  modal: { background:'#fff', borderRadius:16, width:'100%', maxWidth:600, padding:'24px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' },
  modalHead: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  closeBtn: { background:'var(--gray-100)', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:16 },
};