import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppIcons, NavIconMap } from '../components/UiIcons';

const NAV = [
  { path:'/admin', label:'Dashboard', icon:'dashboard' },
  { path:'/admin/products', label:'Products', icon:'products' },
  { path:'/admin/orders', label:'Orders', icon:'orders' },
  { path:'/admin/riders', label:'Riders', icon:'riders' },
  { path:'/admin/reviews', label:'Reviews', icon:'reviews' },
  { path:'/admin/hero', label:'Hero / Banner', icon:'hero' },
  { path:'/admin/fee-rules', label:'Delivery fees', icon:'feeRules' },
  { path:'/admin/payment-settings', label:'Payment settings', icon:'payment' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const LogoIcon = AppIcons.logo;
  const LogOutIcon = AppIcons.logOut;

  if (!user || user.role !== 'admin') return (
    <div style={{ textAlign:'center', padding:60 }}>
      <h2>Access denied</h2><p style={{ marginTop:8, color:'var(--gray-500)' }}>Admin only area.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop:20 }}>Go home</Link>
    </div>
  );

  return (
    <div style={styles.wrap}>
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ ...styles.sidebar, width: collapsed ? 64 : 220 }}>
        <div style={styles.sideHead}>
          {!collapsed && <span className="admin-sidebar-label" style={styles.sideLogo}><LogoIcon size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />MediRun Admin</span>}
          <button className="admin-collapse-btn" style={styles.collapseBtn} onClick={() => setCollapsed(c=>!c)}>{collapsed?'→':'←'}</button>
        </div>
        <nav style={{ flex:1 }}>
          {NAV.map(n => (
            <Link key={n.path} to={n.path} style={{ ...styles.navItem, ...(pathname===n.path ? styles.navActive : {}) }}>
              {React.createElement(NavIconMap[n.icon], { size: 18 })}
              {!collapsed && <span className="admin-sidebar-label" style={{ fontSize:14 }}>{n.label}</span>}
            </Link>
          ))}
        </nav>
        <div style={styles.sideFooter}>
          {!collapsed && <div className="admin-sidebar-label" style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginBottom:8 }}>{user.name}</div>}
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/'); }}>
            <LogOutIcon size={16} />{!collapsed && <span className="admin-sidebar-label" style={{ fontSize:13 }}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.topBar}>
          <Link to="/" style={{ fontSize:13, color:'var(--gray-500)' }}>← Back to store</Link>
        </div>
        <div className="admin-content" style={styles.content}>{children}</div>
      </main>
    </div>
  );
}

const styles = {
  wrap: { display:'flex', minHeight:'100vh' },
  sidebar: { background:'#0F6E56', display:'flex', flexDirection:'column', transition:'width 0.2s', flexShrink:0, position:'sticky', top:0, height:'100vh', overflow:'hidden' },
  sideHead: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)' },
  sideLogo: { fontSize:15, fontWeight:700, color:'#fff', whiteSpace:'nowrap' },
  collapseBtn: { background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', borderRadius:6, width:28, height:28, cursor:'pointer', flexShrink:0 },
  navItem: { display:'flex', alignItems:'center', gap:12, padding:'11px 16px', color:'rgba(255,255,255,0.75)', transition:'all 0.15s', borderLeft:'3px solid transparent', textDecoration:'none', whiteSpace:'nowrap', overflow:'hidden' },
  navActive: { background:'rgba(255,255,255,0.15)', color:'#fff', borderLeftColor:'#fff' },
  sideFooter: { padding:'16px', borderTop:'1px solid rgba(255,255,255,0.1)' },
  logoutBtn: { display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.1)', border:'none', color:'rgba(255,255,255,0.8)', borderRadius:8, padding:'8px 12px', cursor:'pointer', width:'100%' },
  main: { flex:1, display:'flex', flexDirection:'column', minWidth:0, background:'var(--gray-50)' },
  topBar: { background:'#fff', borderBottom:'1px solid var(--gray-200)', padding:'12px 28px', display:'flex', alignItems:'center' },
  content: { padding:'28px', flex:1 },
};
