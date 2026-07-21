import React, { useEffect, useState } from 'react';
import api, { apiUpload, API_ORIGIN } from '../../services/api';
import toast from 'react-hot-toast';

export default function CategoriesCMS() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    api.get('/admin/site-content').then(({data}) => {
      const catEntry = data.find(d => d.key === 'categoryOrder');
      if (catEntry?.value) {
        // Auto-upgrade old text categories to new image-supported objects!
        const formatted = catEntry.value.map(c => typeof c === 'string' ? { name: c, image: '' } : c);
        setCategories(formatted);
      }
    }).catch(()=>{});
  };

  const handleSave = async (catsToSave = categories) => {
    // Prevent saving empty categories
    const clean = catsToSave.filter(c => c.name.trim() !== '');
    
    setLoading(true);
    try {
      await api.put('/admin/site-content/categoryOrder', { value: clean, label: 'Categories' });
      setCategories(clean);
      toast.success('Categories saved!');
    } catch (err) { 
      toast.error('Failed to save categories'); 
    } finally { 
      setLoading(false); 
    }
  };

  const addCategory = () => {
    setCategories([...categories, { name: '', image: '' }]);
  };

  const updateCat = (idx, field, val) => {
    const updated = [...categories];
    updated[idx][field] = val;
    setCategories(updated);
  };

  const removeCategory = (idx) => {
    if(!window.confirm('Delete this category? (Products inside will not be deleted)')) return;
    const updated = [...categories];
    updated.splice(idx, 1);
    setCategories(updated); // Update UI
  };

  const moveUp = (i) => {
    if(i === 0) return;
    const updated = [...categories];
    [updated[i-1], updated[i]] = [updated[i], updated[i-1]];
    setCategories(updated);
  };

  const moveDown = (i) => {
    if(i === categories.length - 1) return;
    const updated = [...categories];
    [updated[i], updated[i+1]] = [updated[i+1], updated[i]];
    setCategories(updated);
  };

  const handleImageUpload = async (file, idx) => {
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const { data } = await apiUpload('/admin/upload', (() => { const fd = new FormData(); fd.append('file', file); return fd; })());
      updateCat(idx, 'image', `${API_ORIGIN}${data.url}`);
      toast.success('Icon uploaded');
    } catch (err) { 
      toast.error('Upload failed'); 
    } finally { 
      setUploadingIdx(null); 
    }
  };

  return (
    <div>
      <div style={styles.head}>
        <div>
          <h1 style={styles.pageTitle}>Manage Categories</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 4 }}>Add, edit, delete, and upload custom icons for your store categories.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleSave()} disabled={loading}>
          {loading ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>

      <div style={styles.card}>
        {categories.map((cat, i) => (
          <div key={i} style={styles.catRow}>
            {/* Image Preview & Upload */}
            <div style={styles.imgBox}>
              {cat.image ? (
                <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ fontSize: 11, color: 'var(--gray-500)', textAlign: 'center' }}>No<br/>Icon</div>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 200 }}>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/webp, image/svg+xml" 
                onChange={e => handleImageUpload(e.target.files[0], i)} 
                style={{ fontSize: 11 }}
              />
              {uploadingIdx === i && <span style={{ fontSize: 11, color: 'var(--teal)' }}>Uploading...</span>}
            </div>

            {/* Category Name Input */}
            <input 
              value={cat.name} 
              onChange={e => updateCat(i, 'name', e.target.value)}
              placeholder="e.g. Puff, Drinks, First Aid"
              style={styles.input}
            />

            {/* Actions */}
            <div style={{ display:'flex', gap:6, marginLeft: 'auto' }}>
              <button className="btn btn-sm" onClick={()=>moveUp(i)} disabled={i===0} title="Move Up">↑</button>
              <button className="btn btn-sm" onClick={()=>moveDown(i)} disabled={i===categories.length-1} title="Move Down">↓</button>
              <button className="btn btn-sm btn-danger" onClick={()=>removeCategory(i)} title="Delete">✕</button>
            </div>
          </div>
        ))}

        <div style={{ padding: 20 }}>
          <button className="btn btn-outline" onClick={addCategory}>+ Add New Category</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  head: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 },
  pageTitle: { fontSize:24, fontWeight:700, color:'var(--gray-700)' },
  card: { background:'#fff', borderRadius:12, border:'1px solid var(--gray-200)', overflow:'hidden' },
  catRow: { display:'flex', alignItems:'center', gap:16, padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', background: 'var(--gray-50)' },
  imgBox: { width: 50, height: 50, borderRadius: 8, background: '#fff', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 4 },
  input: { flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--gray-300)', fontSize: 15, fontWeight: 500, fontFamily: 'var(--font)', minWidth: 200 }
};