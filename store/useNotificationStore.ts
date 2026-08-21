import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export interface ToastAction {
  label: string;
  url?: string;
  onClick?: () => void;
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms
  timestamp: number;
  action?: ToastAction;
}

export interface NotificationState {
  toasts: Toast[];
  addToast: (
    type: ToastType,
    title: string,
    message?: string,
    duration?: number,
    action?: ToastAction
  ) => string;
  updateToast: (
    id: string,
    update: {
      type: ToastType;
      title: string;
      message?: string;
      duration?: number;
      action?: ToastAction;
    }
  ) => void;
  removeToast: (id: string) => void;
  copyToClipboard: (text: string, label?: string) => Promise<boolean>;
  notify: {
    success: (title: string, message?: string, duration?: number, action?: ToastAction) => string;
    error: (title: string, message?: string, duration?: number, action?: ToastAction) => string;
    warning: (title: string, message?: string, duration?: number, action?: ToastAction) => string;
    info: (title: string, message?: string, duration?: number, action?: ToastAction) => string;
    loading: (title: string, message?: string) => string;
    update: (id: string, update: { type: ToastType; title: string; message?: string; duration?: number; action?: ToastAction }) => void;
    dismiss: (id: string) => void;
  };
}

export const useNotificationStore = create<NotificationState>((set, get) => {
  const removeToast = (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  };

  const addToast = (
    type: ToastType,
    title: string,
    message?: string,
    duration = 4000,
    action?: ToastAction
  ): string => {
    const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const newToast: Toast = {
      id,
      type,
      title,
      message,
      duration: type === "loading" ? 0 : duration,
      timestamp: Date.now(),
      action,
    };

    set((state) => ({
      toasts: [newToast, ...state.toasts.slice(0, 7)],
    }));

    if (type !== "loading" && duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  };

  const updateToast = (
    id: string,
    update: {
      type: ToastType;
      title: string;
      message?: string;
      duration?: number;
      action?: ToastAction;
    }
  ) => {
    set((state) => ({
      toasts: state.toasts.map((toast) => {
        if (toast.id === id) {
          const updatedType = update.type;
          const updatedDuration =
            update.duration ?? (updatedType === "loading" ? 0 : 4000);

          if (updatedType !== "loading" && updatedDuration > 0) {
            setTimeout(() => {
              get().removeToast(id);
            }, updatedDuration);
          }

          return {
            ...toast,
            type: updatedType,
            title: update.title,
            message: update.message !== undefined ? update.message : toast.message,
            duration: updatedDuration,
            action: update.action !== undefined ? update.action : toast.action,
          };
        }
        return toast;
      }),
    }));
  };

  const copyToClipboard = async (text: string, label = "Item"): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      get().notify.success("Copied to Clipboard!", `${label} copied successfully.`);
      return true;
    } catch (err) {
      get().notify.error("Copy Failed", `Unable to copy ${label.toLowerCase()}.`);
      return false;
    }
  };

  return {
    toasts: [],
    addToast,
    updateToast,
    removeToast,
    copyToClipboard,
    notify: {
      success: (title, message, duration, action) =>
        get().addToast("success", title, message, duration, action),
      error: (title, message, duration, action) =>
        get().addToast("error", title, message, duration ?? 5500, action),
      warning: (title, message, duration, action) =>
        get().addToast("warning", title, message, duration, action),
      info: (title, message, duration, action) =>
        get().addToast("info", title, message, duration, action),
      loading: (title, message) => get().addToast("loading", title, message, 0),
      update: (id, update) => get().updateToast(id, update),
      dismiss: (id) => get().removeToast(id),
    },
  };
});
