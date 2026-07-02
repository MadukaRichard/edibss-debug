import React from 'react';

export default function ReviewCard({ review }) {
  const initials = review.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
  const colors = ['#E1F5EE','#FAEEDA','#FAECE7','#E8EBF5','#F0EDE8'];
  const textColors = ['#085041','#633806','#4A1B0C','#1D2D5E','#4A3728'];
  const idx = review.name.charCodeAt(0) % colors.length;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={{ ...styles.avatar, background: colors[idx], color: textColors[idx] }}>{initials}</div>
        <div style={{ flex: 1 }}>
          <div style={styles.name}>{review.name} <span style={styles.phone}>{review.phone}</span></div>
          <div className="stars" style={{ fontSize: 13 }}>{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</div>
        </div>
        <span style={styles.date}>{new Date(review.createdAt).toLocaleDateString('en-NG',{ day:'numeric', month:'short' })}</span>
      </div>
      <p style={styles.text}>{review.comment}</p>
      {review.verifiedPurchase && <span className="badge badge-teal" style={{ marginTop: 8, fontSize: 10 }}>✓ Verified purchase</span>}
    </div>
  );
}

const styles = {
  card: { background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: 12 },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 },
  name: { fontSize: 14, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 2 },
  phone: { fontSize: 12, color: 'var(--gray-500)', fontWeight: 400, marginLeft: 6 },
  text: { fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.6 },
  date: { fontSize: 12, color: 'var(--gray-500)', flexShrink: 0 },
};
