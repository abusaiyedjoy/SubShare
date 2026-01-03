"use client";

import { useUIStore } from "@/store/uiStore";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  const getToastIcon = (type: string) => {
    switch (type) {
      case "success":
        return CheckCircle;
      case "error":
        return XCircle;
      case "warning":
        return AlertCircle;
      case "info":
        return Info;
      default:
        return Info;
    }
  };

  const getToastColors = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500/10 border-green-500/30 text-green-400";
      case "error":
        return "bg-red-500/10 border-red-500/30 text-red-400";
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
      case "info":
        return "bg-blue-500/10 border-blue-500/30 text-blue-400";
      default:
        return "bg-white/10 border-white/30 text-white";
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => {
        const Icon = getToastIcon(toast.type);
        const colors = getToastColors(toast.type);

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm animate-slide-in-right ${colors}`}
          >
            <Icon className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="flex-1 text-sm">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}