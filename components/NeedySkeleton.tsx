import React from 'react';

export default function NeedySkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-5 bg-gray-200 rounded-full w-16"></div>
            </div>

            <div className="space-y-3 mb-6 flex-1">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-gray-200 h-2 rounded-full w-1/2"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-xl w-full mt-4"></div>
            </div>
        </div>
    );
}
