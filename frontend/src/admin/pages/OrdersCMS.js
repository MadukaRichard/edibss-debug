import React, { useEffect, useState } from 'react';
import api, { API_ORIGIN } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['','pending_payment','pending','confirmed','preparing','in_transit','delivered','cancelled'];
const STATUS_BADGE = { pending_payment:'badge-warning', pending:'badge-gray', confirmed:'badge-teal', preparing:'badge-warning', in_transit:'badge-warning', delivered:'badge-success', cancelled:'badge-danger' };
const PAYMENT_BADGE = { unpaid:'badge-gray', awaiting_confirmation:'badge-warning', paid:'badge-success' };
const PAYMENT_LABEL = { unpaid:'Unpaid', awaiting_confirmation:'Awaiting confirmation', paid:'Paid' };

export default function OrdersCMS() {
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const [assigning, setAssigning] = useState(null);
  const [pickedRider, setPickedRider] = useState({});

  const load = () => {
    setLoading(true);
    const q = filter ? `?status=${filter}` : '';
    api.get(`/admin/orders${q}`).then(({data}) => setOrders(data.orders||[])).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(() => { load(); }, [filter]);
  useEffect(() => { api.get('/admin/riders').then(({data}) => setRiders(data)).catch(()=>{}); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      toast.success('Status updated');
      load();
    } catch { toast.error('Failed to update'); }
  };

  const confirmPayment = async (id) => {
    if (!window.confirm('Confirm that this bank transfer has actually been received? You can then assign a rider.')) return;
    setConfirming(id);
    try {
      await api.put(`/admin/orders/${id}/confirm-payment`);
      toast.success('Payment confirmed');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to confirm payment'); }
    finally { setConfirming(null); }
  };

  // Riders assign manually here — no live GPS "nearest rider" matching. Pick
  // whichever available rider makes sense (e.g. covers the customer's zone).
  const assignRider = async (id) => {
    const riderId = pickedRider[id];
    if (!riderId) return toast.error('Choose a rider first');
    setAssigning(id);
    try {
      await api.put(`/admin/orders/${id}/assign-rider`, { riderId });
      toast.success('Rider assigned');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to assign rider'); }
    finally { setAssigning(null); }
  };

  return (
    <div>
      <div style={styles.head}>
        <h1 style={styles.pageTitle}>Orders & Tracking</h1>
        <select style={{ padding:'8px 12px', borderRadius:8, border:'1.5px solid var(--gray-200)', fontSize:14 }} value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.filter(Boolean).map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
      </div>

      {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : (
        <div style={styles.card}>
          <table style={styles.table}>
            <thead><tr style={styles.thRow}>
              {['Order #','Customer','Phone','Items','Total','Delivery fee','Status','Payment','Rider','Update status','Actions',''].map(h=>(
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {orders.map(o => {
                const canAssign = o.status!=='delivered' && o.status!=='cancelled' && !(o.paymentMethod==='bank_transfer' && o.paymentStatus!=='paid');
                const availableRiders = riders.filter(r => r.isActive && (r.status==='available' || r._id===o.rider?._id));
                return (
                <React.Fragment key={o._id}>
                  <tr style={styles.tr}>
                    <td style={styles.td}><strong>#{o.orderNumber}</strong></td>
                    <td style={styles.td}>{o.customer?.name}</td>
                    <td style={styles.td}>{o.customer?.phone}</td>
                    <td style={styles.td}>{o.items?.length}</td>
                    <td style={styles.td}><strong style={{ color:'var(--teal)' }}>₦{o.total?.toLocaleString()}</strong></td>
                    <td style={styles.td}>₦{o.deliveryFee?.toLocaleString()}</td>
                    <td style={styles.td}><span className={`badge ${STATUS_BADGE[o.status]}`}>{o.status?.replace('_',' ')}</span></td>
                    <td style={styles.td}><span className={`badge ${PAYMENT_BADGE[o.paymentStatus]||'badge-gray'}`}>{PAYMENT_LABEL[o.paymentStatus]||o.paymentStatus}</span></td>
                    <td style={styles.td}>
                      {o.rider ? (
                        <span style={{ fontSize:13 }}>{o.rider.name}</span>
                      ) : canAssign ? (
                        <div style={{ display:'flex', gap:6 }}>
                          <select style={{ fontSize:12, padding:'4px 6px', borderRadius:6, border:'1px solid var(--gray-200)', maxWidth:120 }}
                            value={pickedRider[o._id]||''} onChange={e=>setPickedRider(p=>({...p,[o._id]:e.target.value}))}>
                            <option value="">Choose rider…</option>
                            {availableRiders.map(r=><option key={r._id} value={r._id}>{r.name} ({r.zone})</option>)}
                          </select>
                          <button className="btn btn-sm btn-primary" disabled={assigning===o._id} onClick={()=>assignRider(o._id)}>
                            {assigning===o._id?'…':'Assign'}
                          </button>
                        </div>
                      ) : <span style={{ fontSize:12, color:'var(--gray-500)' }}>—</span>}
                    </td>
                    <td style={styles.td}>
                      <select style={{ fontSize:13, padding:'4px 8px', borderRadius:6, border:'1px solid var(--gray-200)' }}
                        value={o.status} onChange={e=>updateStatus(o._id,e.target.value)}>
                        {STATUS_OPTIONS.filter(Boolean).map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
                      </select>
                    </td>
                    <td style={styles.td}>
                      {o.paymentMethod === 'bank_transfer' && o.paymentStatus === 'awaiting_confirmation' && (
                        <button className="btn btn-sm btn-primary" disabled={confirming===o._id} onClick={()=>confirmPayment(o._id)}>
                          {confirming===o._id ? 'Confirming…' : '✅ Confirm payment'}
                        </button>
                      )}
                    </td>
                    <td style={styles.td}><button className="btn btn-sm" onClick={()=>setExpanded(expanded===o._id?null:o._id)}>Details</button></td>
                  </tr>
                  {expanded===o._id && (
                    <tr><td colSpan={12} style={{ padding:'12px 20px', background:'var(--gray-50)', fontSize:13, color:'var(--gray-700)' }}>
                      <strong>Address:</strong> {o.deliveryAddress} &nbsp;|&nbsp;
                      <strong>Payment method:</strong> {o.paymentMethod?.replace('_',' ')} &nbsp;|&nbsp;
                      <strong>Est. time:</strong> {o.estimatedDeliveryTime} min &nbsp;|&nbsp;
                      {o.notes && <><strong>Note:</strong> {o.notes} &nbsp;|&nbsp;</>}
                      {o.prescriptionImage && <a href={`${API_ORIGIN}${o.prescriptionImage}`} target="_blank" rel="noreferrer">View prescription</a>}
                      <div style={{ marginTop:8 }}>{o.items?.map((i,idx)=><span key={idx} style={{ marginRight:12 }}>• {i.name} ×{i.quantity} — ₦{(i.price*i.quantity)?.toLocaleString()}</span>)}</div>
                    </td></tr>
                  )}
                </React.Fragment>
              );})}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  head: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  pageTitle: { fontSize:24, fontWeight:700, color:'var(--gray-700)' },
  card: { background:'#fff', borderRadius:12, border:'1px solid var(--gray-200)', overflow:'auto' },
  table: { width:'100%', borderCollapse:'collapse', minWidth:1250 },
  thRow: { background:'var(--gray-50)' },
  th: { padding:'11px 14px', textAlign:'left', fontSize:13, fontWeight:600, color:'var(--gray-500)', whiteSpace:'nowrap' },
  tr: { borderBottom:'1px solid var(--gray-100)' },
  td: { padding:'12px 14px', fontSize:14 },
};
