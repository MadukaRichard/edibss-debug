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
      
      {/* Upgraded to auto-fit for responsive stretching */}
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
        {/* Added Scrollable Wrapper for tables */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Order</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Items</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight:600 }}>#{o.orderNumber}</td>
                  <td style={styles.td}>{o.customer?.name}</td>
                  <td style={styles.td}>{o.items?.length} item{o.items?.length!==1?'s':''}</td>
                  <td style={{ ...styles.td, fontWeight:600, color:'var(--teal)' }}>₦{o.total?.toLocaleString()}</td>
                  <td style={styles.td}><span className={`badge ${STATUS_BADGE[o.status]}`}>{o.status?.replace('_',' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageTitle: { fontSize:24, fontWeight:700, color:'var(--gray-700)', marginBottom:24 },
  // FIX: Changed auto-fill to auto-fit so it stretches to fill empty space
  statGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:16, marginBottom:24 },
  statCard: { background:'#fff', borderRadius:12, border:'1px solid var(--gray-200)', padding:'20px', display:'flex', flexDirection:'column', gap:8 },
  statIcon: { width:44, height:44, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 },
  statNum: { fontSize:28, fontWeight:700, color:'var(--gray-700)' },
  statLabel: { fontSize:13, color:'var(--gray-500)' },
  card: { background:'#fff', borderRadius:12, border:'1px solid var(--gray-200)', padding:'20px' },
  cardTitle: { fontSize:16, fontWeight:700, marginBottom:16, color:'var(--gray-700)' },
  // FIX: Added horizontal scroll wrapper to prevent UI squishing on mobile
  tableWrapper: { overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' },
  table: { width:'100%', borderCollapse:'collapse', minWidth: '600px' }, // Enforce minimum width
  thead: { background:'var(--gray-50)' },
  th: { padding: '12px 16px', textAlign: 'left', color: 'var(--gray-500)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }, // Prevent text wrapping
  tr: { borderBottom:'1px solid var(--gray-100)' },
  td: { padding: '16px', fontSize: 14, whiteSpace: 'nowrap' }, // Prevent text wrapping
};