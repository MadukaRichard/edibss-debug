import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { AppIcons } from '../../components/UiIcons';

export default function Dashboard() {
  const [stats, setStats] = useState({ ordersToday:0, revenueToday:0, activeRiders:0, avgDeliveryTime:0 });
  const [orders, setOrders] = useState([]);
  const PackageIcon = AppIcons.package;
  const MoneyIcon = AppIcons.payment;
  const BikeIcon = AppIcons.riders;
  const ClockIcon = AppIcons.clock;

  useEffect(() => {
    api.get('/admin/orders/stats').then(({data}) => setStats(data)).catch(()=>{});
    api.get('/admin/orders?limit=5').then(({data}) => setOrders(data.orders||[])).catch(()=>{});
  }, []);

  const cards = [
    { label:'Orders today', value: stats.ordersToday, Icon: PackageIcon, color:'var(--teal)' },
    { label:'Revenue today', value: `₦${(stats.revenueToday||0).toLocaleString()}`, Icon: MoneyIcon, color:'var(--amber)' },
    { label:'Active riders', value: stats.activeRiders, Icon: BikeIcon, color:'var(--coral)' },
    { label:'Avg delivery', value: `${stats.avgDeliveryTime} min`, Icon: ClockIcon, color:'#6B4EFF' },
  ];

  const STATUS_BADGE = { pending:'badge-gray', confirmed:'badge-teal', preparing:'badge-warning', in_transit:'badge-warning', delivered:'badge-success', cancelled:'badge-danger' };

  return (
    <div>
      <h1 style={styles.pageTitle}>Dashboard</h1>
      <div style={styles.statGrid}>
        {cards.map(c => (
          <div key={c.label} style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: c.color+'20', color: c.color }}><c.Icon size={20} /></div>
            <div style={styles.statNum}>{c.value}</div>
            <div style={styles.statLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Recent orders</h2>
        <table style={styles.table}>
          <thead><tr style={styles.thead}>
            <th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th>
          </tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id} style={styles.tr}>
                <td style={{ fontWeight:600 }}>#{o.orderNumber}</td>
                <td>{o.customer?.name}</td>
                <td>{o.items?.length} item{o.items?.length!==1?'s':''}</td>
                <td style={{ fontWeight:600, color:'var(--teal)' }}>₦{o.total?.toLocaleString()}</td>
                <td><span className={`badge ${STATUS_BADGE[o.status]}`}>{o.status?.replace('_',' ')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  pageTitle: { fontSize:24, fontWeight:700, color:'var(--gray-700)', marginBottom:24 },
  statGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16, marginBottom:24 },
  statCard: { background:'#fff', borderRadius:12, border:'1px solid var(--gray-200)', padding:'20px', display:'flex', flexDirection:'column', gap:8 },
  statIcon: { width:44, height:44, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 },
  statNum: { fontSize:28, fontWeight:700, color:'var(--gray-700)' },
  statLabel: { fontSize:13, color:'var(--gray-500)' },
  card: { background:'#fff', borderRadius:12, border:'1px solid var(--gray-200)', padding:'20px' },
  cardTitle: { fontSize:16, fontWeight:700, marginBottom:16, color:'var(--gray-700)' },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { background:'var(--gray-50)' },
  tr: { borderBottom:'1px solid var(--gray-100)' },
};
