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
  
  // States for standard vs variant vs custom items
  const [qty, setQty] = useState(1);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const CartIcon = AppIcons.cart;
  const reviewSkeletons = Array.from({ length: 3 });

  useEffect(() => {
    Promise.all([api.get(`/products/${id}`), api.get(`/reviews/product/${id}`)]).then(([p, r]) => {
      setProduct(p.data);
      setReviews(r.data);
      
      // Auto-select the first variant if the product has them (e.g. 50cl drink)
      if (p.data.variants && p.data.variants.length > 0) {
        setSelectedVariant(p.data.variants[0]);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const refreshReviews = () => {
    api.get(`/reviews/product/${id}`).then(r => setReviews(r.data));
  };

  const handleAddToCart = () => {
    if (product.variants?.length > 0) {
      // If it's a Drink/Variant item, add the specific selected variant
      // We pass the variant name to the cart so the customer knows what size they bought
      addItem({ ...product, name: `${product.name} (${selectedVariant.name})`, price: selectedVariant.price }, qty);
      toast.success(`${qty}× ${selectedVariant.name} ${product.name} added to cart`);
    } else if (product.allowCustomAmount) {
      // If it's a bulk/custom item (like loose herbs)
      const amount = parseFloat(customAmount);
      if (!amount || amount <= 0) return toast.error('Please enter a valid amount');
      
      // Calculate total price for this custom chunk
      const customPrice = amount * product.price; 
      addItem({ ...product, name: `${amount}${product.unit} ${product.name}`, price: customPrice }, 1);
      toast.success(`${amount}${product.unit} of ${product.name} added to cart`);
      setCustomAmount(''); // clear input after adding
    } else {
      // Standard fixed item (like a pack of pills)
      addItem(product, qty);
      toast.success(`${qty}× ${product.name} added to cart`);
    }
  };

  if (loading) return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div className="product-detail-grid" style={styles.grid}>
        <div style={styles.imgWrap}><div className="skeleton" style={{ height: 320 }} /></div>
        <div><div className="skeleton skeleton-text" style={{ width:110, marginBottom: 12 }} /><div className="skeleton skeleton-text" style={{ width:'85%', height: 28, marginBottom: 12 }} /><div className="skeleton skeleton-text" style={{ width:180, marginBottom: 14 }} /><div className="skeleton skeleton-text" style={{ width:120, height: 32, marginBottom: 14 }} /><div className="skeleton skeleton-text" style={{ width:'100%', height: 72, marginBottom: 20 }} /><div className="skeleton skeleton-text" style={{ width:180, height: 44, marginBottom: 16, borderRadius: 8 }} /><div className="skeleton skeleton-text" style={{ width:'45%', height: 14 }} /></div>
      </div>
      {/* ... Skeleton Reviews Code Omitted for Brevity ... */}
    </div>
  );
  
  if (!product) return <div style={{ textAlign:'center', padding:60 }}>Product not found.</div>;

  // Calculate what price to display on the page
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div className="product-detail-grid" style={styles.grid}>
        {/* Image */}
        <div style={styles.imgWrap}>
          {product.image ? (
            <img src={product.image} alt={product.name} style={{ width:'100%', height: '100%', objectFit: 'contain', padding: 24, mixBlendMode: 'multiply' }} />
          ) : (
            <div style={styles.imgPlaceholder}><CategoryIcon category={product.category} size={84} /></div>
          )}
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
          
          {/* Price Logic */}
          <div style={styles.price}>
            ₦{displayPrice.toLocaleString()} 
            {product.allowCustomAmount && !selectedVariant && <span style={{ fontSize: 16, color: 'var(--gray-500)', fontWeight: 500 }}> / {product.unit}</span>}
          </div>
          
          <p style={styles.desc}>{product.description}</p>
          {product.requiresPrescription && <div className="alert alert-error" style={{ marginBottom:16 }}>⚠ Prescription required for this product</div>}
          
          {/* --- THE NEW LOGIC UI --- */}
          <div style={{ marginBottom:20 }}>
            {/* SCENARIO 1: DRINKS/VARIANTS */}
            {product.variants?.length > 0 ? (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Select Size</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {product.variants.map((v, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setSelectedVariant(v)}
                      style={{ 
                        ...styles.variantBtn, 
                        borderColor: selectedVariant?.name === v.name ? 'var(--teal)' : 'var(--gray-200)',
                        background: selectedVariant?.name === v.name ? 'var(--teal-lt)' : '#fff',
                        color: selectedVariant?.name === v.name ? 'var(--teal-dk)' : 'var(--gray-700)',
                      }}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
                
                {/* Quantity selector for drinks */}
                <div style={{ display:'flex', alignItems:'center', gap:12, marginTop: 16 }}>
                  <div style={styles.qtyWrap}>
                    <button style={styles.qtyBtn} onClick={() => setQty(q => Math.max(1,q-1))}>−</button>
                    <span style={{ fontSize:16, fontWeight:600, width:28, textAlign:'center' }}>{qty}</span>
                    <button style={styles.qtyBtn} onClick={() => setQty(q => q+1)}>+</button>
                  </div>
                </div>
              </div>
            
            // SCENARIO 2: CUSTOM MANUAL INPUT (e.g. Kush)
            ) : product.allowCustomAmount ? (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Enter Amount ({product.unit})</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0.1"
                    placeholder="e.g. 2.5" 
                    value={customAmount} 
                    onChange={e => setCustomAmount(e.target.value)}
                    style={styles.customInput}
                  />
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-500)' }}>{product.unit}</span>
                </div>
                {customAmount > 0 && (
                  <div style={{ fontSize: 14, color: 'var(--teal)', fontWeight: 600, marginTop: 8 }}>
                    Total: ₦{(parseFloat(customAmount) * product.price).toLocaleString()}
                  </div>
                )}
              </div>

            // SCENARIO 3: STANDARD FIXED ITEMS (e.g. Pills)
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={styles.qtyWrap}>
                  <button style={styles.qtyBtn} onClick={() => setQty(q => Math.max(1,q-1))}>−</button>
                  <span style={{ fontSize:16, fontWeight:600, width:28, textAlign:'center' }}>{qty}</span>
                  <button style={styles.qtyBtn} onClick={() => setQty(q => q+1)}>+</button>
                </div>
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <button className="btn btn-primary btn-full btn-lg" disabled={product.stock===0} onClick={handleAddToCart}>
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
  imgWrap: { borderRadius:12, overflow:'hidden', border:'1px solid var(--gray-200)', background: 'var(--gray-50)', height: '100%', maxHeight: 450 },
  imgPlaceholder: { height:320, background:'var(--teal-lt)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:12 },
  name: { fontSize:28, fontWeight:700, color:'var(--gray-700)', marginBottom:10, lineHeight:1.3 },
  price: { fontSize:30, fontWeight:700, color:'var(--teal)', marginBottom:14 },
  desc: { fontSize:15, color:'var(--gray-500)', lineHeight:1.7, marginBottom:20 },
  
  qtyWrap: { display:'flex', alignItems:'center', gap:12, border:'1.5px solid var(--gray-200)', borderRadius:8, padding:'4px 8px', background:'#fff' },
  qtyBtn: { width:32, height:32, border:'none', background:'var(--gray-100)', borderRadius:6, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  
  // New Styles for Variants and Custom Inputs
  variantBtn: { padding: '10px 16px', borderRadius: 8, border: '2px solid', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font)' },
  customInput: { width: 120, padding: '12px 14px', borderRadius: 8, border: '1.5px solid var(--gray-300)', fontSize: 16, fontWeight: 600, fontFamily: 'var(--font)' },
  
  meta: { fontSize:13, color:'var(--gray-500)', marginTop:14 },
};