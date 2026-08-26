"use client";

import React, { ReactNode } from "react";
import {
  useNotificationStore,
  ToastType,
  ToastAction,
  Toast,
} from "@/store/useNotificationStore";

export type { ToastType, ToastAction, Toast };

export const useNotification = () => {
  const store = useNotificationStore();
  
  return {
    toasts: store.toasts,
    notify: store.notify,
    copyToClipboard: store.copyToClipboard,
  };
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
