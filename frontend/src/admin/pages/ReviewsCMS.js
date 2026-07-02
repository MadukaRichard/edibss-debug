import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ReviewsCMS() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const q = filter ? `?status=${filter}` : '';
    api.get(`/admin/reviews${q}`).then(({data}) => setReviews(data)).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status) => {
    try { await api.put(`/admin/reviews/${id}/status`, { status }); toast.success('Review updated'); load(); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    await api.delete(`/admin/reviews/${id}`);
    toast.success('Deleted'); load();
  };

  const STATUS_BADGE = { pending:'badge-warning', approved:'badge-success', hidden:'badge-gray' };

  return (
    <div>
      <div style={styles.head}>
        <h1 style={styles.pageTitle}>Reviews & Users</h1>
        <select style={{ padding:'8px 12px', borderRadius:8, border:'1.5px solid var(--gray-200)', fontSize:14 }} value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="">All reviews</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : (
        <div style={styles.card}>
          <table style={styles.table}>
            <thead><tr style={styles.thRow}>{['Customer','Phone','Product','Stars','Comment','Status','Actions'].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r._id} style={styles.tr}>
                  <td style={styles.td}><strong>{r.name}</strong></td>
                  <td style={styles.td}><span style={{ fontSize:12 }}>{r.phone}</span></td>
                  <td style={styles.td}><span style={{ fontSize:13 }}>{r.product?.name}</span></td>
                  <td style={styles.td}><span style={{ color:'var(--amber)' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span></td>
                  <td style={{ ...styles.td, maxWidth:220 }}><span style={{ fontSize:13, color:'var(--gray-500)' }}>{r.comment?.slice(0,80)}{r.comment?.length>80?'…':''}</span></td>
                  <td style={styles.td}><span className={`badge ${STATUS_BADGE[r.status]}`}>{r.status}</span></td>
                  <td style={styles.td}>
                    <div style={{ display:'flex', gap:6 }}>
                      {r.status !== 'approved' && <button className="btn btn-sm btn-primary" style={{ fontSize:12 }} onClick={()=>updateStatus(r._id,'approved')}>✓ Approve</button>}
                      {r.status === 'approved' && <button className="btn btn-sm" style={{ fontSize:12 }} onClick={()=>updateStatus(r._id,'hidden')}>Hide</button>}
                      <button className="btn btn-sm btn-danger" style={{ fontSize:12 }} onClick={()=>handleDelete(r._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
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
  table: { width:'100%', borderCollapse:'collapse', minWidth:800 },
  thRow: { background:'var(--gray-50)' },
  th: { padding:'11px 14px', textAlign:'left', fontSize:13, fontWeight:600, color:'var(--gray-500)' },
  tr: { borderBottom:'1px solid var(--gray-100)' },
  td: { padding:'12px 14px', fontSize:14 },
};
