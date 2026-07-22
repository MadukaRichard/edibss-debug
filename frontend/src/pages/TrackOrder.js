import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LiveMap from '../components/LiveMap';
import OrderTracker from '../components/OrderTracker';
import { useOrderTracking } from '../hooks/useSocket';
import api from '../services/api';
import { AppIcons } from '../components/UiIcons';

export default function TrackOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [riderLoc, setRiderLoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState(null);
  const MapIcon = AppIcons.map;
  const ClockIcon = AppIcons.clock;
  const orderSkeletonRows = Array.from({ length: 3 });

  useEffect(() => {
    if (!id) return;
    
    const fetchOrder = () => {
      api.get(`/orders/${id}`).then(({ data }) => {
        setOrder(data);
        if (data.riderLocation?.lat) setRiderLoc(data.riderLocation);
      }).catch(() => {});
    };

    // Initial load
    fetchOrder().finally(() => setLoading(false));

    // Backup polling every 8 seconds so it updates automatically even if sockets lag
    const intervalId = setInterval(fetchOrder, 8000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [id]);

  useEffect(() => {
    api.get('/site-content').then(({ data }) => { if (data.bankDetails) setBankDetails(data.bankDetails); }).catch(() => {});
  }, []);

  useOrderTracking(
    id,
    ({ lat, lng }) => setRiderLoc({ lat, lng }),
    ({ status }) => setOrder(o => o ? { ...o, status } : o)
  );

  if (loading) return (
    <div className="container" style={{ padding:'40px 20px' }}>
      <div style={styles.head}>
        <div>
          <div className="skeleton skeleton-text" style={{ width:180, height:26, marginBottom:8 }} />
          <div className="skeleton skeleton-text" style={{ width:240, height:12 }} />
        </div>
        <div className="skeleton skeleton-text" style={{ width:140, height:32, borderRadius:999 }} />
      </div>

      <div className="skeleton-card" style={{ marginTop:20 }}>
        <div className="skeleton skeleton-text" style={{ width:150, height:18, marginBottom:16 }} />
        <div className="skeleton" style={{ height: 260, borderRadius: 12 }} />
      </div>

      {orderSkeletonRows.map((_, idx) => (
        <div key={idx} className="skeleton-card" style={{ marginTop:20 }}>
          <div className="skeleton skeleton-text" style={{ width:140, height:18, marginBottom:14 }} />
          <div className="skeleton skeleton-text" style={{ width:'100%', height: idx === 0 ? 84 : 120, marginBottom: idx === 2 ? 0 : 14 }} />
        </div>
      ))}
    </div>
  );
  if (!order) return <div style={{ textAlign:'center', padding:60 }}>Order not found. Please check the ID.</div>;

  const STATUS_LABEL = { pending_payment:'Awaiting payment confirmation', pending:'Pending', confirmed:'Order confirmed', preparing:'Preparing your items', in_transit:'Rider on the way', delivered:'Delivered!', cancelled:'Cancelled' };

  return (
    <div className="container" style={{ padding:'40px 20px' }}>
      <div style={styles.head}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700 }}>Order #{order.orderNumber}</h1>
          <p style={{ color:'var(--gray-500)', fontSize:14, marginTop:4 }}>Placed {new Date(order.createdAt).toLocaleString('en-NG')}</p>
        </div>
        <span className={`badge badge-${order.status==='delivered'?'success':order.status==='cancelled'?'danger':'warning'}`} style={{ fontSize:13, padding:'6px 14px' }}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <OrderTracker status={order.status} />

      {order.status === 'pending_payment' && bankDetails?.accountNumber && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}><ClockIcon size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Awaiting your bank transfer</h3>
          <p style={{ fontSize:13, color:'var(--gray-500)', marginBottom:12 }}>
            Transfer ₦{order.total.toLocaleString()} to the account below, using your order number <strong>#{order.orderNumber}</strong> as reference.
            Your rider will be assigned as soon as an admin confirms the payment.
          </p>
          <div style={styles.itemRow}><span>Bank</span><strong>{bankDetails.bankName}</strong></div>
          <div style={styles.itemRow}><span>Account number</span><strong>{bankDetails.accountNumber}</strong></div>
          <div style={styles.itemRow}><span>Account name</span><strong>{bankDetails.accountName}</strong></div>
        </div>
      )}

      {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'pending_payment' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}><MapIcon size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Delivery map</h3>
          {order.rider ? (
            <>
              <LiveMap riderLocation={riderLoc} customerLocation={order.deliveryLocation} height={300} />
              <div style={styles.riderRow}>
                <div style={styles.avatar}>{order.rider.name[0]}</div>
                <div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{order.rider.name}</div>
                  <div style={{ fontSize:12, color:'var(--gray-500)' }}>{order.rider.vehicle} · {order.rider.phone}</div>
                </div>
                <a href={`tel:${order.rider.phone}`} className="btn btn-sm" style={{ marginLeft:'auto' }}>Call</a>
              </div>
            </>
          ) : (
            <div style={styles.noRider}>
              <MapIcon size={22} />
              <span>A rider will be assigned to your order shortly. You'll see live tracking here once that happens.</span>
            </div>
          )}
        </div>
      )}

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Order details</h3>
        {order.items.map((item, i) => (
          <div key={i} style={styles.itemRow}>
            <span>{item.name} ×{item.quantity}</span>
            <span style={{ fontWeight:600 }}>₦{(item.price*item.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div style={styles.divider} />
        <div style={styles.itemRow}><span>Subtotal</span><span>₦{order.subtotal.toLocaleString()}</span></div>
        <div style={styles.itemRow}><span>Delivery fee</span><span>₦{order.deliveryFee.toLocaleString()}</span></div>
        <div style={{ ...styles.itemRow, fontWeight:700, fontSize:16 }}><span>Total</span><span style={{ color:'var(--teal)' }}>₦{order.total.toLocaleString()}</span></div>
        <div style={styles.addr}><MapIcon size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />{order.deliveryAddress}</div>
      </div>
    </div>
  );
}

const styles = {
  head: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 },
  card: { background:'#fff', border:'1px solid var(--gray-200)', borderRadius:12, padding:'20px', marginTop:20 },
  cardTitle: { fontSize:15, fontWeight:700, marginBottom:16, color:'var(--gray-700)' },
  riderRow: { display:'flex', alignItems:'center', gap:12, marginTop:16, padding:'12px 0', borderTop:'1px solid var(--gray-200)' },
  noRider: { display:'flex', alignItems:'center', gap:12, padding:'20px', background:'var(--gray-50)', borderRadius:10, color:'var(--gray-500)', fontSize:13 },
  avatar: { width:38, height:38, borderRadius:'50%', background:'var(--teal)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:15, flexShrink:0 },
  itemRow: { display:'flex', justifyContent:'space-between', fontSize:14, color:'var(--gray-700)', marginBottom:8 },
  divider: { height:1, background:'var(--gray-200)', margin:'12px 0' },
  addr: { fontSize:13, color:'var(--gray-500)', marginTop:10 },
};
