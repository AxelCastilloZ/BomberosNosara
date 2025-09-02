
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

type SocketCtx = { socket: Socket | null; isConnected: boolean };
const SocketContext = createContext<SocketCtx>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

const SOCKET_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';


export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (!token) {
      setIsConnected(false);
      return;
    }

    
    const s = io(SOCKET_URL, {
      auth: {
        
        token: `Bearer ${token}`,
      },
      
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 10000,
      withCredentials: true,
    });

    s.on('connect', () => {
      setIsConnected(true);
      console.info('[socket] ✅ conectado:', s.id);
      s.emit('getOnlineUsers'); 
    });

    s.on('disconnect', (reason) => {
      setIsConnected(false);
      console.warn('[socket] 🔌 desconectado:', reason);
    });

    s.on('connect_error', (err: any) => {
      setIsConnected(false);
      console.error('[socket] ❌ error de conexión:', err?.message || err);
    });

    socketRef.current = s;

    return () => {
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const value = useMemo(
    () => ({ socket: socketRef.current, isConnected }),
    [isConnected]
  );

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
