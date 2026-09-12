import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Establishes one shared socket connection for the app, authenticated with the JWT.
export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('cc_token');
    if (!token) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || '/';
    socketRef.current = io(socketUrl, { auth: { token } });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef;
}
