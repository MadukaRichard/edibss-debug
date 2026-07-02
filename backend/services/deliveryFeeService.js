const DeliveryFeeRule = require('../models/DeliveryFeeRule');

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const isPeakHour = (peakHours=[]) => {
  const now = new Date();
  const cur = now.getHours()*60 + now.getMinutes();
  return peakHours.some(slot => {
    const [s,e] = slot.split('-').map(t => { const [h,m]=t.split(':').map(Number); return h*60+m; });
    return cur >= s && cur <= e;
  });
};

exports.calculateDeliveryFee = async ({ customerLat, customerLng, orderSubtotal=0 }) => {
  let rule = await DeliveryFeeRule.findOne({ isActive: true });
  if (!rule) rule = { storeLat:6.5244, storeLng:3.3792, baseFee:500, baseFeeMaxKm:2, perKmRate:80, peakHourSurcharge:100, peakHours:['07:00-09:00','17:00-20:00'], maxRadiusKm:15, freeDeliveryThreshold:15000 };

  const distanceKm = haversineKm(rule.storeLat, rule.storeLng, customerLat, customerLng);
  if (distanceKm > rule.maxRadiusKm) return { error: 'Outside delivery coverage', distanceKm };

  if (orderSubtotal >= rule.freeDeliveryThreshold)
    return { fee:0, distanceKm, breakdown:{baseFee:0,distanceCharge:0,peakSurcharge:0,total:0,freeDelivery:true}, estimatedMinutes: Math.round(distanceKm*3+5) };

  const baseFee = rule.baseFee;
  const extraKm = Math.max(0, distanceKm - rule.baseFeeMaxKm);
  const distanceCharge = Math.round(extraKm * rule.perKmRate);
  const peak = isPeakHour(rule.peakHours);
  const peakSurcharge = peak ? rule.peakHourSurcharge : 0;
  const total = baseFee + distanceCharge + peakSurcharge;
  const estimatedMinutes = Math.round(distanceKm*3+5);

  return { fee:total, distanceKm:Math.round(distanceKm*10)/10, estimatedMinutes, isPeakHour:peak, breakdown:{baseFee,distanceCharge,peakSurcharge,total} };
};
