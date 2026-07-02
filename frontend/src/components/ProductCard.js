import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { CategoryIcon } from './UiIcons';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link to={`/products/${product._id}`} style={styles.card}>
      <div style={styles.img}>
        {product.image ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <CategoryIcon category={product.category} size={44} />}
      </div>
      <div style={styles.body}>
        <div style={styles.name}>{product.name}</div>
        <div style={styles.cat}>{product.category}</div>
        {product.reviewCount > 0 && (
          <div style={styles.rating}>
            <span className="stars">{'★'.repeat(Math.round(product.averageRating))}{'☆'.repeat(5-Math.round(product.averageRating))}</span>
            <span style={{ fontSize: 12, color: 'var(--gray-500)', marginLeft: 4 }}>{product.averageRating} ({product.reviewCount})</span>
          </div>
        )}
        <div style={styles.footer}>
          <span style={styles.price}>₦{product.price.toLocaleString()}</span>
          <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={product.stock === 0}>
            {product.stock === 0 ? 'Out' : '+ Add'}
          </button>
        </div>
        {product.stock < 5 && product.stock > 0 && <div style={styles.lowStock}>Only {product.stock} left!</div>}
        {product.requiresPrescription && <div style={styles.rx}>Rx required</div>}
      </div>
    </Link>
  );
}

const styles = {
  card: { display: 'block', background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', overflow: 'hidden', transition: 'box-shadow 0.15s, transform 0.15s', cursor: 'pointer' },
  img: { height: 120, background: 'var(--teal-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  body: { padding: '14px 14px 12px' },
  name: { fontSize: 14, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 3, lineHeight: 1.4 },
  cat: { fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 },
  rating: { display: 'flex', alignItems: 'center', marginBottom: 8 },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  price: { fontSize: 15, fontWeight: 700, color: 'var(--teal)' },
  lowStock: { fontSize: 11, color: 'var(--coral)', marginTop: 6, fontWeight: 500 },
  rx: { fontSize: 11, color: 'var(--amber)', marginTop: 4, fontWeight: 500 },
};
