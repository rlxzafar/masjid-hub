"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import masjidsData from '@/data/masjids.json';
import prayersData from '@/data/prayers.json';
import speechesData from '@/data/speeches.json';
import { Masjid, PrayerTimes, Speech } from '@/types';
import { Clock, Mic, Users } from 'lucide-react';

const masjids = masjidsData as Masjid[];
const prayers = prayersData as PrayerTimes[];
const speeches = speechesData as Speech[];

export default function DashboardPage() {
    const router = useRouter(); // Need to import useRouter
    const [masjidId, setMasjidId] = useState<string | null>(null);

    useEffect(() => {
        const mId = localStorage.getItem('masjidId');
        const userStr = localStorage.getItem('user');

        if (mId === 'admin') {
            router.push('/dashboard/admin');
            return;
        }

        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.username !== 'admin') {
                    router.push('/dashboard/donor');
                    return;
                }
            } catch (e) { }
        }

        setMasjidId(mId);
    }, [router]);

    if (!masjidId) return null;

    const masjid = masjids.find(m => m.id === masjidId);
    const masjidSpeeches = speeches.filter(s => s.masjidId === masjidId);
    const upcomingSpeeches = masjidSpeeches.filter(s => new Date(s.datetime) > new Date());

    return (
        <div>
            <h1 className="text-2xl font-semibold text-slate-900">Welcome back, {masjid?.name}</h1>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Card 1 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Mic className="h-6 w-6 text-slate-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-slate-500 truncate">Upcoming Speeches</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-slate-900">{upcomingSpeeches.length}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-5 py-3">
                        <div className="text-sm">
                            <Link href="/dashboard/speeches" className="font-medium text-primary hover:text-primary/90">
                                View all
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Clock className="h-6 w-6 text-slate-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-slate-500 truncate">Prayer Times Status</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-slate-900">Up to date</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-5 py-3">
                        <div className="text-sm">
                            <Link href="/dashboard/prayers" className="font-medium text-primary hover:text-primary/90">
                                Update times
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
