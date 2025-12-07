import React from 'react';

export default function MasjidSkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-pulse">
            {/* Cover Image Skeleton */}
            <div className="h-48 w-full bg-gray-200"></div>

            {/* Content Skeleton */}
            <div className="p-5 flex-grow flex flex-col space-y-4">
                {/* Title and Address */}
                <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>

                {/* Info Blocks */}
                <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3 w-full">
                            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                            <div className="space-y-1 flex-1">
                                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3 w-full">
                            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                            <div className="space-y-1 flex-1">
                                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer/Button */}
                <div className="mt-auto pt-4">
                    <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                </div>
            </div>
        </div>
    );
}
