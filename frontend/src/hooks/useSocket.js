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

// frontend/src/hooks/useSocket.js
export const useOrderTracking = (orderId, onLocationUpdate, onStatusUpdate, onRiderAssigned) => {
  useEffect(() => {
    if (!orderId) return;
    const socket = getSocket();
    socket.emit('order:track', orderId);

    socket.on('rider:location:update', onLocationUpdate);
    socket.on('order:status:update', onStatusUpdate);
    
    // Add the new listener here:
    if (onRiderAssigned) {
      socket.on('rider:assigned', onRiderAssigned);
    }

    return () => {
      socket.off('rider:location:update', onLocationUpdate);
      socket.off('order:status:update', onStatusUpdate);
      if (onRiderAssigned) socket.off('rider:assigned', onRiderAssigned);
    };
  }, [orderId, onLocationUpdate, onStatusUpdate, onRiderAssigned]);
};