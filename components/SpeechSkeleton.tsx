import React from 'react';

export const SpeechSkeleton = () => {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden p-4 space-y-3 animate-pulse">
            {/* Thumbnail */}
            <div className="w-full h-40 bg-white/10 rounded-lg"></div>

            {/* Title */}
            <div className="h-6 w-3/4 bg-white/10 rounded"></div>

            {/* Speaker */}
            <div className="h-4 w-1/2 bg-white/10 rounded"></div>

            {/* Date */}
            <div className="h-4 w-1/4 bg-white/10 rounded"></div>

            {/* Actions */}
            <div className="flex justify-end pt-2">
                <div className="h-8 w-8 bg-white/10 rounded-full"></div>
            </div>
        </div>
    );
};
