"use client";

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center max-w-md mx-auto">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                    <Icon className="h-10 w-10 text-gray-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
                <p className="mb-6 text-gray-400">{description}</p>

                {action && (
                    <button
                        onClick={action.onClick}
                        className="rounded-lg gradient-primary px-6 py-3 text-sm font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105"
                    >
                        {action.label}
                    </button>
                )}
            </div>
        </div>
    );
}