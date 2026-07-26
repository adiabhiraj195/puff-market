"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms
  timestamp: number;
}

interface ToastOptions {
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  toasts: Toast[];
  notify: {
    success: (title: string, message?: string, duration?: number) => string;
    error: (title: string, message?: string, duration?: number) => string;
    warning: (title: string, message?: string, duration?: number) => string;
    info: (title: string, message?: string, duration?: number) => string;
    loading: (title: string, message?: string) => string;
    update: (id: string, update: { type: ToastType; title: string; message?: string; duration?: number }) => void;
    dismiss: (id: string) => void;
  };
  copyToClipboard: (text: string, label?: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000): string => {
    const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const newToast: Toast = {
      id,
      type,
      title,
      message,
      duration: type === "loading" ? 0 : duration,
      timestamp: Date.now(),
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 7)]); // keep max 8 active toasts

    if (type !== "loading" && duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const updateToast = useCallback((id: string, update: { type: ToastType; title: string; message?: string; duration?: number }) => {
    setToasts((prev) =>
      prev.map((toast) => {
        if (toast.id === id) {
          const updatedType = update.type;
          const updatedDuration = update.duration ?? (updatedType === "loading" ? 0 : 4000);
          
          if (updatedType !== "loading" && updatedDuration > 0) {
            setTimeout(() => {
              removeToast(id);
            }, updatedDuration);
          }

          return {
            ...toast,
            type: updatedType,
            title: update.title,
            message: update.message !== undefined ? update.message : toast.message,
            duration: updatedDuration,
          };
        }
        return toast;
      })
    );
  }, [removeToast]);

  const copyToClipboard = useCallback(async (text: string, label = "Item") => {
    try {
      await navigator.clipboard.writeText(text);
      addToast("success", "Copied to Clipboard!", `${label} copied successfully.`);
      return true;
    } catch (err) {
      addToast("error", "Copy Failed", `Unable to copy ${label.toLowerCase()}.`);
      return false;
    }
  }, [addToast]);

  const notify = {
    success: (title: string, message?: string, duration?: number) => addToast("success", title, message, duration),
    error: (title: string, message?: string, duration?: number) => addToast("error", title, message, duration ?? 5500),
    warning: (title: string, message?: string, duration?: number) => addToast("warning", title, message, duration),
    info: (title: string, message?: string, duration?: number) => addToast("info", title, message, duration),
    loading: (title: string, message?: string) => addToast("loading", title, message, 0),
    update: updateToast,
    dismiss: removeToast,
  };

  return (
    <NotificationContext.Provider value={{ toasts, notify, copyToClipboard }}>
      {children}
    </NotificationContext.Provider>
  );
};
