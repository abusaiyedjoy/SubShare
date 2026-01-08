"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
    LayoutDashboard,
    Share2,
    Wallet,
    Key,
    User,
    Settings,
    Users,
    FileCheck,
    AlertCircle,
    DollarSign,
    BarChart3,
    Package
} from "lucide-react";

interface SidebarProps {
    isOpen?: boolean;
}

export function Sidebar({ isOpen = true }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const isAdmin = user?.role === "admin";

    const userLinks = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "My Access",
            href: "/my-access",
            icon: Key,
        },
        {
            label: "Share Subscription",
            href: "/share-subscription",
            icon: Share2,
        },
        {
            label: "My Shares",
            href: "/my-shares",
            icon: Package,
        },
        {
            label: "Wallet",
            href: "/wallet",
            icon: Wallet,
        },
        {
            label: "Profile",
            href: "/profile",
            icon: User,
        },
    ];

    const adminLinks = [
        {
            label: "Dashboard",
            href: "/admin/dashboard",
            icon: BarChart3,
        },
        {
            label: "Topup Requests",
            href: "/admin/topup-requests",
            icon: DollarSign,
        },
        {
            label: "Verifications",
            href: "/admin/verifications",
            icon: FileCheck,
        },
        {  
            label: "Platforms",
            href: "/admin/platforms",
            icon: Share2,
        },
        {
            label: "Reports",
            href: "/admin/reports",
            icon: AlertCircle,
        },
        {
            label: "Transactions",
            href: "/admin/transactions",
            icon: Wallet,
        },
        {
            label: "Users",
            href: "/admin/users",
            icon: Users,
        },
        {
            label: "Settings",
            href: "/admin/settings",
            icon: Settings,
        },
    ];

    const links = isAdmin ? adminLinks : userLinks;

    return (
        <aside
            className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-white/5 bg-[#0A1628]/95 backdrop-blur-lg transition-all duration-300 ${isOpen ? "w-64" : "w-0 md:w-20"
                } overflow-hidden`}
        >
            <nav className="flex h-full flex-col p-4">
                <div className="flex-1 space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive
                                        ? "gradient-primary text-[#0A1628] shadow-glow-primary"
                                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span className={`${isOpen ? "block" : "hidden md:hidden lg:block"}`}>
                                    {link.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* User Info at Bottom */}
                {user && isOpen && (
                    <div className="mt-4 rounded-lg bg-white/5 p-4 border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-primary text-[#0A1628] font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-400">Balance</span>
                            <span className="text-sm font-semibold text-[#00D9B4]">
                                ${user.balance.toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}
            </nav>
        </aside>
    );
}