import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AppIcons } from '../../components/UiIcons';

const EMPTY = { name:'', phone:'+234 ', email:'', vehicle:'Motorcycle', plateNumber:'', zone:'', isActive:true };
const ZONES = ['Ikeja','Lekki','Surulere','Victoria Island','Yaba','Gbagada','Ajah','Isale Eko','Other'];

export default function RidersCMS() {
  const [riders, setRiders] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/admin/riders').then(({data}) => setRiders(data)).catch(()=>{});
  useEffect(() => { load(); }, []);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const openAdd = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (r) => { setForm(r); setEditing(r._id); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.zone) return toast.error('Name, phone, zone required');
    setLoading(true);
    try {
      if (editing) await api.put(`/admin/riders/${editing}`, form);
      else await api.post('/admin/riders', form);
      toast.success(editing?'Rider updated':'Rider added'); setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this rider?')) return;
    await api.delete(`/admin/riders/${id}`);
    toast.success('Rider removed'); load();
  };

  const showToken = async (id) => {
    try {
      const { data } = await api.get(`/admin/riders/${id}/token`);
      window.prompt(`Tracking token for ${data.name} — give this to their tracking device/app:`, data.accessToken);
    } catch { toast.error('Failed to fetch token'); }
  };

  const STATUS_BADGE = { available:'badge-success', on_delivery:'badge-warning', offline:'badge-gray' };
  const STATUS_LABEL = { available:'Available', on_delivery:'On delivery', offline:'Offline' };
  const MapPinIcon = AppIcons.mapPin;
  const PackageIcon = AppIcons.package;
  const LogOutIcon = AppIcons.logOut;

  return (
    <div>
      <div style={styles.head}>
        <h1 style={styles.pageTitle}>Riders & Delivery Zones</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add rider</button>
      </div>

      <div style={styles.grid}>
        {riders.map(r => (
          <div key={r._id} style={styles.card}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div style={{ ...styles.avatar, background: r.status==='available'?'var(--teal)':r.status==='on_delivery'?'var(--amber)':'var(--gray-500)' }}>{r.name[0]}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{r.name}</div>
                <div style={{ fontSize:13, color:'var(--gray-500)' }}>{r.vehicle} · {r.plateNumber}</div>
              </div>
            </div>
            <div style={styles.info}><MapPinIcon size={14} /><span>{r.zone}</span></div>
            <div style={styles.info}><span>Phone</span><span>{r.phone}</span></div>
            <div style={styles.info}><PackageIcon size={14} /><span>{r.totalDeliveries} deliveries</span></div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14 }}>
              <span className={`badge ${STATUS_BADGE[r.status]||'badge-gray'}`}>{STATUS_LABEL[r.status]||r.status}</span>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-sm" onClick={()=>openEdit(r)}>Edit</button>
                <button className="btn btn-sm" onClick={()=>showToken(r._id)} title="Get this rider's tracking token">Token</button>
                <button className="btn btn-sm btn-danger" onClick={()=>handleDelete(r._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHead}><h2 style={{ fontSize:18, fontWeight:700 }}>{editing?'Edit':'Add'} rider</h2><button style={styles.closeBtn} onClick={()=>setModal(false)}>✕</button></div>
            <div className="form-row">
              <div className="form-group"><label>Full name</label><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Emmanuel Kehinde"/></div>
              <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+234 803 123 4567"/></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Vehicle type</label><select value={form.vehicle} onChange={e=>set('vehicle',e.target.value)}><option>Motorcycle</option><option>Bicycle</option><option>Car</option></select></div>
              <div className="form-group"><label>Plate number</label><input value={form.plateNumber} onChange={e=>set('plateNumber',e.target.value)} placeholder="LAG-234-AB"/></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Delivery zone</label><select value={form.zone} onChange={e=>set('zone',e.target.value)}>{ZONES.map(z=><option key={z}>{z}</option>)}</select></div>
              <div className="form-group"><label>Email (optional)</label><input value={form.email} onChange={e=>set('email',e.target.value)} placeholder="rider@email.com"/></div>
            </div>
            <label style={{ display:'flex', gap:8, alignItems:'center', fontSize:14, marginBottom:16, cursor:'pointer' }}>
              <input type="checkbox" checked={form.isActive} onChange={e=>set('isActive',e.target.checked)}/> Active
            </label>
            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button className="btn" onClick={()=>setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading?'Saving…':'Save rider'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  head: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  pageTitle: { fontSize:24, fontWeight:700, color:'var(--gray-700)' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 },
  card: { background:'#fff', borderRadius:12, border:'1px solid var(--gray-200)', padding:'18px' },
  avatar: { width:44, height:44, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff' },
  info: { display:'flex', gap:8, fontSize:13, color:'var(--gray-500)', marginBottom:6 },
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:20 },
  modal: { background:'#fff', borderRadius:16, width:'100%', maxWidth:560, padding:'24px', maxHeight:'90vh', overflowY:'auto' },
  modalHead: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  closeBtn: { background:'var(--gray-100)', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:16 },
};
