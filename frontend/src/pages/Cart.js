import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { AppIcons, CategoryIcon } from '../components/UiIcons';

export default function Cart() {
  const { items, updateQty, removeItem, total, count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const CartIcon = AppIcons.cart;

  if (items.length === 0) return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <div style={{ fontSize:56, marginBottom:16 }}><CartIcon size={56} /></div>
      <h2 style={{ fontSize:22, marginBottom:8 }}>Your cart is empty</h2>
      <p style={{ color:'var(--gray-500)', marginBottom:24 }}>Add some products to get started</p>
      <Link to="/products" className="btn btn-primary">Browse products</Link>
    </div>
  );

  return (
    <div className="container" style={{ padding:'40px 20px' }}>
      <h1 style={{ fontSize:26, fontWeight:700, marginBottom:28 }}>Your cart ({count} items)</h1>
      <div className="cart-grid" style={styles.grid}>
        <div>
          {items.map(item => (
            <div key={item._id} style={styles.item}>
              <div style={styles.itemImg}><CategoryIcon category={item.category} size={30} /></div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:600, color:'var(--gray-700)' }}>{item.name}</div>
                <div style={{ fontSize:14, color:'var(--teal)', fontWeight:600, marginTop:2 }}>₦{item.price.toLocaleString()}</div>
              </div>
              <div style={styles.qtyWrap}>
                <button style={styles.qBtn} onClick={() => updateQty(item._id, item.quantity-1)}>−</button>
                <span style={{ fontWeight:600, minWidth:20, textAlign:'center' }}>{item.quantity}</span>
                <button style={styles.qBtn} onClick={() => updateQty(item._id, item.quantity+1)}>+</button>
              </div>
              <div style={{ fontSize:15, fontWeight:700, minWidth:90, textAlign:'right' }}>₦{(item.price*item.quantity).toLocaleString()}</div>
              <button style={styles.remove} onClick={() => removeItem(item._id)}>✕</button>
            </div>
          ))}
        </div>
        <div style={styles.summary}>
          <h3 style={{ fontSize:16, fontWeight:700, marginBottom:18 }}>Order summary</h3>
          <div style={styles.sumRow}><span>Subtotal</span><span>₦{total.toLocaleString()}</span></div>
          <div style={styles.sumRow}><span>Delivery fee</span><span style={{ color:'var(--gray-500)', fontSize:13 }}>Calculated at checkout</span></div>
          <div style={{ ...styles.sumRow, fontWeight:700, fontSize:17, borderTop:'1.5px solid var(--gray-200)', paddingTop:14, marginTop:8 }}>
            <span>Total (exc. delivery)</span><span style={{ color:'var(--teal)' }}>₦{total.toLocaleString()}</span>
          </div>
          <button className="btn btn-primary btn-full btn-lg" style={{ marginTop:18 }}
            onClick={() => user ? navigate('/checkout') : navigate('/login')}>
            {user ? 'Proceed to checkout' : 'Sign in to checkout'}
          </button>
          <Link to="/products" style={{ display:'block', textAlign:'center', marginTop:12, fontSize:14, color:'var(--teal)' }}>Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid: { display:'grid', gridTemplateColumns:'1fr 360px', gap:28, alignItems:'start' },
  // responsive overrides applied via className="cart-grid" / "checkout-grid" / "product-grid" in global.css
  item: { display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom:'1px solid var(--gray-200)' },
  itemImg: { width:60, height:60, borderRadius:10, background:'var(--teal-lt)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  qtyWrap: { display:'flex', alignItems:'center', gap:10, background:'var(--gray-100)', borderRadius:8, padding:'4px 10px' },
  qBtn: { width:26, height:26, background:'#fff', border:'1px solid var(--gray-200)', borderRadius:6, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' },
  remove: { background:'none', border:'none', color:'var(--gray-500)', cursor:'pointer', fontSize:16, padding:4 },
  summary: { background:'#fff', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px 20px', position:'sticky', top:80 },
  sumRow: { display:'flex', justifyContent:'space-between', fontSize:14, color:'var(--gray-700)', marginBottom:10 },
};
