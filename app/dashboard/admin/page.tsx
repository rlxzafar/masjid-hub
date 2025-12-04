"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, HeartHandshake, HandHelping, Users, TrendingUp, DollarSign } from 'lucide-react';
import { Donor, NeedyPerson, Masjid } from '@/types';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalMasjids: 0,
        totalDonors: 0,
        totalNeedy: 0,
        totalAmountNeeded: 0,
        fulfilledRequests: 0,
        pendingDonors: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [masjidsRes, donorsRes, needyRes] = await Promise.all([
                fetch('/api/masjids'),
                fetch('/api/admin/donors'),
                fetch('/api/needy')
            ]);

            if (masjidsRes.ok && donorsRes.ok && needyRes.ok) {
                const masjids: Masjid[] = await masjidsRes.json();
                const donors: Donor[] = await donorsRes.json();
                const needy: NeedyPerson[] = await needyRes.json();

                const totalAmountNeeded = needy.reduce((sum, person) => sum + (person.status !== 'fulfilled' ? Number(person.amountNeeded) : 0), 0);
                const fulfilledRequests = needy.filter(p => p.status === 'fulfilled').length;
                const pendingDonors = donors.filter(d => d.status === 'pending').length;

                setStats({
                    totalMasjids: masjids.length,
                    totalDonors: donors.length,
                    totalNeedy: needy.length,
                    totalAmountNeeded,
                    fulfilledRequests,
                    pendingDonors
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const tiles = [
        {
            title: 'Manage Masjids',
            description: 'View and manage registered masjids',
            icon: Building2,
            href: '/dashboard/admin/masjids',
            color: 'bg-blue-500',
            stats: stats.totalMasjids
        },
        {
            title: 'Manage Donors',
            description: 'Approve and manage donor accounts',
            icon: HeartHandshake,
            href: '/dashboard/admin/donors',
            color: 'bg-emerald-500',
            stats: stats.totalDonors,
            alert: stats.pendingDonors > 0 ? `${stats.pendingDonors} Pending` : null
        },
        {
            title: 'Manage Needy',
            description: 'Track and fulfill assistance requests',
            icon: HandHelping,
            href: '/dashboard/admin/needy',
            color: 'bg-purple-500',
            stats: stats.totalNeedy,
            alert: null
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 mb-8">Overview of system activity and management.</p>

            {/* Navigation Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {tiles.map((tile) => (
                    <Link
                        key={tile.title}
                        href={tile.href}
                        className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                            <tile.icon className="w-24 h-24 text-gray-900" />
                        </div>

                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-xl ${tile.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                                <tile.icon className={`w-6 h-6 ${tile.color.replace('bg-', 'text-')}`} />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-1">{tile.title}</h3>
                            <p className="text-sm text-gray-500 mb-4">{tile.description}</p>

                            <div className="flex items-center justify-between mt-4 border-t border-gray-50 pt-4">
                                <span className="text-2xl font-bold text-gray-800">{loading ? '-' : tile.stats}</span>
                                {tile.alert && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full animate-pulse">
                                        {tile.alert}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Summary Reports / Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Financial Overview */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Assistance Overview</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Total Amount Needed</span>
                                <span className="font-bold text-gray-900">₹{stats.totalAmountNeeded.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Active Requests</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalNeedy - stats.fulfilledRequests}</p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-xl">
                                <p className="text-sm text-emerald-600 mb-1">Fulfilled Requests</p>
                                <p className="text-2xl font-bold text-emerald-700">{stats.fulfilledRequests}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Community Growth</h3>
                    </div>

                    <div className="flex items-end gap-4 h-48">
                        {/* Simple CSS Bar Chart */}
                        <div className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="w-full bg-blue-100 rounded-t-lg relative group-hover:bg-blue-200 transition-colors" style={{ height: `${(stats.totalMasjids / (stats.totalMasjids + stats.totalDonors + stats.totalNeedy || 1)) * 100}%`, minHeight: '20%' }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {stats.totalMasjids}
                                </div>
                            </div>
                            <span className="text-xs font-medium text-gray-500">Masjids</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="w-full bg-emerald-100 rounded-t-lg relative group-hover:bg-emerald-200 transition-colors" style={{ height: `${(stats.totalDonors / (stats.totalMasjids + stats.totalDonors + stats.totalNeedy || 1)) * 100}%`, minHeight: '30%' }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {stats.totalDonors}
                                </div>
                            </div>
                            <span className="text-xs font-medium text-gray-500">Donors</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="w-full bg-purple-100 rounded-t-lg relative group-hover:bg-purple-200 transition-colors" style={{ height: `${(stats.totalNeedy / (stats.totalMasjids + stats.totalDonors + stats.totalNeedy || 1)) * 100}%`, minHeight: '40%' }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {stats.totalNeedy}
                                </div>
                            </div>
                            <span className="text-xs font-medium text-gray-500">Needy</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
