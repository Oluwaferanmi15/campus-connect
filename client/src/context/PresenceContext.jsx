import { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';

const PresenceContext = createContext({ onlineUserIds: new Set() });
export const usePresence = () => useContext(PresenceContext);

export function PresenceProvider({ children }) {
  const socketRef = useSocket();
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleInit = ({ onlineUserIds: ids }) => setOnlineUserIds(new Set(ids));
    const handleOnline = ({ userId }) =>
      setOnlineUserIds((prev) => new Set(prev).add(userId));
    const handleOffline = ({ userId }) =>
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });

    socket.on('presence:init', handleInit);
    socket.on('presence:online', handleOnline);
    socket.on('presence:offline', handleOffline);

    return () => {
      socket.off('presence:init', handleInit);
      socket.off('presence:online', handleOnline);
      socket.off('presence:offline', handleOffline);
    };
  }, [socketRef]);

  return (
    <PresenceContext.Provider value={{ onlineUserIds }}>{children}</PresenceContext.Provider>
  );
}