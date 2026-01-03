"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "default";
  size?: "sm" | "md" | "lg";
}

export function Badge({ children, variant = "default", size = "md" }: BadgeProps) {
  const variantClasses = {
    success: "bg-green-500/10 text-green-400 border-green-500/30",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    error: "bg-red-500/10 text-red-400 border-red-500/30",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    default: "bg-white/10 text-gray-300 border-white/20",
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </span>
  );
}