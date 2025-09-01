import { createContext, useContext, useEffect, useRef, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

interface SocketContextType {
    socket: Socket|null;
    isConnected: boolean;
}

const SocketContext=createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

const SOCKET_URL='http://localhost:3000';

export const useSocket=() => {
    return useContext(SocketContext);
};

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

export const SocketProvider: React.FC<{ children: React.ReactNode }>=({ children }) => {
    const socketRef=useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    const { token } = useAuth(); // Get the JWT token from your auth context

    useEffect(() => {
        if (!token) {
            console.log('No auth token available, not connecting socket');
            return;
        }

        // Initialize socket connection with auth token
        socketRef.current = io(SOCKET_URL, {
            withCredentials: true,
            autoConnect: true,
            auth: {
                token: `Bearer ${token}`
            },
            extraHeaders: {
                Authorization: `Bearer ${token}`
            }
        });

        // Connection event handlers
        const onConnect=() => {
            setIsConnected(true);
            console.log('Connected to WebSocket server IO');
        };

        const onDisconnect=() => {
            setIsConnected(false);
            console.log('Disconnected from WebSocket server IO');
        };

        // Set up event listeners
        socketRef.current.on('connect', onConnect);
        socketRef.current.on('disconnect', onDisconnect);
        socketRef.current.on('connected', (data) => {
            console.log('Server connection confirmed:', data);
        });

        // Clean up on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        };
    }, [token]); // Reconnect when token changes

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        socket: socketRef.current,
        isConnected: isConnected
    }), [isConnected]);

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
