import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type UiState = {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'vess-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
    },
  ),
)
