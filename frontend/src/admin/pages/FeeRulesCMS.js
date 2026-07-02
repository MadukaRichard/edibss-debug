import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AppIcons } from '../../components/UiIcons';

export default function FeeRulesCMS() {
  const [form, setForm] = useState({ storeLat:6.5244, storeLng:3.3792, baseFee:500, baseFeeMaxKm:2, perKmRate:80, peakHourSurcharge:100, peakHours:['07:00-09:00','17:00-20:00'], maxRadiusKm:15, freeDeliveryThreshold:15000 });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const SaveIcon = AppIcons.payment;
  const ClockIcon = AppIcons.clock;
  const LocateIcon = AppIcons.locateFixed;

  const detectStoreLocation = () => {
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { set('storeLat', pos.coords.latitude); set('storeLng', pos.coords.longitude); setDetecting(false); toast.success('Location detected'); },
      () => { toast.error('Could not detect location'); setDetecting(false); }
    );
  };

  const sampleFee = () => {
    const dist = 5;
    const extra = Math.max(0, dist - form.baseFeeMaxKm);
    return form.baseFee + extra * form.perKmRate + form.peakHourSurcharge;
  };

  useEffect(() => {
    api.get('/admin/fee-rules').then(({data}) => setForm(f=>({...f,...data}))).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/fee-rules', form);
      toast.success('Delivery fee rules updated!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  return (
    <div>
      <div style={styles.head}>
        <h1 style={styles.pageTitle}>Delivery Fee Rules (AI Engine)</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}><SaveIcon size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />{saving?'Saving…':'Save rules'}</button>
      </div>

      {/* Live preview */}
      <div style={styles.preview}>
        <h3 style={{ fontSize:14, fontWeight:700, marginBottom:12, color:'var(--teal-dk)' }}><ClockIcon size={14} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Sample calculation (5 km, peak hour)</h3>
        <div style={styles.previewRow}><span>Base fee (0–{form.baseFeeMaxKm} km)</span><span>₦{Number(form.baseFee).toLocaleString()}</span></div>
        <div style={styles.previewRow}><span>Distance charge ({Math.max(0,5-form.baseFeeMaxKm)} km × ₦{form.perKmRate})</span><span>₦{(Math.max(0,5-form.baseFeeMaxKm)*form.perKmRate).toLocaleString()}</span></div>
        <div style={styles.previewRow}><span>Peak hour surcharge</span><span style={{ color:'var(--coral)' }}>+₦{Number(form.peakHourSurcharge).toLocaleString()}</span></div>
        <div style={{ ...styles.previewRow, fontWeight:700, fontSize:16, borderTop:'1px solid rgba(15,110,86,0.2)', paddingTop:10, marginTop:6 }}><span>Total</span><span>₦{sampleFee().toLocaleString()}</span></div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sHead}>Pickup location (pharmacy / warehouse)</h2>
        <p style={{ fontSize:13, color:'var(--gray-500)', marginBottom:14 }}>Delivery distance and fees are calculated from this fixed point to the customer's address — no live rider GPS is required for this.</p>
        <button className="btn btn-outline" onClick={detectStoreLocation} disabled={detecting} style={{ marginBottom:14 }}>
          <LocateIcon size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />{detecting ? 'Detecting…' : 'Use my current location'}
        </button>
        <div className="form-row">
          <div className="form-group"><label>Latitude</label><input type="number" step="any" value={form.storeLat} onChange={e=>set('storeLat',Number(e.target.value))}/></div>
          <div className="form-group"><label>Longitude</label><input type="number" step="any" value={form.storeLng} onChange={e=>set('storeLng',Number(e.target.value))}/></div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sHead}>Base fee tiers</h2>
        <div className="form-row">
          <div className="form-group"><label>Base fee (₦) — covers 0 to X km</label><input type="number" value={form.baseFee} onChange={e=>set('baseFee',Number(e.target.value))}/></div>
          <div className="form-group"><label>Base distance limit (km)</label><input type="number" value={form.baseFeeMaxKm} onChange={e=>set('baseFeeMaxKm',Number(e.target.value))}/></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Per-km charge (₦) beyond base distance</label><input type="number" value={form.perKmRate} onChange={e=>set('perKmRate',Number(e.target.value))}/></div>
          <div className="form-group"><label>Max delivery radius (km)</label><input type="number" value={form.maxRadiusKm} onChange={e=>set('maxRadiusKm',Number(e.target.value))}/></div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sHead}>Peak hour settings</h2>
        <div className="form-row">
          <div className="form-group"><label>Peak hour surcharge (₦)</label><input type="number" value={form.peakHourSurcharge} onChange={e=>set('peakHourSurcharge',Number(e.target.value))}/></div>
          <div className="form-group"><label>Peak hours (comma-separated, e.g. 07:00-09:00)</label><input value={Array.isArray(form.peakHours)?form.peakHours.join(','):form.peakHours} onChange={e=>set('peakHours',e.target.value.split(',').map(s=>s.trim()))}/></div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sHead}>Free delivery</h2>
        <div className="form-group" style={{ maxWidth:320 }}><label>Free delivery threshold — order value (₦)</label><input type="number" value={form.freeDeliveryThreshold} onChange={e=>set('freeDeliveryThreshold',Number(e.target.value))}/></div>
        <p style={{ fontSize:13, color:'var(--gray-500)' }}>Orders above this value get free delivery automatically. Set to 0 to disable.</p>
      </div>
    </div>
  );
}

const styles = {
  head: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  pageTitle: { fontSize:24, fontWeight:700, color:'var(--gray-700)' },
  preview: { background:'var(--teal-lt)', borderRadius:12, padding:'18px 20px', border:'1px solid rgba(15,110,86,0.15)', marginBottom:20 },
  previewRow: { display:'flex', justifyContent:'space-between', fontSize:14, color:'var(--teal-dk)', marginBottom:7 },
  section: { background:'#fff', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px', marginBottom:16 },
  sHead: { fontSize:16, fontWeight:700, marginBottom:16, color:'var(--gray-700)' },
};
