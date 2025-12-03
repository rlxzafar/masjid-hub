import { Calendar, Filter } from 'lucide-react';
import SpeechCard from '@/components/SpeechCard';
import masjidsData from '@/data/masjids.json';
import speechesData from '@/data/speeches.json';
import { Masjid, Speech } from '@/types';

const masjids = masjidsData as Masjid[];
const speeches = speechesData as Speech[];

export default function EventsPage() {
    // Sort by date (nearest first)
    const sortedSpeeches = [...speeches].sort((a, b) =>
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Events & Speeches</h1>
                    <p className="mt-2 text-slate-500">Upcoming community gatherings and spiritual sessions.</p>
                </div>

                <div className="mt-4 md:mt-0 flex space-x-2">
                    <button className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                        <Filter className="h-4 w-4 mr-2 text-slate-500" />
                        Filter
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90">
                        <Calendar className="h-4 w-4 mr-2" />
                        Calendar View
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedSpeeches.map(speech => {
                    const masjid = masjids.find(m => m.id === speech.masjidId);
                    return (
                        <SpeechCard key={speech.id} speech={speech} masjid={masjid} />
                    );
                })}
            </div>
        </div>
    );
}
