import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AppIcons } from '../components/UiIcons';

const STATUS_BADGE = { pending_payment:'badge-warning', pending:'badge-gray', confirmed:'badge-teal', preparing:'badge-warning', in_transit:'badge-warning', delivered:'badge-success', cancelled:'badge-danger' };
const STATUS_LABEL = { pending_payment:'Awaiting payment', pending:'Pending', confirmed:'Confirmed', preparing:'Preparing', in_transit:'In transit', delivered:'Delivered', cancelled:'Cancelled' };

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const PackageIcon = AppIcons.package;
  const skeletonRows = Array.from({ length: 4 });

  useEffect(() => {
    api.get('/orders/my-orders').then(({ data }) => setOrders(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="container" style={{ padding:'40px 20px' }}>
      <div className="skeleton skeleton-text" style={{ width:160, height:24, marginBottom:28 }} />
      {skeletonRows.map((_, idx) => (
        <div key={idx} className="skeleton-card" style={{ display:'flex', alignItems:'center', gap:20, marginBottom:10, flexWrap:'wrap' }}>
          <div style={{ flex:'1 1 220px' }}>
            <div className="skeleton skeleton-text" style={{ width:90, marginBottom:8 }} />
            <div className="skeleton skeleton-text" style={{ width:140, height:10 }} />
          </div>
          <div className="skeleton skeleton-text" style={{ width:70, height:12 }} />
          <div className="skeleton skeleton-text" style={{ width:100, height:16 }} />
          <div className="skeleton skeleton-text" style={{ width:88, height:24, borderRadius:999 }} />
          <div className="skeleton skeleton-text" style={{ width:86, height:32, borderRadius:8, marginLeft:'auto' }} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="container" style={{ padding:'40px 20px' }}>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:28 }}>My orders</h1>
      {orders.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:'var(--gray-500)' }}>
          <div style={{ fontSize:48, marginBottom:12 }}><PackageIcon size={48} /></div>
          <p>No orders yet. <Link to="/products" style={{ color:'var(--teal)' }}>Start shopping</Link></p>
        </div>
      ) : orders.map(o => (
        <div key={o._id} style={styles.row}>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>#{o.orderNumber}</div>
            <div style={{ fontSize:13, color:'var(--gray-500)', marginTop:2 }}>{new Date(o.createdAt).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</div>
          </div>
          <div style={{ fontSize:14, color:'var(--gray-500)' }}>{o.items.length} item{o.items.length!==1?'s':''}</div>
          <div style={{ fontWeight:700, fontSize:15, color:'var(--teal)' }}>₦{o.total.toLocaleString()}</div>
          <span className={`badge ${STATUS_BADGE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
          <Link to={`/track/${o._id}`} className="btn btn-sm">Track →</Link>
        </div>
      ))}
    </div>
  );
}

const styles = {
  row: { display:'flex', alignItems:'center', gap:20, background:'#fff', border:'1px solid var(--gray-200)', borderRadius:12, padding:'16px 20px', marginBottom:10, flexWrap:'wrap' },
};
