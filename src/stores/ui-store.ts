import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type TestManagementView = 'list' | 'grid'

type UiState = {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  testManagementView: TestManagementView
  setTestManagementView: (view: TestManagementView) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      testManagementView: 'list',
      setTestManagementView: (view) => set({ testManagementView: view }),
    }),
    {
      name: 'vess-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        testManagementView: state.testManagementView,
      }),
    },
  ),
)
