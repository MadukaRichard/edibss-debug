import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CATS = ['Medicines','Devices','Baby Care','Vitamins','First Aid','Diagnostics'];
const CAT_EMOJIS = { Medicines:'💊', Devices:'🩺', 'Baby Care':'👶', Vitamins:'🌿', 'First Aid':'🩹', Diagnostics:'🌡️' };

export default function HeroCMS() {
  const [hero, setHero] = useState({ 
    headline:'', subheadline:'', badge:'', cta:'', bgColor:'#E1F5EE',
    promotionalBanners: [] 
  });
  const [catOrder, setCatOrder] = useState(CATS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/admin/site-content').then(({data}) => {
      const heroEntry = data.find(d=>d.key==='hero');
      const catEntry  = data.find(d=>d.key==='categoryOrder');
      if (heroEntry?.value) setHero(h=>({...h,...heroEntry.value}));
      if (catEntry?.value && catEntry.value.length > 0) setCatOrder(catEntry.value);
    }).catch(()=>{});
  }, []);

  const saveHero = async () => {
    // Filter out any empty categories before saving
    const cleanCategories = catOrder.filter(cat => cat.trim() !== '');

    setSaving(true);
    try {
      await api.put('/admin/site-content/hero', { value: hero, label: 'Hero banner' });
      await api.put('/admin/site-content/categoryOrder', { value: cleanCategories, label: 'Category order' });
      setCatOrder(cleanCategories);
      toast.success('Homepage content saved!');
      setSaved(true); setTimeout(()=>setSaved(false),3000);
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  // --- Carousel Banner Functions ---
  const addBanner = () => {
    setHero(h => ({
      ...h,
      promotionalBanners: [...(h.promotionalBanners || []), { imageUrl: '', link: '/products' }]
    }));
  };

  const updateBanner = (index, field, value) => {
    const updated = [...(hero.promotionalBanners || [])];
    updated[index][field] = value;
    setHero(h => ({ ...h, promotionalBanners: updated }));
  };

  const removeBanner = (index) => {
    const updated = [...(hero.promotionalBanners || [])];
    updated.splice(index, 1);
    setHero(h => ({ ...h, promotionalBanners: updated }));
  };

  // --- Category Management Functions ---
  const addCategory = () => {
    setCatOrder([...catOrder, 'New Category']);
  };

  const updateCategoryName = (index, value) => {
    const updated = [...catOrder];
    updated[index] = value;
    setCatOrder(updated);
  };

  const removeCategory = (index) => {
    if (!window.confirm('Remove this category from the storefront?')) return;
    const updated = [...catOrder];
    updated.splice(index, 1);
    setCatOrder(updated);
  };

  const moveUp = (i) => {
    if (i===0) return;
    const updated = [...catOrder];
    [updated[i-1],updated[i]] = [updated[i],updated[i-1]];
    setCatOrder(updated);
  };

  const moveDown = (i) => {
    if (i===catOrder.length-1) return;
    const updated = [...catOrder];
    [updated[i],updated[i+1]] = [updated[i+1],updated[i]];
    setCatOrder(updated);
  };

  return (
    <div>
      <div style={styles.head}>
        <h1 style={styles.pageTitle}>Hero Banner & Homepage Content</h1>
        <button className="btn btn-primary" onClick={saveHero} disabled={saving}>{saving?'Saving…':'💾 Save all changes'}</button>
      </div>
      {saved && <div className="alert alert-success" style={{ marginBottom: 20 }}>✅ Changes saved and live on the storefront.</div>}

      {/* Hero section */}
      <div style={styles.section}>
        <h2 style={styles.sHead}>🖼 Hero section</h2>
        {/* Live preview */}
        <div style={{ ...styles.preview, background: hero.bgColor||'#E1F5EE', marginBottom:20 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(15,110,86,0.12)', color:'var(--teal-dk)', fontSize:12, padding:'4px 10px', borderRadius:20, marginBottom:10 }}>⚡ {hero.badge||'Fast health delivery'}</div>
          <h2 style={{ fontSize:20, fontWeight:700, color:'var(--gray-700)', marginBottom:8 }}>{hero.headline||'Headline preview'}</h2>
          <p style={{ fontSize:14, color:'var(--gray-500)' }}>{hero.subheadline||'Subheadline preview'}</p>
          <button style={{ marginTop:12, background:'var(--teal)', color:'#fff', border:'none', padding:'8px 18px', borderRadius:8, cursor:'default', fontSize:14 }}>{hero.cta||'CTA text'}</button>
        </div>

        <div className="form-row">
          <div className="form-group"><label>Headline</label><input value={hero.headline} onChange={e=>setHero(h=>({...h,headline:e.target.value}))} placeholder="Main hero heading"/></div>
          <div className="form-group"><label>Badge text</label><input value={hero.badge} onChange={e=>setHero(h=>({...h,badge:e.target.value}))} placeholder="e.g. Fast health delivery"/></div>
        </div>
        <div className="form-group"><label>Sub-headline</label><input value={hero.subheadline} onChange={e=>setHero(h=>({...h,subheadline:e.target.value}))} placeholder="Supporting description"/></div>
        <div className="form-row">
          <div className="form-group"><label>CTA button text</label><input value={hero.cta} onChange={e=>setHero(h=>({...h,cta:e.target.value}))} placeholder="Shop now"/></div>
          <div className="form-group"><label>Background color</label><input type="color" value={hero.bgColor||'#E1F5EE'} onChange={e=>setHero(h=>({...h,bgColor:e.target.value}))} style={{ height:42, padding:4 }}/></div>
        </div>

        {/* Promotional Carousel */}
        <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid var(--gray-200)' }} />
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--gray-700)' }}>Promotional Carousel</h3>
        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>Add images here. If you add more than one, they will automatically slide on the homepage.</p>
        
        {(hero.promotionalBanners || []).map((banner, i) => (
          <div key={i} style={styles.bannerRow}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input 
                value={banner.imageUrl} 
                onChange={e => updateBanner(i, 'imageUrl', e.target.value)} 
                placeholder="Image URL (Paste link or use upload page)" 
                style={styles.bannerInput} 
              />
              <input 
                value={banner.link} 
                onChange={e => updateBanner(i, 'link', e.target.value)} 
                placeholder="Target Link (e.g. /products?category=Medicines)" 
                style={styles.bannerInput} 
              />
            </div>
            {banner.imageUrl && (
              <img src={banner.imageUrl} alt={`Banner ${i+1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
            )}
            <button className="btn btn-sm btn-danger" onClick={() => removeBanner(i)}>Remove</button>
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={addBanner}>+ Add banner image</button>
      </div>

      {/* Category Management */}
      <div style={styles.section}>
        <h2 style={styles.sHead}>📂 Category order</h2>
        <p style={{ fontSize:13, color:'var(--gray-500)', marginBottom:14 }}>Rename, reorder, or add categories. These changes will update the storefront and the Add Product dropdown.</p>
        {catOrder.map((cat, i) => (
          <div key={i} style={styles.catRow}>
            <span style={{ fontSize:20 }}>{CAT_EMOJIS[cat]||'📦'}</span>
            
            <input 
              value={cat} 
              onChange={(e) => updateCategoryName(i, e.target.value)}
              style={styles.categoryInput}
              placeholder="Category Name"
            />

            <div style={{ display:'flex', gap:6 }}>
              <button className="btn btn-sm" onClick={()=>moveUp(i)} disabled={i===0}>↑</button>
              <button className="btn btn-sm" onClick={()=>moveDown(i)} disabled={i===catOrder.length-1}>↓</button>
              <button className="btn btn-sm btn-danger" onClick={()=>removeCategory(i)} title="Delete">✕</button>
            </div>
          </div>
        ))}
        
        <button className="btn btn-outline btn-sm" onClick={addCategory} style={{ marginTop: 10 }}>+ Add new category</button>
      </div>
    </div>
  );
}

const styles = {
  head: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  pageTitle: { fontSize:24, fontWeight:700, color:'var(--gray-700)' },
  section: { background:'#fff', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px', marginBottom:20 },
  sHead: { fontSize:16, fontWeight:700, marginBottom:16, color:'var(--gray-700)' },
  preview: { borderRadius:10, padding:'20px 24px', border:'1px solid var(--gray-200)' },
  
  catRow: { display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'var(--gray-50)', borderRadius:8, marginBottom:8, border:'1px solid var(--gray-200)' },
  categoryInput: { flex: 1, padding: '8px 12px', border: '1px solid var(--gray-300)', borderRadius: 6, fontSize: 14, fontWeight: 500, fontFamily: 'var(--font)' },
  
  bannerRow: { display:'flex', gap:16, marginBottom:16, alignItems:'flex-start', background: 'var(--gray-50)', padding: 16, borderRadius: 10, border: '1px dashed var(--gray-300)' },
  bannerInput: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: 14 }
};