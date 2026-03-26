"use client";

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";

interface UIState {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  modalOpen: string | null;
  activeModal: string | null;
}

interface UIContextValue extends UIState {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  sidebarOpen: true,
  modalOpen: null,
  activeModal: null,
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UIState>(initialState);

  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setState((prev) => ({ ...prev, sidebarCollapsed: collapsed }));
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setState((prev) => ({ ...prev, sidebarOpen: open }));
  }, []);

  const openModal = useCallback((modalId: string) => {
    setState((prev) => ({ ...prev, modalOpen: modalId, activeModal: modalId }));
  }, []);

  const closeModal = useCallback(() => {
    setState((prev) => ({ ...prev, modalOpen: null, activeModal: null }));
  }, []);

  const value = useMemo<UIContextValue>(() => ({
    ...state,
    toggleSidebar,
    setSidebarCollapsed,
    setSidebarOpen,
    openModal,
    closeModal,
  }), [state, toggleSidebar, setSidebarCollapsed, setSidebarOpen, openModal, closeModal]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }
  return context;
}