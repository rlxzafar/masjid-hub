import { Calendar, PlayCircle, User } from 'lucide-react';
import { Speech, Masjid } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';

import placeholderImage from '@/public/speech-placeholder.png';

interface SpeechCardProps {
    speech: Speech;
    masjid?: Masjid;
    className?: string;
    featured?: boolean;
}

export default function SpeechCard({ speech, masjid, className, featured = false }: SpeechCardProps) {
    // Extract video ID from YouTube URL for thumbnail
    const getThumbnail = (url?: string) => {
        if (!url) return placeholderImage;
        const videoId = url.split('v=')[1];
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    };

    return (
        <div className={cn("group relative overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-all", className)}>
            <div className={cn("relative aspect-video w-full overflow-hidden bg-slate-200", featured ? "aspect-[21/9]" : "")}>
                <Image
                    src={getThumbnail(speech.youtubeUrl)}
                    alt={speech.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {speech.type === 'speech' && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                            <PlayCircle className="w-10 h-10 text-white" />
                        </div>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 p-4 w-full text-white">
                    <div className="flex items-center space-x-2 text-xs font-medium mb-2 opacity-90">
                        <span className="bg-primary px-2 py-0.5 rounded text-white">
                            {speech.type === 'speech' ? 'Speech' : 'Event'}
                        </span>
                        <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(speech.datetime), 'MMM d, yyyy • h:mm a')}
                        </span>
                    </div>
                    <h3 className={cn("font-bold leading-tight", featured ? "text-2xl" : "text-lg")}>
                        {speech.title}
                    </h3>
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <User className="w-4 h4 text-slate-400" />
                        <span>{speech.speaker}</span>
                    </div>
                    {masjid && (
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                            {masjid.name}
                        </span>
                    )}
                </div>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                    {speech.description}
                </p>
            </div>
        </div>
    );
}
