"use client";

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Mic, Clock, LogOut, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [userType, setUserType] = useState<'admin' | 'masjid' | 'donor' | null>(null);

    useEffect(() => {
        const masjidId = localStorage.getItem('masjidId');
        const userStr = localStorage.getItem('user');

        if (masjidId === 'admin') {
            setUserType('admin');
        } else if (masjidId) {
            setUserType('masjid');
        } else if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.username === 'admin') {
                    setUserType('admin');
                    // Set legacy ID for compatibility if needed, or just rely on state
                    localStorage.setItem('masjidId', 'admin');
                } else {
                    setUserType('donor');
                }
            } catch (e) {
                router.push('/login');
            }
        } else {
            router.push('/login');
        }
    }, [router]);

    if (!userType) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    let navigation = [];

    if (userType === 'admin') {
        navigation = [
            { name: 'Admin Overview', href: '/dashboard/admin', icon: LayoutDashboard },
            { name: 'Manage Masjids', href: '/dashboard/admin/masjids', icon: Users },
            { name: 'Manage Donors', href: '/dashboard/admin?tab=donors', icon: Users },
            { name: 'Manage Needy', href: '/dashboard/admin?tab=needy', icon: Users },
        ];
    } else if (userType === 'masjid') {
        navigation = [
            { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Speeches & Events', href: '/dashboard/speeches', icon: Mic },
            { name: 'Prayer Times', href: '/dashboard/prayers', icon: Clock },
        ];
    } else {
        // Donor
        navigation = [
            { name: 'Donor Dashboard', href: '/dashboard/donor', icon: LayoutDashboard },
        ];
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="flex">
                {/* Sidebar */}
                <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 pt-16 bg-white border-r border-slate-200">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex-1 px-3 space-y-1">
                            {navigation.map((item) => {
                                let isActive = false;
                                if (item.href.includes('?')) {
                                    // Handle query params (e.g. ?tab=donors)
                                    const [path, query] = item.href.split('?');
                                    const tabParam = new URLSearchParams(query).get('tab');
                                    const currentTab = searchParams.get('tab');
                                    isActive = pathname === path && currentTab === tabParam;
                                } else {
                                    // Handle exact path match or sub-paths (but not if it's the root dashboard path matching a sub-path)
                                    isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard/admin' && item.href !== '/dashboard');
                                    // Special case for admin root
                                    if (item.href === '/dashboard/admin' && pathname === '/dashboard/admin' && !searchParams.get('tab')) {
                                        isActive = true;
                                    }
                                }

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                                            'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500',
                                                'mr-3 flex-shrink-0 h-6 w-6'
                                            )}
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="px-3 pb-4">
                            <button
                                onClick={() => {
                                    localStorage.removeItem('masjidId');
                                    localStorage.removeItem('user');
                                    router.push('/login');
                                }}
                                className="w-full group flex items-center px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
                            >
                                <LogOut className="mr-3 flex-shrink-0 h-6 w-6 text-red-400 group-hover:text-red-500" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="md:pl-64 flex-1">
                    <main className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
