import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socket;
const getSocket = () => {
  if (!socket) {
    socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5003', {
      transports: ['websocket'],
      autoConnect: true
    });
  }
  return socket;
};

export const useSocket = () => getSocket();

export const useOrderTracking = (orderId, onLocationUpdate, onStatusUpdate) => {
  useEffect(() => {
    if (!orderId) return;
    const sock = getSocket();
    sock.emit('order:track', orderId);
    sock.on('rider:location:update', onLocationUpdate);
    sock.on('order:status:update', onStatusUpdate);
    return () => {
      sock.off('rider:location:update', onLocationUpdate);
      sock.off('order:status:update', onStatusUpdate);
    };
  }, [orderId]);
};
