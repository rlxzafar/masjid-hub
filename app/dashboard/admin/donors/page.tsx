"use client";
import React, { useEffect, useState } from 'react';
import { Donor } from '@/types';
import { CheckCircle, AlertCircle, X, Check } from 'lucide-react';

// Simple Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}>
            {type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="cursor-pointer ml-2 hover:opacity-80">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default function DonorsPage() {
    const [donors, setDonors] = useState<Donor[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    useEffect(() => {
        fetchDonors();
    }, []);

    const fetchDonors = async () => {
        try {
            const res = await fetch('/api/admin/donors');
            if (res.ok) {
                setDonors(await res.json());
            }
        } catch (error) {
            console.error('Error fetching donors:', error);
        } finally {
            setLoading(false);
        }
    };

    const approveDonor = async (id: string) => {
        const res = await fetch('/api/admin/donors', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: 'approved' }),
        });
        if (res.ok) {
            showToast('Donor approved successfully');
            fetchDonors();
        } else {
            showToast('Failed to approve donor', 'error');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-emerald-800">Manage Donors</h1>
                    <p className="text-gray-600 mt-2">View and manage donor registrations and approvals.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading donors...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {donors.map(donor => (
                        <div key={donor.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <div className="w-24 h-24 bg-emerald-500 rounded-full blur-2xl -mr-12 -mt-12"></div>
                            </div>

                            <div className="flex justify-between items-start mb-6 relative">
                                <div className="flex items-center gap-4 w-full">
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold border border-emerald-100 flex-shrink-0">
                                        {donor.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3
                                            className={`font-bold text-gray-900 capitalize leading-tight whitespace-nowrap ${donor.name.length > 25 ? 'text-xs' :
                                                donor.name.length > 20 ? 'text-sm' :
                                                    donor.name.length > 15 ? 'text-base' :
                                                        'text-lg'
                                                }`}
                                            title={donor.name}
                                        >
                                            {donor.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-medium">@{donor.username}</p>
                                    </div>
                                </div>
                                <div className={`absolute -top-6 -left-6 w-24 h-24 overflow-hidden z-10`}>
                                    <div className={`absolute top-[18px] -left-[28px] w-[120px] text-center text-xs font-bold uppercase py-1 -rotate-45 shadow-sm ${donor.status === 'approved'
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-amber-500 text-white'
                                        }`}>
                                        {donor.status}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 relative">
                                <div className="flex items-center gap-3 text-sm text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <span className="truncate">{donor.email}</span>
                                </div>
                                {donor.mobile && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                        </div>
                                        <span>{donor.mobile}</span>
                                    </div>
                                )}
                            </div>

                            {donor.status === 'pending' && (
                                <button
                                    onClick={() => approveDonor(donor.id)}
                                    className="w-full cursor-pointer group/btn relative overflow-hidden bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-emerald-200 hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Approve Request
                                    </span>
                                </button>
                            )}


                        </div>
                    ))}
                    {
                        donors.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                                No donor requests found.
                            </div>
                        )
                    }
                </div >
            )}
        </div >
    );
}
