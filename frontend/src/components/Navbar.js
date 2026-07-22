import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { AppIcons } from './UiIcons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const LogoIcon = AppIcons.logo;
  const CartIcon = AppIcons.cart;
  const MenuIcon = AppIcons.menu;
  const ChevronDownIcon = AppIcons.chevronDown;
  const LogOutIcon = AppIcons.logOut;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoDot}><LogoIcon size={18} color="#fff" /></div>
          <span>MediRun</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="navbar-links" style={styles.links}>
          <Link to="/products" style={styles.link}>Shop</Link>
          {user && <Link to="/orders" style={styles.link}>Track order</Link>}
          {user?.role === 'admin' && <Link to="/admin" style={{ ...styles.link, color: 'var(--coral)' }}>Admin</Link>}
        </div>

        {/* Right Actions: Cart & Desktop User Profile / Sign In */}
        <div className="navbar-actions" style={styles.actions}>
          <Link to="/cart" style={styles.cartBtn}>
            <CartIcon size={16} /> <span>Cart</span> {count > 0 && <span style={styles.badge}>{count}</span>}
          </Link>
          
          {/* Desktop User Menu (Hidden on mobile via CSS) */}
          <div className="desktop-user-container" style={{ position: 'relative' }}>
            {user ? (
              <>
                <button style={styles.userBtn} onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <div style={styles.avatar}>{user.name[0]}</div>
                  <span style={{ fontSize: 14 }}>{user.name.split(' ')[0]}</span> <ChevronDownIcon size={14} />
                </button>
                {userMenuOpen && (
                  <div style={styles.dropdown}>
                    <Link to="/orders" style={styles.dropItem} onClick={() => setUserMenuOpen(false)}>My orders</Link>
                    <button style={{ ...styles.dropItem, color: 'var(--coral)', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }} onClick={handleLogout}><LogOutIcon size={14} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Logout</button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">Sign in</Link>
            )}
          </div>
        </div>

        {/* Hamburger Toggle Button */}
        <button className="navbar-hamburger" style={styles.hamburger} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu"><MenuIcon size={22} /></button>
      </div>

      {/* Mobile Hamburger Menu Dropdown (Includes User Account options here) */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-menu" style={styles.mobileMenu}>
          {user && (
            <div style={styles.mobileUserGreet}>
              <div style={styles.avatar}>{user.name[0]}</div>
              <span style={{ fontWeight: 600, fontSize: 15 }}>Hi, {user.name}</span>
            </div>
          )}
          <Link to="/products" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Shop</Link>
          <Link to="/orders" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Track order</Link>
          {user && <Link to="/orders" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>My orders</Link>}
          {user?.role === 'admin' && <Link to="/admin" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Admin panel</Link>}
          
          {user ? (
            <button style={{ ...styles.mobileLink, color: 'var(--coral)', background: 'none', border: 'none', width: '100%', textAlign: 'left' }} onClick={handleLogout}>Logout</button>
          ) : (
            <Link to="/login" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Sign in / Register</Link>
          )}
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: { background: '#fff', borderBottom: '1.5px solid var(--gray-200)', position: 'sticky', top: 0, zIndex: 100 },
  inner: { display: 'flex', alignItems: 'center', height: 64, gap: 16 },
  logo: { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 18, color: 'var(--teal)' },
  logoDot: { width: 34, height: 34, borderRadius: 10, background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  links: { display: 'flex', gap: 20, marginLeft: 8 },
  link: { fontSize: 14, fontWeight: 500, color: 'var(--gray-500)', transition: 'color 0.15s' },
  actions: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 },
  cartBtn: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: 'var(--gray-700)', padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--gray-200)', position: 'relative' },
  badge: { background: 'var(--teal)', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px solid var(--gray-200)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 14 },
  avatar: { width: 26, height: 26, borderRadius: '50%', background: 'var(--teal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 },
  dropdown: { position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 10, boxShadow: 'var(--shadow)', minWidth: 160, overflow: 'hidden', zIndex: 200 },
  dropItem: { display: 'block', padding: '10px 16px', fontSize: 14, color: 'var(--gray-700)', transition: 'background 0.1s' },
  hamburger: { display: 'none', background: 'none', border: 'none', fontSize: 22, color: 'var(--gray-700)', marginLeft: 4 },
  mobileMenu: { background: '#fff', borderTop: '1px solid var(--gray-200)', padding: '8px 0' },
  mobileUserGreet: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderBottom: '1px solid var(--gray-100)', marginBottom: 4 },
  mobileLink: { display: 'block', padding: '12px 20px', fontSize: 15, color: 'var(--gray-700)', fontWeight: 500, cursor: 'pointer' },
};