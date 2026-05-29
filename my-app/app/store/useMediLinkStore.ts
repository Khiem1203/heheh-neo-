import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TrayStatus {
  id: number;
  remaining: number;
  capacity: number;
  status: 'IDLE' | 'DISPENSING' | 'SUCCESS' | 'ERROR' | 'JAMMED';
  lastUpdate: string;
}

interface User {
  id: string;
  name: string;
  isVerified: boolean;
  isOnboarded?: boolean;
}

interface RegistrationData {
  username?: string;
  password?: string;
  name?: string;
  pin?: string;
  face_image?: string;
}

interface MediLinkState {
  trays: Record<number, TrayStatus>;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';
  user: User | null;
  registrationData: RegistrationData | null;
  _hasHydrated: boolean;
  
  // Actions
  setHasHydrated: (state: boolean) => void;
  updateInventory: (trayId: number, remaining: number) => void;
  updateStatus: (trayId: number, status: TrayStatus['status']) => void;
  setConnectionStatus: (status: MediLinkState['connectionStatus']) => void;
  setUser: (user: User | null) => void;
  setOnboarded: (status: boolean) => void;
  setRegistrationData: (data: RegistrationData | null) => void;
}

export const useMediLinkStore = create<MediLinkState>()(
  persist(
    (set) => ({
      trays: {
        1: { id: 1, remaining: 0, capacity: 20, status: 'IDLE', lastUpdate: new Date().toISOString() },
        2: { id: 2, remaining: 0, capacity: 20, status: 'IDLE', lastUpdate: new Date().toISOString() },
        3: { id: 3, remaining: 0, capacity: 20, status: 'IDLE', lastUpdate: new Date().toISOString() },
      },
      connectionStatus: 'DISCONNECTED',
      user: null,
      registrationData: null,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),
      updateInventory: (trayId, remaining) => 
        set((state) => ({
          trays: {
            ...state.trays,
            [trayId]: {
              ...state.trays[trayId],
              remaining,
              lastUpdate: new Date().toISOString(),
            },
          },
        })),

      updateStatus: (trayId, status) =>
        set((state) => ({
          trays: {
            ...state.trays,
            [trayId]: {
              ...state.trays[trayId],
              status,
              lastUpdate: new Date().toISOString(),
            },
          },
        })),

      setConnectionStatus: (status) => set({ connectionStatus: status }),
      setUser: (user) => set({ user }),
      setOnboarded: (status) => set((state) => ({ 
        user: state.user ? { ...state.user, isOnboarded: status } : null 
      })),
      setRegistrationData: (data) => set((state) => ({ 
        registrationData: data ? { ...state.registrationData, ...data } : null 
      })),
    }),
    {
      name: 'medilink-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    }
  )
);
