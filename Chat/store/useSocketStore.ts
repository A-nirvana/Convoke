// store/socketStore.ts
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useSocketStore = create<SocketState>((set) => {
  let socket: Socket | null = null;

  return {
    socket: null,
    connectSocket: () => {
      if (!socket) {
        socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
          withCredentials: true,
        });

        set({ socket });
      }
    },
    disconnectSocket: () => {
      if (socket) {
        socket.disconnect();
        socket = null;
        set({ socket: null });
      }
    },
  };
});
