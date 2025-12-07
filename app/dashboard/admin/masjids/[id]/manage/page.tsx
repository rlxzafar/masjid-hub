"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Masjid, Speech } from '@/types';
import { ArrowLeft, Building, MapPin, User, Calendar, Mic, Search, Trash2, ExternalLink } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ManageMasjidPage() {
    const params = useParams();
    const masjidId = params.id as string;

    const [masjid, setMasjid] = useState<Masjid | null>(null);
    const [khutbas, setKhutbas] = useState<Speech[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (masjidId) {
            fetchData();
        }
    }, [masjidId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Masjid Details
            const masjidRes = await fetch(`/api/masjids?id=${masjidId}`);
            if (masjidRes.ok) {
                setMasjid(await masjidRes.json());
            }

            // Fetch Khutbas
            const khutbaRes = await fetch(`/api/speeches?masjidId=${masjidId}`);
            if (khutbaRes.ok) {
                const data = await khutbaRes.json();
                setKhutbas(data.speeches || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            Swal.fire('Error', 'Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteKhutba = async (id: string, title: string) => {
        const result = await Swal.fire({
            title: 'Delete Khutba?',
            text: `Are you sure you want to delete "${title}"? This cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/speeches?id=${id}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    setKhutbas(khutbas.filter(k => k.id !== id));
                    Swal.fire('Deleted!', 'Khutba has been deleted.', 'success');
                } else {
                    Swal.fire('Error!', 'Failed to delete khutba.', 'error');
                }
            } catch (error) {
                console.error('Error deleting khutba:', error);
                Swal.fire('Error!', 'An error occurred while deleting.', 'error');
            }
        }
    };

    const filteredKhutbas = khutbas.filter(k =>
        k.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.speaker.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading details...</div>;
    }

    if (!masjid) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Masjid Not Found</h2>
                <Link href="/dashboard/admin/masjids" className="text-emerald-600 hover:underline mt-4 inline-block">
                    Return to List
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            {/* Header / Breadcrumb */}
            <div className="mb-8">
                <Link
                    href="/dashboard/admin/masjids"
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to All Masjids
                </Link>
            </div>

            {/* Masjid Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10">
                <div className="relative h-48 md:h-64 bg-gray-900">
                    <img
                        src={masjid.image || '/masjid-placeholder.png'}
                        alt={masjid.name}
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{masjid.name}</h1>
                                <div className="flex flex-col sm:flex-row gap-4 text-gray-200 text-sm">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-emerald-400" />
                                        {masjid.address}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <User className="w-4 h-4 text-emerald-400" />
                                        Imam: {masjid.imamName}
                                    </span>
                                </div>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase shadow-sm ${masjid.isDisabled
                                    ? 'bg-red-500 text-white'
                                    : 'bg-emerald-500 text-white'
                                }`}>
                                {masjid.isDisabled ? 'Disabled' : 'Active'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Mic className="w-6 h-6 text-emerald-600" />
                    Manage Khutbas
                    <span className="text-sm font-normal text-gray-500 ml-2 bg-gray-100 px-2 py-0.5 rounded-full">
                        {khutbas.length}
                    </span>
                </h2>

                <div className="relative w-full md:w-auto min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search khutbas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
            </div>

            {/* Khutbas List */}
            {filteredKhutbas.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mic className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No content found</h3>
                    <p className="text-gray-500 mt-1">
                        {searchQuery ? `No khutbas match "${searchQuery}"` : "This masjid hasn't uploaded any khutbas yet."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredKhutbas.map(khutba => (
                        <div key={khutba.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-gray-900 line-clamp-2" title={khutba.title}>
                                    {khutba.title}
                                </h3>
                                <a
                                    href={khutba.youtubeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                    title="View on YouTube"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-gray-600">
                                    <User className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                    {khutba.speaker}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                    {new Date(khutba.datetime).toLocaleDateString()}
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                                {khutba.description || "No description provided."}
                            </p>

                            <div className="pt-4 border-t border-gray-50 flex justify-end">
                                <button
                                    onClick={() => handleDeleteKhutba(khutba.id, khutba.title)}
                                    className="cursor-pointer flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
