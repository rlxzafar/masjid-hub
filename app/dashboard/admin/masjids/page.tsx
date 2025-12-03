"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash, Edit, MapPin } from 'lucide-react';
import { Masjid } from '@/types';
import MasjidModal from '@/components/MasjidModal';

export default function AdminMasjidsPage() {
    const [masjids, setMasjids] = useState<Masjid[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMasjids();
    }, []);

    const fetchMasjids = async () => {
        try {
            const res = await fetch('/api/masjids');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setMasjids(data);
                } else {
                    console.error('Invalid data format:', data);
                }
            } else {
                console.error('Failed to fetch masjids');
            }
        } catch (error) {
            console.error('Error fetching masjids:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this Masjid?')) {
            // In a real app, call DELETE API
            setMasjids(masjids.filter(m => m.id !== id));
        }
    };

    const handleSuccess = (newMasjid: Masjid) => {
        setMasjids([...masjids, newMasjid]);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">Manage Masjids</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Masjid
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-slate-200">
                    {masjids.map((masjid) => (
                        <li key={masjid.id}>
                            <div className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-slate-50">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
                                        <img src={masjid.image || '/masjid-placeholder.png'} alt="" className="h-full w-full object-cover" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-primary truncate">{masjid.name}</div>
                                        <div className="flex items-center text-sm text-slate-500">
                                            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400" />
                                            <span className="truncate">{masjid.address}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="p-2 text-slate-400 hover:text-slate-500">
                                        <Edit className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDelete(masjid.id)} className="p-2 text-red-400 hover:text-red-500">
                                        <Trash className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <MasjidModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
