import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface UiStore {
  sidebarOpen: boolean;
  theme: Theme;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setTheme: (theme: Theme) => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      theme: 'dark',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      closeSidebar: () => set({ sidebarOpen: false }),
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'graderival-ui'
    }
  )
);
