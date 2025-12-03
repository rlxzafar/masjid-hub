"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Home, MapPin, Calendar, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };

    const linkClass = (path: string) => cn(
        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200",
        isActive(path)
            ? "border-primary text-gray-900"
            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
    );

    const mobileLinkClass = (path: string) => cn(
        "flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors duration-200",
        isActive(path)
            ? "text-primary"
            : "text-gray-500 hover:text-gray-700"
    );

    return (
        <>
            {/* Desktop Navbar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 hidden sm:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link href="/" className="text-2xl font-bold text-primary">
                                    MasjidHub
                                </Link>
                            </div>
                            {!pathname?.startsWith('/dashboard') && (
                                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                    <Link href="/" className={linkClass('/')}>
                                        Home
                                    </Link>
                                    <Link href="/masjids" className={linkClass('/masjids')}>
                                        Masjids
                                    </Link>
                                    <Link href="/events" className={linkClass('/events')}>
                                        Events
                                    </Link>
                                    <Link href="/volunteers" className={linkClass('/volunteers')}>
                                        Volunteers
                                    </Link>
                                </div>
                            )}
                        </div>
                        {!pathname?.startsWith('/dashboard') && (
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Link href="/dashboard" className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 shadow-sm transition-all hover:scale-105">
                                        Dashboard
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Top Bar (Logo only) */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50 sm:hidden h-14 flex items-center justify-center px-4">
                <Link href="/" className="text-xl font-bold text-primary">
                    MasjidHub
                </Link>
            </div>

            {/* Mobile Bottom Navigation */}
            {!pathname?.startsWith('/dashboard') && (
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 sm:hidden h-16 pb-safe">
                    <div className="grid grid-cols-4 h-full">
                        <Link href="/" className={mobileLinkClass('/')}>
                            <Home className="w-6 h-6 mb-1" />
                            <span>Home</span>
                        </Link>
                        <Link href="/masjids" className={mobileLinkClass('/masjids')}>
                            <MapPin className="w-6 h-6 mb-1" />
                            <span>Masjids</span>
                        </Link>
                        <Link href="/events" className={mobileLinkClass('/events')}>
                            <Calendar className="w-6 h-6 mb-1" />
                            <span>Events</span>
                        </Link>
                        <Link href="/dashboard" className={mobileLinkClass('/dashboard')}>
                            <LayoutDashboard className="w-6 h-6 mb-1" />
                            <span>Dashboard</span>
                        </Link>
                    </div>
                </nav>
            )}
        </>
    );
}

