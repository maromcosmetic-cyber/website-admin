"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, BookOpen, Settings, Leaf, Users, Package } from 'lucide-react';
import clsx from 'clsx';

const MENU = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Products', href: '/products', icon: ShoppingBag },
    { label: 'Orders', href: '/orders', icon: Package },
    { label: 'Ingredients', href: '/ingredients', icon: Leaf },
    { label: 'CRM / Leads', href: '/crm', icon: Users },
    { label: 'Website Pages', href: '/website-pages', icon: LayoutDashboard },
    { label: 'Blog', href: '/blog', icon: BookOpen },
    { label: 'Legal Docs', href: '/legal', icon: BookOpen },
    { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-80 bg-[#015030] text-[#FDFBF7] min-h-screen flex flex-col fixed left-0 top-0 overflow-y-auto z-50">
            {/* Logo Area */}
            <div className="p-10 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <span className="w-10 h-10 flex items-center justify-center bg-[#FDB723] text-[#015030] rounded-full text-lg font-bold">M</span>
                    <span className="text-2xl font-serif font-semibold tracking-wide text-[#FDB723]">Marom</span>
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.2em] text-white/40">Local Admin</div>
            </div>

            {/* Menu */}
            <nav className="flex-1 py-10 px-6 space-y-2">
                {MENU.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 group",
                                isActive ? "bg-[#FDB723] text-[#015030] shadow-lg font-bold" : "text-white/70 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <Icon className={clsx("w-5 h-5", isActive ? "stroke-2" : "stroke-1")} />
                            <span className="text-sm uppercase tracking-widest">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-8 border-t border-white/10 text-xs text-white/30 text-center">
                &copy; 2026 Marom Cosmetic<br />
                Admin v1.0
            </div>
        </aside>
    );
}
