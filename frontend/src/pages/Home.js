import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { AppIcons, CategoryIcon } from '../components/UiIcons';

const CATS = ['All','Medicines','Devices','Baby Care','Vitamins','First Aid','Diagnostics'];
export default function Home() {
  const [products, setProducts] = useState([]);
  const [cat, setCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState({
    headline: 'Medicines & health products, at your door in 30 min',
    subheadline: 'Licensed pharmacy partners, real-time rider GPS, AI-calculated delivery fees.',
    badge: 'Fast health delivery',
    cta: 'Shop now',
    background: null // Added this to track the dynamic background
  });
  const LightningIcon = AppIcons.clock;
  const skeletonCards = Array.from({ length: 8 });

  useEffect(() => {
    api.get('/site-content').then(({ data }) => {
      // This will now successfully pull in headline, subheadline, AND background!
      if (data.hero) setHero(h => ({ ...h, ...data.hero }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = cat !== 'All' ? `?category=${cat}` : '';
    api.get(`/products${params}`).then(({ data }) => {
      setProducts(data.products);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [cat]);

  return (
    <div>
      {/* FIX: Dynamically applying the background from the database, falling back to styles.hero */}
      <div style={{ ...styles.hero, ...(hero.background || hero.bgColor ? { background: hero.background || hero.bgColor } : {}) }}>
        <div className="container">
          <div className="badge badge-teal" style={{ marginBottom: 16, fontSize: 13 }}><LightningIcon size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />{hero.badge}</div>
          {/* FIX: Ensure your Admin CMS is saving text under the exact keys "headline" and "subheadline" */}
          <h1 style={styles.h1}>{hero.headline}</h1>
          <p style={styles.sub}>{hero.subheadline}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary btn-lg">{hero.cta}</Link>
            <Link to="/track" className="btn btn-outline btn-lg">Track an order</Link>
          </div>
          <div style={styles.stats}>
            <div style={styles.stat}><strong>30 min</strong><span>avg delivery</span></div>
            <div style={styles.statDiv} />
            <div style={styles.stat}><strong>500+</strong><span>products</span></div>
            <div style={styles.statDiv} />
            <div style={styles.stat}><strong>Licensed</strong><span>pharmacists</span></div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        {/* Categories */}
        <div style={styles.cats}>
          {CATS.map(c => (
            <button key={c} style={{ ...styles.cat, ...(cat===c ? styles.catActive : {}) }} onClick={() => setCat(c)}>
              <CategoryIcon category={c} size={22} />
              <span style={{ fontSize: 12 }}>{c}</span>
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="section-head">
          <h2>{cat === 'All' ? 'All products' : cat}</h2>
          <Link to="/products">See all →</Link>
        </div>

        {loading ? (
          <div style={styles.grid} aria-busy="true" aria-live="polite">
            {skeletonCards.map((_, idx) => (
              <div key={idx} className="skeleton-card">
                <div className="skeleton" style={styles.skelImage} />
                <div style={styles.skelBody}>
                  <div className="skeleton skeleton-text" style={styles.skelLineLg} />
                  <div className="skeleton skeleton-text" style={styles.skelLineSm} />
                  <div className="skeleton skeleton-text" style={styles.skelLineMd} />
                  <div style={styles.skelFooter}>
                    <div className="skeleton skeleton-text" style={styles.skelPrice} />
                    <div className="skeleton skeleton-text" style={styles.skelButton} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 40 }}>No products found</div>
        ) : (
          <div style={styles.grid}>
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  hero: { background: 'linear-gradient(135deg, #E1F5EE 0%, #F0FAF6 100%)', padding: '60px 0 48px', borderBottom: '1px solid var(--gray-200)' },
  h1: { fontSize: 'clamp(26px,4vw,44px)', fontWeight: 700, color: 'var(--gray-700)', lineHeight: 1.2, marginBottom: 16, maxWidth: 640 },
  sub: { fontSize: 16, color: 'var(--gray-500)', marginBottom: 28, maxWidth: 520 },
  stats: { display: 'flex', alignItems: 'center', gap: 24, marginTop: 36 },
  stat: { display: 'flex', flexDirection: 'column', gap: 2 },
  statDiv: { width: 1, height: 32, background: 'var(--gray-200)' },
  cats: { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, marginBottom: 32 },
  cat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--gray-200)', background: '#fff', cursor: 'pointer', minWidth: 76, transition: 'all 0.15s', whiteSpace: 'nowrap', fontFamily: 'var(--font)' },
  catActive: { background: 'var(--teal-lt)', borderColor: 'var(--teal)', color: 'var(--teal-dk)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 },
  skelImage: { height: 120, width: '100%', borderRadius: 0 },
  skelBody: { padding: '14px 14px 12px' },
  skelLineLg: { width: '78%', height: 14, borderRadius: 999, marginBottom: 6 },
  skelLineSm: { width: '52%', height: 10, borderRadius: 999, marginBottom: 12 },
  skelLineMd: { width: '88%', height: 12, borderRadius: 999, marginBottom: 12 },
  skelFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  skelPrice: { width: 70, height: 15, borderRadius: 999 },
  skelButton: { width: 58, height: 30, borderRadius: 8 },
};