"use client";

import { useEffect, useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Masjid, PrayerTimes } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PrayerCardProps {
    masjid: Masjid;
    prayers: PrayerTimes;
    className?: string;
}

export default function PrayerCard({ masjid, prayers, className }: PrayerCardProps) {
    const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);

    useEffect(() => {
        // Simple logic to find next prayer (this is a mock implementation)
        // In a real app, we'd compare current time with prayer times
        const now = new Date();
        const currentHour = now.getHours();

        // Mock logic: just picking one based on time of day
        if (currentHour < 5) setNextPrayer({ name: 'Fajr', time: prayers.fajr });
        else if (currentHour < 12) setNextPrayer({ name: 'Dhuhr', time: prayers.dhuhr });
        else if (currentHour < 15) setNextPrayer({ name: 'Asr', time: prayers.asr });
        else if (currentHour < 17) setNextPrayer({ name: 'Maghrib', time: prayers.maghrib });
        else if (currentHour < 19) setNextPrayer({ name: 'Isha', time: prayers.isha });
        else setNextPrayer({ name: 'Fajr', time: prayers.fajr }); // Next day
    }, [prayers]);

    return (
        <div className={cn("bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow", className)}>
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">{masjid.name}</h3>
                        <div className="flex items-center text-slate-500 text-sm mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {masjid.address}
                        </div>
                    </div>
                    {nextPrayer && (
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Next: {nextPrayer.name} {nextPrayer.time}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-5 gap-2 text-center">
                    {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((p) => (
                        <div key={p} className="flex flex-col">
                            <span className="text-xs text-slate-400 font-medium uppercase">{p}</span>
                            <span className="text-sm font-semibold text-slate-700">
                                {prayers[p.toLowerCase() as keyof PrayerTimes]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500">Jummah: {prayers.jummah}</span>
                <button className="text-xs font-medium text-primary hover:text-primary/80">View Details &rarr;</button>
            </div>
        </div>
    );
}
