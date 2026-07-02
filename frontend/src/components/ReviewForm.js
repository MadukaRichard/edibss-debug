import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ReviewForm({ productId, onSubmitted }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return (
    <div style={styles.wrap}>
      <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Please <a href="/login" style={{ color: 'var(--teal)', fontWeight: 500 }}>sign in</a> to leave a review.</p>
    </div>
  );

  const handleSubmit = async () => {
    if (!rating) return toast.error('Please select a star rating');
    if (!comment.trim()) return toast.error('Please write a comment');
    setLoading(true);
    try {
      await api.post('/reviews', { productId, rating, comment });
      toast.success('Review submitted! It will appear after moderation.');
      setRating(0); setComment('');
      onSubmitted && onSubmitted();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.wrap}>
      <h3 style={styles.title}>Write a review</h3>
      <div style={styles.stars}>
        {[1,2,3,4,5].map(n => (
          <span key={n} style={{ fontSize: 28, cursor: 'pointer', color: n <= (hovered || rating) ? 'var(--amber)' : 'var(--gray-200)', transition: 'color 0.1s' }}
            onClick={() => setRating(n)} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}>★</span>
        ))}
        {rating > 0 && <span style={{ fontSize: 13, color: 'var(--gray-500)', marginLeft: 8 }}>{['','Poor','Fair','Good','Very good','Excellent'][rating]}</span>}
      </div>
      <textarea style={styles.textarea} placeholder="Share your experience with this product or the delivery…" value={comment} onChange={e => setComment(e.target.value)} rows={4} />
      <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: 12 }}>
        {loading ? 'Submitting…' : '📤 Submit review'}
      </button>
    </div>
  );
}

const styles = {
  wrap: { background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '20px', marginTop: 20 },
  title: { fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--gray-700)' },
  stars: { display: 'flex', alignItems: 'center', marginBottom: 14, gap: 2 },
  textarea: { width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, resize: 'vertical', outline: 'none', fontFamily: 'var(--font)', color: 'var(--gray-700)' },
};
