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
    const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; countdown: string } | null>(null);
    const [isFriday, setIsFriday] = useState(false);

    useEffect(() => {
        const calculateNextPrayer = () => {
            const now = new Date();
            const isFri = now.getDay() === 5;
            setIsFriday(isFri);

            const prayerList = [
                { name: 'Fajr', time: prayers.fajr },
                { name: isFri ? 'Jummah' : 'Dhuhr', time: isFri ? prayers.jummah : prayers.dhuhr },
                { name: 'Asr', time: prayers.asr },
                { name: 'Maghrib', time: prayers.maghrib },
                { name: 'Isha', time: prayers.isha },
            ];

            let targetPrayer = null;

            // Find first prayer that is in the future
            for (const p of prayerList) {
                const [h, m] = p.time.split(':').map(Number);
                const pDate = new Date(now);
                pDate.setHours(h, m, 0, 0);

                if (pDate > now) {
                    targetPrayer = { ...p, date: pDate };
                    break;
                }
            }

            // If no prayer found today, it's Fajr tomorrow
            if (!targetPrayer) {
                const [h, m] = prayers.fajr.split(':').map(Number);
                const pDate = new Date(now);
                pDate.setDate(pDate.getDate() + 1);
                pDate.setHours(h, m, 0, 0);
                targetPrayer = { name: 'Fajr', time: prayers.fajr, date: pDate };
            }

            const diff = targetPrayer.date.getTime() - now.getTime();

            // Format countdown
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const countdown = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            setNextPrayer({
                name: targetPrayer.name,
                time: targetPrayer.time,
                countdown
            });
        };

        calculateNextPrayer(); // Initial call
        const timer = setInterval(calculateNextPrayer, 1000);

        return () => clearInterval(timer);
    }, [prayers]);

    return (
        <div className={cn("bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative mt-8 flex flex-col h-full", className)}>
            {nextPrayer && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full border-[6px] border-[var(--background)] flex flex-col items-center justify-center shadow-[inset_0_0_0_1px_#e2e8f0] z-10">
                    <span className="text-[10px] text-slate-400 font-medium uppercase leading-none">Next</span>
                    <span className="text-sm font-bold text-primary leading-tight">{nextPrayer.name}</span>
                    <span className="text-[10px] font-mono text-slate-500 leading-none mt-0.5">-{nextPrayer.countdown}</span>
                </div>
            )}

            <div className="p-5 pt-12 flex-1 flex flex-col">
                <div className="text-center mb-6">
                    <h3 className="font-bold text-lg text-slate-900 truncate px-2 leading-tight" title={masjid.name}>{masjid.name}</h3>
                    <div className="flex items-center justify-center text-slate-500 text-sm mt-3">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{masjid.address}</span>
                    </div>
                </div>

                <div className="grid grid-cols-5 gap-2 text-center mt-auto">
                    {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((p) => {
                        const isJummahTime = p === 'Dhuhr' && isFriday;
                        const name = isJummahTime ? 'Jummah' : p;
                        const time = isJummahTime ? prayers.jummah : prayers[p.toLowerCase() as keyof PrayerTimes];

                        return (
                            <div key={p} className="flex flex-col">
                                <span className="text-xs text-slate-400 font-medium uppercase">{name}</span>
                                <span className="text-sm font-semibold text-slate-700">
                                    {time}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-between items-center rounded-b-xl mt-auto">
                <span className="text-xs text-slate-500">Jummah: {prayers.jummah}</span>
                <button className="text-xs font-medium text-primary hover:text-primary/80 cursor-pointer">View Details &rarr;</button>
            </div>
        </div>
    );
}
