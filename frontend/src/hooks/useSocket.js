import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const useSocket = (token, onEvent) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log(' Connected to Socket.IO server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    // Listen for note events
    socket.on('note:created', (data) => {
      console.log('Note created:', data);
      if (onEvent) onEvent('created', data);
    });

    socket.on('note:updated', (data) => {
      console.log('Note updated:', data);
      if (onEvent) onEvent('updated', data);
    });

    socket.on('note:deleted', (data) => {
      console.log(' Note deleted:', data);
      if (onEvent) onEvent('deleted', data);
    });

    socket.on('notes:imported', (data) => {
      console.log(' Notes imported:', data);
      if (onEvent) onEvent('imported', data);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
        console.log('Socket disconnected on cleanup');
      }
    };
  }, [token, onEvent]);

  return socketRef.current;
};
