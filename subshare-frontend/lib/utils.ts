import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  }

  return formatDate(date);
}

export function calculateCommission(
  amount: number,
  commissionPercentage: number
): {
  commission: number;
  ownerEarning: number;
} {
  const commission = (amount * commissionPercentage) / 100;
  const ownerEarning = amount - commission;
  
  return {
    commission: parseFloat(commission.toFixed(2)),
    ownerEarning: parseFloat(ownerEarning.toFixed(2)),
  };
}

export function calculateAccessDuration(
  startTime: string | Date,
  endTime: string | Date
): {
  days: number;
  hours: number;
  minutes: number;
  isExpired: boolean;
} {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();
  const isExpired = now > end;

  const diffInMs = end.getTime() - start.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  return {
    days: diffInDays,
    hours: diffInHours % 24,
    minutes: diffInMinutes % 60,
    isExpired,
  };
}

export function getRemainingTime(endTime: string | Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalSeconds: number;
} {
  const now = new Date();
  const end = new Date(endTime);
  const diffInMs = end.getTime() - now.getTime();
  const isExpired = diffInMs <= 0;

  if (isExpired) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      totalSeconds: 0,
    };
  }

  const totalSeconds = Math.floor(diffInMs / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    totalSeconds,
  };
}

export function getStatusColor(status: string): {
  bg: string;
  text: string;
  badge: string;
} {
  const statusColors: Record<string, { bg: string; text: string; badge: string }> = {
    active: {
      bg: "bg-green-500/10",
      text: "text-green-500",
      badge: "bg-green-500",
    },
    pending: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-500",
      badge: "bg-yellow-500",
    },
    completed: {
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      badge: "bg-blue-500",
    },
    expired: {
      bg: "bg-red-500/10",
      text: "text-red-500",
      badge: "bg-red-500",
    },
    cancelled: {
      bg: "bg-gray-500/10",
      text: "text-gray-500",
      badge: "bg-gray-500",
    },
    rejected: {
      bg: "bg-red-500/10",
      text: "text-red-500",
      badge: "bg-red-500",
    },
    approved: {
      bg: "bg-green-500/10",
      text: "text-green-500",
      badge: "bg-green-500",
    },
    resolved: {
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      badge: "bg-blue-500",
    },
    dismissed: {
      bg: "bg-gray-500/10",
      text: "text-gray-500",
      badge: "bg-gray-500",
    },
    failed: {
      bg: "bg-red-500/10",
      text: "text-red-500",
      badge: "bg-red-500",
    },
  };

  return statusColors[status.toLowerCase()] || statusColors.pending;
}

export function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    topup: "Top Up",
    purchase: "Purchase",
    earning: "Earning",
    refund: "Refund",
    commission: "Commission",
  };
  return labels[type.toLowerCase()] || type;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  
  // Fallback for older browsers
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand("copy");
    textArea.remove();
    return Promise.resolve();
  } catch (err) {
    textArea.remove();
    return Promise.reject(err);
  }
}

export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `TXN-${timestamp}-${randomStr}`.toUpperCase();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function calculatePricePerDay(pricePerHour: number): number {
  return parseFloat((pricePerHour * 24).toFixed(2));
}

export function calculateTotalPrice(pricePerHour: number, days: number): number {
  return parseFloat((pricePerHour * 24 * days).toFixed(2));
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const ext = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(ext);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}