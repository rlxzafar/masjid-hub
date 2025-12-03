import { Search } from 'lucide-react';
import PrayerCard from '@/components/PrayerCard';
import masjidsData from '@/data/masjids.json';
import prayersData from '@/data/prayers.json';
import { Masjid, PrayerTimes } from '@/types';
import Link from 'next/link';

const masjids = masjidsData as Masjid[];
const prayers = prayersData as PrayerTimes[];

export default function MasjidsPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Find a Masjid</h1>
                <p className="mt-2 text-slate-500">Discover Masjids near you and check their prayer timings.</p>

                <div className="mt-6 relative max-w-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Search by name or location..."
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {masjids.map(masjid => {
                    const masjidPrayers = prayers.find(p => p.masjidId === masjid.id);
                    if (!masjidPrayers) return null;

                    return (
                        <Link key={masjid.id} href={`/masjids/${masjid.id}`} className="block group">
                            <PrayerCard masjid={masjid} prayers={masjidPrayers} className="h-full group-hover:border-primary/50 transition-colors" />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
