import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import DeliveryFeeWidget from '../components/DeliveryFeeWidget';
import api, { apiUpload } from '../services/api';
import toast from 'react-hot-toast';
import { AppIcons, CategoryIcon } from '../components/UiIcons';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [feeData, setFeeData] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [form, setForm] = useState({ address: user?.address || '', notes: '', paymentMethod: 'cash' });
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const MapPinIcon = AppIcons.mapPin;
  const LocateIcon = AppIcons.locateFixed;
  const ClockIcon = AppIcons.clock;
  const ArrowRightIcon = AppIcons.arrowRight;

  const needsPrescription = items.some(i => i.requiresPrescription);

  const detectLocation = () => {
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setDetecting(false); },
      () => { toast.error('Could not detect location. Please enter address manually.'); setDetecting(false); }
    );
  };

  useEffect(() => { detectLocation(); }, []);

  useEffect(() => {
    api.get('/site-content').then(({ data }) => { if (data.bankDetails) setBankDetails(data.bankDetails); }).catch(() => {});
  }, []);

  const placeOrder = async () => {
    if (!location.lat) return toast.error('Please allow location access');
    if (!form.address.trim()) return toast.error('Please enter delivery address');
    if (!feeData) return toast.error('Delivery fee not yet calculated');
    if (needsPrescription && !prescriptionFile) return toast.error('Please upload a prescription for the item(s) that require one');
    setLoading(true);
    try {
      const itemsPayload = items.map(i => ({ product: i._id, name: i.name, price: i.price, quantity: i.quantity }));
      let data;
      if (prescriptionFile) {
        const fd = new FormData();
        fd.append('items', JSON.stringify(itemsPayload));
        fd.append('deliveryAddress', form.address);
        fd.append('deliveryLocation', JSON.stringify(location));
        fd.append('paymentMethod', form.paymentMethod);
        fd.append('notes', form.notes);
        fd.append('prescriptionImage', prescriptionFile);
        ({ data } = await apiUpload('/orders', fd));
      } else {
        ({ data } = await api.post('/orders', {
          items: itemsPayload,
          deliveryAddress: form.address,
          deliveryLocation: location,
          paymentMethod: form.paymentMethod,
          notes: form.notes
        }));
      }
      clearCart();
      toast.success(`Order ${data.orderNumber} placed!`);
      navigate(`/track/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:28 }}>Checkout</h1>
      <div className="checkout-grid" style={styles.grid}>
        <div>
          <div style={styles.section}>
            <h3 style={styles.sHead}><MapPinIcon size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Delivery location</h3>
            <button className="btn btn-outline" onClick={detectLocation} disabled={detecting} style={{ marginBottom:14 }}>
              <LocateIcon size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />{detecting ? 'Detecting…' : 'Use my current location'}
            </button>
            {location.lat && <div style={styles.locTag}>✅ Location detected ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})</div>}
            <div className="form-group">
              <label>Delivery address</label>
              <input placeholder="e.g. 14 Adeola Street, Ikeja, Lagos" value={form.address} onChange={e => setForm(f=>({...f,address:e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Note for rider (optional)</label>
              <input placeholder="Gate color, landmark, building floor…" value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} />
            </div>
          </div>

          {needsPrescription && (
            <div style={styles.section}>
              <h3 style={styles.sHead}>Prescription required</h3>
              <p style={{ fontSize:13, color:'var(--gray-500)', marginBottom:10 }}>One or more items in your cart require a valid prescription. Please upload a photo or PDF.</p>
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e => setPrescriptionFile(e.target.files[0] || null)} />
              {prescriptionFile && <div style={{ fontSize:13, color:'var(--teal)', marginTop:8 }}>✅ {prescriptionFile.name} selected</div>}
            </div>
          )}

          <div style={styles.section}>
            <h3 style={styles.sHead}>Payment method</h3>
            {['cash','card','bank_transfer'].map(m => (
              <label key={m} style={styles.radio}>
                <input type="radio" name="payment" value={m} checked={form.paymentMethod===m} onChange={() => setForm(f=>({...f,paymentMethod:m}))} />
                <span>{m==='bank_transfer'?'Bank transfer (manual confirmation)':m==='card'?'Card on delivery':'Cash on delivery'}</span>
              </label>
            ))}
            {form.paymentMethod === 'bank_transfer' && (
              <div style={styles.bankBox}>
                {bankDetails?.accountNumber ? (
                  <>
                    <div style={styles.bankRow}><span>Bank</span><strong>{bankDetails.bankName}</strong></div>
                    <div style={styles.bankRow}><span>Account number</span><strong>{bankDetails.accountNumber}</strong></div>
                    <div style={styles.bankRow}><span>Account name</span><strong>{bankDetails.accountName}</strong></div>
                    <p style={{ fontSize:12, color:'var(--gray-500)', marginTop:10 }}>{bankDetails.note || 'Please transfer the exact total and use your order number as reference.'}</p>
                    <p style={{ fontSize:12, color:'var(--amber)', marginTop:6 }}>Your order will be marked "Awaiting payment confirmation" until an admin confirms your transfer - a rider is only assigned after that.</p>
                  </>
                ) : (
                  <p style={{ fontSize:13, color:'var(--gray-500)' }}>Bank transfer details aren't set up yet — please choose another payment method or contact support.</p>
                )}
              </div>
            )}
          </div>

          {location.lat && (
            <div style={styles.section}>
              <h3 style={styles.sHead}>Delivery fee</h3>
              <DeliveryFeeWidget customerLat={location.lat} customerLng={location.lng} subtotal={total} onFeeCalculated={setFeeData} />
            </div>
          )}
        </div>

        <div style={styles.summary}>
          <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Order summary</h3>
          {items.map(i => (
            <div key={i._id} style={styles.orderItem}>
              <span><CategoryIcon category={i.category} size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />{i.name} ×{i.quantity}</span>
              <span style={{ fontWeight:600 }}>₦{(i.price*i.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div style={styles.div} />
          <div style={styles.sumRow}><span>Subtotal</span><span>₦{total.toLocaleString()}</span></div>
          <div style={styles.sumRow}><span>Delivery fee</span><span style={{ color:'var(--teal)', fontWeight:600 }}>{feeData ? `₦${feeData.fee.toLocaleString()}` : '—'}</span></div>
          <div style={{ ...styles.sumRow, fontWeight:700, fontSize:17, marginTop:8, paddingTop:10, borderTop:'1.5px solid var(--gray-200)' }}>
            <span>Total</span><span style={{ color:'var(--teal)' }}>₦{feeData ? (total+feeData.fee).toLocaleString() : total.toLocaleString()}</span>
          </div>
          {feeData?.estimatedMinutes && <div style={{ fontSize:13, color:'var(--gray-500)', marginTop:8 }}><ClockIcon size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />Est. delivery: {feeData.estimatedMinutes} min</div>}
          <button className="btn btn-primary btn-full btn-lg" style={{ marginTop:20 }} onClick={placeOrder} disabled={loading||!feeData}>
            {loading ? 'Placing order…' : <><ArrowRightIcon size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Place order</>}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid: { display:'grid', gridTemplateColumns:'1fr 340px', gap:28, alignItems:'start' },
  section: { background:'#fff', borderRadius:12, border:'1px solid var(--gray-200)', padding:'20px', marginBottom:16 },
  sHead: { fontSize:15, fontWeight:700, marginBottom:14, color:'var(--gray-700)' },
  locTag: { fontSize:13, color:'var(--teal)', background:'var(--teal-lt)', padding:'6px 12px', borderRadius:8, marginBottom:14 },
  radio: { display:'flex', alignItems:'center', gap:10, padding:'10px 0', fontSize:14, color:'var(--gray-700)', cursor:'pointer', borderBottom:'1px solid var(--gray-100)' },
  bankBox: { marginTop:12, background:'var(--teal-lt)', borderRadius:10, padding:'14px 16px' },
  bankRow: { display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--gray-700)', marginBottom:6 },
  summary: { background:'#fff', borderRadius:12, border:'1px solid var(--gray-200)', padding:'24px 20px', position:'sticky', top:80 },
  orderItem: { display:'flex', justifyContent:'space-between', fontSize:14, color:'var(--gray-700)', marginBottom:8 },
  div: { height:1, background:'var(--gray-200)', margin:'12px 0' },
  sumRow: { display:'flex', justifyContent:'space-between', fontSize:14, color:'var(--gray-700)', marginBottom:8 },
};
