import { useState, useCallback } from 'react';
import api from '../services/api';

export const useDeliveryFee = () => {
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculate = useCallback(async (customerLat, customerLng, subtotal) => {
    if (!customerLat || !customerLng) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/delivery/calculate-fee', {
        customerLat, customerLng, orderSubtotal: subtotal
      });
      setFeeData(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Could not calculate fee');
    } finally { setLoading(false); }
  }, []);

  return { feeData, loading, error, calculate };
};
