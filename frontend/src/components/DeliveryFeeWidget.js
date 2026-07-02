import React, { useEffect, useState } from 'react';
import { useDeliveryFee } from '../hooks/useDeliveryFee';
import { AppIcons } from './UiIcons';

export default function DeliveryFeeWidget({ customerLat, customerLng, subtotal, onFeeCalculated }) {
  const { feeData, loading, error, calculate } = useDeliveryFee();
  const [detecting, setDetecting] = useState(false);
  const MapPinIcon = AppIcons.mapPin;
  const ClockIcon = AppIcons.clock;

  useEffect(() => {
    if (customerLat && customerLng) {
      calculate(customerLat, customerLng, subtotal).then(data => {
        if (data) onFeeCalculated && onFeeCalculated(data);
      });
    }
  }, [customerLat, customerLng, subtotal]);

  if (loading) return <div style={styles.box}><div className="spinner" style={{ width: 24, height: 24, margin: '0 auto' }}></div></div>;
  if (error) return <div style={{ ...styles.box, color: 'var(--coral)', fontSize: 14 }}>Warning: {error}</div>;
  if (!feeData) return null;

  const { breakdown, distanceKm, estimatedMinutes, isPeakHour, fee } = feeData;

  return (
    <div style={styles.box}>
      <div style={styles.title}><ClockIcon size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />AI-calculated delivery fee</div>
      {breakdown?.freeDelivery ? (
        <div style={{ color: 'var(--teal)', fontWeight: 600, fontSize: 15 }}>Free delivery on this order!</div>
      ) : (
        <>
          <div style={styles.row}><span>Base fee (0–2 km)</span><span>₦{breakdown?.baseFee?.toLocaleString()}</span></div>
          {breakdown?.distanceCharge > 0 && <div style={styles.row}><span>Distance ({distanceKm} km × rate)</span><span>₦{breakdown?.distanceCharge?.toLocaleString()}</span></div>}
          {isPeakHour && <div style={styles.row}><span>Peak hour surcharge</span><span style={{ color: 'var(--coral)' }}>+ ₦{breakdown?.peakSurcharge?.toLocaleString()}</span></div>}
          <div style={{ ...styles.row, ...styles.total }}><span>Total delivery fee</span><span>₦{fee?.toLocaleString()}</span></div>
          <div style={styles.eta}><MapPinIcon size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />Estimated: {estimatedMinutes} min · {distanceKm} km away</div>
        </>
      )}
    </div>
  );
}

const styles = {
  box: { background: 'var(--teal-lt)', borderRadius: 10, padding: '16px 18px', border: '1px solid rgba(15,110,86,0.15)' },
  title: { fontSize: 14, fontWeight: 600, color: 'var(--teal-dk)', marginBottom: 12 },
  row: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--teal-dk)', marginBottom: 6 },
  total: { borderTop: '1px solid rgba(15,110,86,0.2)', paddingTop: 8, marginTop: 4, fontWeight: 700, fontSize: 15 },
  eta: { fontSize: 12, color: 'var(--teal)', marginTop: 10 },
};
