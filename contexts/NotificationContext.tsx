"use client";

import React, { createContext, useContext, ReactNode } from "react";
import {
  useNotificationStore,
  ToastType,
  ToastAction,
  Toast,
} from "@/store/useNotificationStore";

export type { ToastType, ToastAction, Toast };

interface NotificationContextType {
  toasts: Toast[];
  notify: {
    success: (title: string, message?: string, duration?: number, action?: ToastAction) => string;
    error: (title: string, message?: string, duration?: number, action?: ToastAction) => string;
    warning: (title: string, message?: string, duration?: number, action?: ToastAction) => string;
    info: (title: string, message?: string, duration?: number, action?: ToastAction) => string;
    loading: (title: string, message?: string) => string;
    update: (id: string, update: { type: ToastType; title: string; message?: string; duration?: number; action?: ToastAction }) => void;
    dismiss: (id: string) => void;
  };
  copyToClipboard: (text: string, label?: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const store = useNotificationStore();
  const context = useContext(NotificationContext);
  
  if (context) {
    return context;
  }
  
  return {
    toasts: store.toasts,
    notify: store.notify,
    copyToClipboard: store.copyToClipboard,
  };
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toasts = useNotificationStore((state) => state.toasts);
  const notify = useNotificationStore((state) => state.notify);
  const copyToClipboard = useNotificationStore((state) => state.copyToClipboard);

  return (
    <NotificationContext.Provider value={{ toasts, notify, copyToClipboard }}>
      {children}
    </NotificationContext.Provider>
  );
};

