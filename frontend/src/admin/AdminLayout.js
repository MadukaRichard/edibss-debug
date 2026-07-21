import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppIcons, NavIconMap } from '../components/UiIcons';

// --- ADDED THE CATEGORIES LINK TO THIS LIST ---
const NAV = [
  { path:'/admin', label:'Dashboard', icon:'dashboard' },
  { path:'/admin/products', label:'Products', icon:'products' },
  { path:'/admin/categories', label:'Categories', icon:'dashboard' }, // <-- NEW CATEGORIES TAB
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
  
  // Mobile responsiveness state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const LogoIcon = AppIcons.logo;
  const LogOutIcon = AppIcons.logOut;
  const MenuIcon = AppIcons.menu;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMobileDrawerOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user || user.role !== 'admin') return (
    <div style={{ textAlign:'center', padding:60 }}>
      <h2>Access denied</h2><p style={{ marginTop:8, color:'var(--gray-500)' }}>Admin only area.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop:20 }}>Go home</Link>
    </div>
  );

  const sidebarActive = isMobile ? mobileDrawerOpen : true;
  const sidebarWidth = isMobile ? 260 : (collapsed ? 64 : 220);

  return (
    <div style={styles.wrap}>
      {/* Mobile Dark Overlay */}
      {isMobile && mobileDrawerOpen && (
        <div 
          style={styles.mobileOverlay} 
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ 
        ...styles.sidebar, 
        width: sidebarWidth,
        transform: isMobile && !mobileDrawerOpen ? 'translateX(-100%)' : 'translateX(0)',
        position: isMobile ? 'fixed' : 'sticky',
        zIndex: isMobile ? 1000 : 1
      }}>
        <div style={styles.sideHead}>
          {(!collapsed || isMobile) && <span className="admin-sidebar-label" style={styles.sideLogo}><LogoIcon size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />MediRun Admin</span>}
          {!isMobile && (
            <button className="admin-collapse-btn" style={styles.collapseBtn} onClick={() => setCollapsed(c=>!c)}>{collapsed?'→':'←'}</button>
          )}
        </div>
        <nav style={{ flex:1, overflowY: 'auto' }}>
          {NAV.map(n => {
            const isActive = pathname === n.path;
            return (
              <Link 
                key={n.path} 
                to={n.path} 
                onClick={() => isMobile && setMobileDrawerOpen(false)}
                style={{ 
                  ...styles.navItem, 
                  ...(isActive ? styles.navActive : {}) 
                }}
              >
                {React.createElement(NavIconMap[n.icon], { size: 18 })}
                {(!collapsed || isMobile) && <span className="admin-sidebar-label" style={{ fontSize:14 }}>{n.label}</span>}
              </Link>
            )
          })}
        </nav>
        <div style={styles.sideFooter}>
          {(!collapsed || isMobile) && <div className="admin-sidebar-label" style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginBottom:8 }}>{user.name}</div>}
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/'); }}>
            <LogOutIcon size={16} />{(!collapsed || isMobile) && <span className="admin-sidebar-label" style={{ fontSize:13 }}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.topBar}>
          {isMobile && (
            <button 
              onClick={() => setMobileDrawerOpen(true)} 
              style={styles.hamburgerBtn}
            >
              <MenuIcon size={24} />
            </button>
          )}
          <Link to="/" style={{ fontSize:13, color:'var(--gray-500)', marginLeft: isMobile ? 16 : 0 }}>← Back to store</Link>
        </div>
        <div className="admin-content" style={styles.content}>{children}</div>
      </main>
    </div>
  );
}

const styles = {
  wrap: { display:'flex', minHeight:'100vh', position: 'relative' },
  mobileOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 },
  sidebar: { background:'#0F6E56', display:'flex', flexDirection:'column', transition:'transform 0.3s ease, width 0.2s', flexShrink:0, top:0, height:'100vh', overflow:'hidden' },
  sideHead: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)' },
  sideLogo: { fontSize:15, fontWeight:700, color:'#fff', whiteSpace:'nowrap' },
  collapseBtn: { background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', borderRadius:6, width:28, height:28, cursor:'pointer', flexShrink:0 },
  navItem: { display:'flex', alignItems:'center', gap:12, padding:'11px 16px', color:'rgba(255,255,255,0.75)', transition:'all 0.15s', borderLeft:'3px solid transparent', textDecoration:'none', whiteSpace:'nowrap', overflow:'hidden' },
  navActive: { background:'rgba(255,255,255,0.15)', color:'#fff', borderLeft:'3px solid #fff' },
  sideFooter: { padding:'16px', borderTop:'1px solid rgba(255,255,255,0.1)' },
  logoutBtn: { display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.1)', border:'none', color:'rgba(255,255,255,0.8)', borderRadius:8, padding:'8px 12px', cursor:'pointer', width:'100%' },
  main: { flex:1, display:'flex', flexDirection:'column', minWidth:0, background:'var(--gray-50)' },
  topBar: { background:'#fff', borderBottom:'1px solid var(--gray-200)', padding:'12px 28px', display:'flex', alignItems:'center' },
  hamburgerBtn: { background: 'none', border: 'none', color: 'var(--gray-700)', cursor: 'pointer', display: 'flex', padding: 0 },
  content: { padding: '24px clamp(16px, 4vw, 28px)', flex:1, overflowX: 'hidden' }, 
};