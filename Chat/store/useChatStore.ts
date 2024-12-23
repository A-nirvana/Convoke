import { create } from "zustand";
import { toast } from "react-toastify";
import { axiosInstance } from "../utils/axios";
import { useAuthStore } from "./useAuthStore";
import { Socket } from "socket.io-client";

// Interfaces
interface User {
    _id: string;
    name: string;
    email: string;
    profilePic?: string;
    contactNumber?: string;
    // Other user fields
}

interface Message {
    _id: string;
    senderId: string;
    recieverId: string;
    text?: string;
    image?: string;
    video?: string;
    audio?: string;
    file?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MessageData {
    text?: string;
    image?: string;
    video?: string;
    audio?: string;
    file?: string;
}

interface ChatStoreState {
    messages: Message[];
    users: User[];
    dms: User[];
    requests: User[];
    selectedUser: User | null;
    isUsersLoading: boolean;
    isMessagesLoading: boolean;
    isDmsLoading: boolean;
    isRequestsLoading: boolean
    isSearching : boolean

    // Actions
    getUsers: () => Promise<void>;
    getDms: () => Promise<void>;
    createDm: (dmId: string) => Promise<void>;
    acceptDm: (dmId: string) => Promise<void>;
    rejectDm: (dmId: string) => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    sendMessage: (userId: string, messageData: MessageData) => Promise<void>;
    getRequests: () => Promise<void>;
    getUser: (userId: string) => Promise<void>;
    subscribeToMessages: () => void;
    unsubscribeFromMessages: () => void;
    setSelectedUser: (user: User) => void;
    setIsSearching: (val : boolean)=>void
}

// Zustand Store
export const useChatStore = create<ChatStoreState>((set, get) => ({
    messages: [],
    users: [],
    dms: [],
    requests: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isDmsLoading: false,
    isRequestsLoading: false,
    isSearching: false,

    // Get all users except logged-in user
    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data.users });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to load users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    // Get DM list
    getDms: async () => {
        set({ isDmsLoading: true });
        try {
            const res = await axiosInstance.get("/messages/dms");
            set({ dms: res.data.dms });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to load DMs");
        } finally {
            set({ isDmsLoading: false });
        }
    },

    getRequests: async () => {
        set({ isRequestsLoading: true });
        try {
            const res = await axiosInstance.get("/messages/request");
            set({ requests: res.data.requestList });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to load requests");
        } finally {
            set({ isRequestsLoading: false });
        }
    },

  // Create DM request
  createDm: async (dmId: string) => {
        try {
            await axiosInstance.put("/messages/create", { dmId });
            toast.success("DM request sent successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send DM request");
        }
    },

    // Accept DM request
    acceptDm: async (dmId: string) => {
        try {
            await axiosInstance.put("/messages/accept", { dmId });
            toast.success("DM request accepted");
            const filter = get().requests.filter((req)=>req._id !== dmId);
            set({requests:filter})
            get().getDms();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to accept DM request");
        }
    },

    // Reject DM request
    rejectDm: async (dmId: string) => {
        try {
            await axiosInstance.put("/messages/reject", { dmId });
            toast.success("DM request rejected");
            const filter = get().requests.filter((req)=>req._id !== dmId);
            set({requests:filter})
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reject DM request");
        }
    },

    // Get messages for a specific user
    getMessages: async (userId: string) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data.messages });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to load messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    // Send a message
    sendMessage: async (userId: string, messageData: MessageData) => {
        const { messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/${userId}`, messageData);
            set({ messages: [...messages, res.data.newMessage] });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    },

    getUser: async(userId: string)=>{
        try{
          const res = await axiosInstance.get(`/auth/getUser/${userId}`); 
          set({selectedUser: res.data.user});
        }
        catch(error: any){
          console.log("Error in getUser:", error);
          toast.error(error.response?.data?.message || "User not found");
        }
      },

    // Socket subscriptions
    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket: Socket | null = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("newMessage", (newMessage: Message) => {
            const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageFromSelectedUser) return;

            set({ messages: [...get().messages, newMessage] });
        });
    },

    unsubscribeFromMessages: () => {
        const socket: Socket | null = useAuthStore.getState().socket;
        socket?.off("newMessage");
    },

    setSelectedUser: (user: User) => set({ selectedUser: user }),
    setIsSearching: (val: boolean)=> set({isSearching:val})
}));
