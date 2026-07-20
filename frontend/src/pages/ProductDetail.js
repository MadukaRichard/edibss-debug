import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AppIcons, CategoryIcon } from '../components/UiIcons';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const CartIcon = AppIcons.cart;
  const reviewSkeletons = Array.from({ length: 3 });

  useEffect(() => {
    Promise.all([api.get(`/products/${id}`), api.get(`/reviews/product/${id}`)]).then(([p, r]) => {
      setProduct(p.data);
      setReviews(r.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const refreshReviews = () => {
    api.get(`/reviews/product/${id}`).then(r => setReviews(r.data));
  };

  if (loading) return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div className="product-detail-grid" style={styles.grid}>
        <div style={styles.imgWrap}>
          <div className="skeleton" style={{ height: 320 }} />
        </div>
        <div>
          <div className="skeleton skeleton-text" style={{ width:110, marginBottom: 12 }} />
          <div className="skeleton skeleton-text" style={{ width:'85%', height: 28, marginBottom: 12 }} />
          <div className="skeleton skeleton-text" style={{ width:180, marginBottom: 14 }} />
          <div className="skeleton skeleton-text" style={{ width:120, height: 32, marginBottom: 14 }} />
          <div className="skeleton skeleton-text" style={{ width:'100%', height: 72, marginBottom: 20 }} />
          <div className="skeleton skeleton-text" style={{ width:180, height: 44, marginBottom: 16, borderRadius: 8 }} />
          <div className="skeleton skeleton-text" style={{ width:'45%', height: 14 }} />
        </div>
      </div>

      <div style={{ marginTop:48 }}>
        <div className="skeleton skeleton-text" style={{ width:220, height:22, marginBottom:20 }} />
        {reviewSkeletons.map((_, idx) => (
          <div key={idx} className="skeleton-card" style={{ marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
              <div className="skeleton skeleton-circle" style={{ width:38, height:38 }} />
              <div style={{ flex:1 }}>
                <div className="skeleton skeleton-text" style={{ width:'35%', marginBottom:8 }} />
                <div className="skeleton skeleton-text" style={{ width:120, height:10 }} />
              </div>
              <div className="skeleton skeleton-text" style={{ width:70, height:12 }} />
            </div>
            <div className="skeleton skeleton-text" style={{ width:'92%', marginBottom:8 }} />
            <div className="skeleton skeleton-text" style={{ width:'75%' }} />
          </div>
        ))}
        <div className="skeleton-card" style={{ marginTop: 12 }}>
          <div className="skeleton skeleton-text" style={{ width:160, height:20, marginBottom:14 }} />
          <div className="skeleton skeleton-text" style={{ width:'100%', height: 120, marginBottom: 14 }} />
          <div className="skeleton skeleton-text" style={{ width:160, height: 42, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
  if (!product) return <div style={{ textAlign:'center', padding:60 }}>Product not found.</div>;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div className="product-detail-grid" style={styles.grid}>
        {/* Image */}
        <div style={styles.imgWrap}>
          {product.image ? <img src={product.image} alt={product.name} style={{ width:'100%', borderRadius:12 }} /> : <div style={styles.imgPlaceholder}><CategoryIcon category={product.category} size={84} /></div>}
        </div>

        {/* Info */}
        <div>
          <div className="badge badge-gray" style={{ marginBottom: 10 }}>{product.category}</div>
          <h1 style={styles.name}>{product.name}</h1>
          {product.reviewCount > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <span className="stars">{'★'.repeat(Math.round(product.averageRating))}</span>
              <span style={{ fontSize:14, color:'var(--gray-500)' }}>{product.averageRating} ({product.reviewCount} reviews)</span>
            </div>
          )}
          <div style={styles.price}>₦{product.price.toLocaleString()}</div>
          <p style={styles.desc}>{product.description}</p>
          {product.requiresPrescription && <div className="alert alert-error" style={{ marginBottom:16 }}>⚠ Prescription required for this product</div>}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={styles.qtyWrap}>
              <button style={styles.qtyBtn} onClick={() => setQty(q => Math.max(1,q-1))}>−</button>
              <span style={{ fontSize:16, fontWeight:600, width:28, textAlign:'center' }}>{qty}</span>
              <button style={styles.qtyBtn} onClick={() => setQty(q => q+1)}>+</button>
            </div>
          </div>
          <button className="btn btn-primary btn-full btn-lg" disabled={product.stock===0}
            onClick={() => { addItem(product, qty); toast.success(`${qty}× ${product.name} added to cart`); }}>
            {product.stock===0 ? 'Out of stock' : <><CartIcon size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Add to cart</>}
          </button>
          <div style={styles.meta}>
            <span>{product.stock > 0 ? `✅ In stock (${product.stock} left)` : '❌ Out of stock'}</span>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div style={{ marginTop:48 }}>
        <h2 style={{ fontSize:22, fontWeight:700, marginBottom:20 }}>Customer reviews ({reviews.length})</h2>
        {reviews.length === 0 ? <p style={{ color:'var(--gray-500)' }}>No reviews yet. Be the first!</p> : reviews.map(r => <ReviewCard key={r._id} review={r} />)}
        <ReviewForm productId={id} onSubmitted={refreshReviews} />
      </div>
    </div>
  );
}

const styles = {
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, alignItems:'start' },
  imgWrap: { borderRadius:12, overflow:'hidden', border:'1px solid var(--gray-200)' },
  imgPlaceholder: { height:320, background:'var(--teal-lt)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:12 },
  name: { fontSize:28, fontWeight:700, color:'var(--gray-700)', marginBottom:10, lineHeight:1.3 },
  price: { fontSize:30, fontWeight:700, color:'var(--teal)', marginBottom:14 },
  desc: { fontSize:15, color:'var(--gray-500)', lineHeight:1.7, marginBottom:20 },
  qtyWrap: { display:'flex', alignItems:'center', gap:12, border:'1.5px solid var(--gray-200)', borderRadius:8, padding:'4px 8px', background:'#fff' },
  qtyBtn: { width:32, height:32, border:'none', background:'var(--gray-100)', borderRadius:6, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  meta: { fontSize:13, color:'var(--gray-500)', marginTop:14 },
};
