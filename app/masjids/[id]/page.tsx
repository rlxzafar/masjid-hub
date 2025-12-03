import { Calendar, Clock, MapPin, Phone, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SpeechCard from '@/components/SpeechCard';
import masjidsData from '@/data/masjids.json';
import prayersData from '@/data/prayers.json';
import speechesData from '@/data/speeches.json';
import { Masjid, PrayerTimes, Speech } from '@/types';

const masjids = masjidsData as Masjid[];
const prayers = prayersData as PrayerTimes[];
const speeches = speechesData as Speech[];

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function MasjidDetailPage(props: PageProps) {
    const params = await props.params;
    const masjid = masjids.find(m => m.id === params.id);
    const masjidPrayers = prayers.find(p => p.masjidId === params.id);
    const masjidSpeeches = speeches.filter(s => s.masjidId === params.id);

    if (!masjid) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Hero Header */}
            <div className="relative h-64 md:h-80 lg:h-96 w-full">
                <Image
                    src={masjid.image}
                    alt={masjid.name}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">{masjid.name}</h1>
                        <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm md:text-base opacity-90">
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {masjid.address}</span>
                            <span className="flex items-center"><User className="w-4 h-4 mr-1" /> Imam: {masjid.imamName}</span>
                            <span className="flex items-center"><Phone className="w-4 h-4 mr-1" /> {masjid.contact}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Prayer Times */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-primary" /> Prayer Times
                            </h2>
                            {masjidPrayers ? (
                                <div className="space-y-3">
                                    {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((p) => (
                                        <div key={p} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                            <span className="font-medium text-slate-600">{p}</span>
                                            <span className="font-bold text-slate-900 text-lg">
                                                {masjidPrayers[p.toLowerCase() as keyof PrayerTimes]}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <div className="flex justify-between items-center bg-primary/5 p-3 rounded-lg">
                                            <span className="font-medium text-primary">Jummah</span>
                                            <span className="font-bold text-primary text-lg">{masjidPrayers.jummah}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <p>Prayer times are currently unavailable.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Upcoming Events */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                                <Calendar className="w-6 h-6 mr-2 text-primary" /> Upcoming Events & Speeches
                            </h2>
                            {masjidSpeeches.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {masjidSpeeches.map(speech => (
                                        <SpeechCard key={speech.id} speech={speech} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
                                    No upcoming events scheduled.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
