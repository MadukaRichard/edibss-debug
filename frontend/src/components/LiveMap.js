import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AppIcons } from './UiIcons';

// Leaflet's default marker images don't load correctly under CRA's bundler,
// so instead of fighting that we build our own small colored pin markers out
// of inline SVG. This also means zero image assets to manage and it's fully
// free — no Google Maps API key, no billing account, nothing to sign up for.
const pin = (color) => L.divIcon({
  html: `<svg width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 23 15 23s15-12.5 15-23C30 6.7 23.3 0 15 0z" fill="${color}"/>
    <circle cx="15" cy="15" r="6" fill="#fff"/>
  </svg>`,
  className: '',
  iconSize: [30, 38],
  iconAnchor: [15, 38],
  popupAnchor: [0, -34],
});

const riderPin = pin('#0F6E56');
const customerPin = pin('#D85A30');

// Keeps the map centered/zoomed to fit whichever markers are currently present,
// re-fitting whenever rider location updates come in over the socket.
function FitBounds({ points }) {
  const map = useMap();
  const key = JSON.stringify(points);
  React.useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 16 });
    }
    // eslint-disable-next-line
  }, [key]);
  return null;
}

export default function LiveMap({ riderLocation, customerLocation, height = 280 }) {
  const MapIcon = AppIcons.map;

  if (!customerLocation) {
    return (
      <div style={{ height, background: 'var(--gray-100)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-500)', flexDirection: 'column', gap: 8 }}>
        <MapIcon size={28} />
        <span style={{ fontSize: 13 }}>No location to show yet</span>
      </div>
    );
  }

  const points = [
    [customerLocation.lat, customerLocation.lng],
    ...(riderLocation ? [[riderLocation.lat, riderLocation.lng]] : []),
  ];

  return (
    <div style={{ height, borderRadius: 10, overflow: 'hidden' }}>
      <MapContainer center={points[0]} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerPin}>
          <Popup>Delivery address</Popup>
        </Marker>
        {riderLocation && (
          <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderPin}>
            <Popup>Your rider</Popup>
          </Marker>
        )}
        {riderLocation && (
          <Polyline
            positions={[[riderLocation.lat, riderLocation.lng], [customerLocation.lat, customerLocation.lng]]}
            pathOptions={{ color: '#0F6E56', weight: 3, dashArray: '6 8' }}
          />
        )}
        <FitBounds points={points} />
      </MapContainer>
    </div>
  );
}
