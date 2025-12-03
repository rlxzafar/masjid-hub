"use client";

import { useEffect, useState } from 'react';
import masjidsData from '@/data/masjids.json';
import prayersData from '@/data/prayers.json';
import { Masjid, PrayerTimes } from '@/types';

const masjids = masjidsData as Masjid[];
const initialPrayers = prayersData as PrayerTimes[];

export default function ManagePrayersPage() {
    const [masjidId, setMasjidId] = useState<string | null>(null);
    const [prayers, setPrayers] = useState<PrayerTimes | null>(null);

    useEffect(() => {
        const id = localStorage.getItem('masjidId');
        if (id) {
            setMasjidId(id);
            const p = initialPrayers.find(p => p.masjidId === id);
            if (p) setPrayers(p);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Prayer times updated successfully (Mock)');
    };

    if (!masjidId || !prayers) return null;

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold text-slate-900 mb-6">Manage Prayer Times</h1>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-slate-700">Date</label>
                            <input
                                type="date"
                                value={prayers.date}
                                onChange={e => setPrayers({ ...prayers, date: e.target.value })}
                                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="text-lg font-medium text-slate-900 mb-4">Daily Prayers</h3>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((p) => (
                                <div key={p}>
                                    <label className="block text-sm font-medium text-slate-700">{p}</label>
                                    <input
                                        type="time"
                                        value={prayers[p.toLowerCase() as keyof PrayerTimes]}
                                        onChange={e => setPrayers({ ...prayers, [p.toLowerCase()]: e.target.value })}
                                        className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="text-lg font-medium text-slate-900 mb-4">Jummah</h3>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Jummah Time</label>
                                <input
                                    type="time"
                                    value={prayers.jummah}
                                    onChange={e => setPrayers({ ...prayers, jummah: e.target.value })}
                                    className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
