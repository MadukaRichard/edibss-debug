import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AppIcons, CategoryIcon } from '../../components/UiIcons';

const CATS = ['Medicines','Devices','Baby Care','Vitamins','First Aid','Diagnostics'];
export default function HeroCMS() {
  const [hero, setHero] = useState({ headline:'', subheadline:'', badge:'', cta:'', bgColor:'#E1F5EE' });
  const [catOrder, setCatOrder] = useState(CATS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const SaveIcon = AppIcons.logo;
  const HeroIcon = AppIcons.image;

  useEffect(() => {
    api.get('/admin/site-content').then(({data}) => {
      const heroEntry = data.find(d=>d.key==='hero');
      const catEntry  = data.find(d=>d.key==='categoryOrder');
      if (heroEntry?.value) setHero(h=>({...h,...heroEntry.value}));
      if (catEntry?.value)  setCatOrder(catEntry.value);
    }).catch(()=>{});
  }, []);

  const saveHero = async () => {
    setSaving(true);
    try {
      await api.put('/admin/site-content/hero', { value: hero, label: 'Hero banner' });
      await api.put('/admin/site-content/categoryOrder', { value: catOrder, label: 'Category order' });
      toast.success('Homepage content saved!');
      setSaved(true); setTimeout(()=>setSaved(false),3000);
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
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
        <button className="btn btn-primary" onClick={saveHero} disabled={saving}><SaveIcon size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />{saving?'Saving…':'Save all changes'}</button>
      </div>
      {saved && <div className="alert alert-success">✅ Changes saved and live on the storefront.</div>}

      {/* Hero section */}
      <div style={styles.section}>
        <h2 style={styles.sHead}><HeroIcon size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Hero section</h2>
        {/* Live preview */}
        <div style={{ ...styles.preview, background: hero.bgColor||'#E1F5EE', marginBottom:20 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(15,110,86,0.12)', color:'var(--teal-dk)', fontSize:12, padding:'4px 10px', borderRadius:20, marginBottom:10 }}><AppIcons.clock size={14} /> {hero.badge||'Fast health delivery'}</div>
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
      </div>

      {/* Category order */}
      <div style={styles.section}>
        <h2 style={styles.sHead}>Category order</h2>
        <p style={{ fontSize:13, color:'var(--gray-500)', marginBottom:14 }}>Drag or use arrows to reorder categories on the storefront.</p>
        {catOrder.map((cat, i) => (
          <div key={cat} style={styles.catRow}>
            <CategoryIcon category={cat} size={20} />
            <span style={{ fontSize:14, fontWeight:500, flex:1 }}>{cat}</span>
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn btn-sm" onClick={()=>moveUp(i)} disabled={i===0}>↑</button>
              <button className="btn btn-sm" onClick={()=>moveDown(i)} disabled={i===catOrder.length-1}>↓</button>
            </div>
          </div>
        ))}
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
};
