"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NeedyPerson, Donation } from '@/types';
import { Heart, DollarSign, Users, X } from 'lucide-react';

export default function DonorDashboard() {
    const router = useRouter();
    const [needy, setNeedy] = useState<NeedyPerson[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalDonated, setTotalDonated] = useState(0);
    const [user, setUser] = useState<any>(null);

    // Modal State
    const [selectedPerson, setSelectedPerson] = useState<NeedyPerson | null>(null);
    const [donationAmount, setDonationAmount] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/login');
            return;
        }
        const userData = JSON.parse(userStr);
        setUser(userData);

        fetchData(userData.id);
    }, [router]);

    const fetchData = async (userId: string) => {
        setLoading(true);
        try {
            // Fetch Needy Persons
            const needyRes = await fetch('/api/needy');
            if (needyRes.ok) {
                setNeedy(await needyRes.json());
            }

            // Fetch Donor Stats
            const donationsRes = await fetch(`/api/donations?donorId=${userId}`);
            if (donationsRes.ok) {
                const donations: Donation[] = await donationsRes.json();
                const total = donations.reduce((sum, d) => sum + d.amount, 0);
                setTotalDonated(total);
            }
        } catch (error) {
            console.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleDonateClick = (person: NeedyPerson) => {
        setSelectedPerson(person);
        setDonationAmount('');
        setIsModalOpen(true);
    };

    const handleDonationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPerson || !user || !donationAmount) return;

        const amount = parseFloat(donationAmount);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        try {
            const res = await fetch('/api/donations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    donorId: user.id,
                    needyId: selectedPerson.id,
                    amount: amount
                }),
            });

            if (res.ok) {
                alert('Thank you for your donation!');
                setIsModalOpen(false);
                fetchData(user.id); // Refresh data
            } else {
                alert('Failed to process donation');
            }
        } catch (error) {
            console.error('Donation failed', error);
            alert('An error occurred');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-emerald-800">Donor Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {user?.name}</p>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem('user');
                        router.push('/login');
                    }}
                    className="text-red-600 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                    Logout
                </button>
            </div>

            {/* Stats Card */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-white/20 rounded-full">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-emerald-100 text-sm font-medium">Total Donated</p>
                            <h3 className="text-3xl font-bold">${totalDonated.toLocaleString()}</h3>
                        </div>
                    </div>
                    <p className="text-emerald-100 text-sm mt-2">Thank you for your generosity!</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Lives Impacted</p>
                        <h3 className="text-2xl font-bold text-gray-800">--</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Platform Total</p>
                        <h3 className="text-2xl font-bold text-gray-800">--</h3>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">Urgent Needs</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {needy.map(person => {
                    const raised = person.amountRaised || 0;
                    const needed = person.amountNeeded;
                    const percent = Math.min((raised / needed) * 100, 100);
                    const remaining = Math.max(needed - raised, 0);

                    return (
                        <div key={person.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${person.status === 'fulfilled'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                        {person.status === 'fulfilled' ? 'Fulfilled' : 'Active'}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">{person.name}</h3>
                                <p className="text-gray-600 mb-6 line-clamp-3 text-sm">{person.description}</p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-gray-500">Raised: ${raised.toLocaleString()}</span>
                                        <span className="text-gray-900">Goal: ${needed.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-right text-emerald-600 font-semibold">
                                        {percent.toFixed(0)}% Funded
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 pt-0 mt-auto">
                                {person.status !== 'fulfilled' ? (
                                    <button
                                        onClick={() => handleDonateClick(person)}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Heart className="w-4 h-4" />
                                        Donate Now
                                    </button>
                                ) : (
                                    <button disabled className="w-full bg-gray-100 text-gray-400 font-semibold py-3 px-4 rounded-xl cursor-not-allowed">
                                        Goal Reached
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {needy.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No active requests at the moment. Please check back later.
                    </div>
                )}
            </div>

            {/* Donation Modal */}
            {isModalOpen && selectedPerson && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800">Make a Donation</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <p className="text-gray-500 text-sm mb-1">You are donating to</p>
                                <h4 className="text-lg font-bold text-emerald-800">{selectedPerson.name}</h4>
                                <p className="text-sm text-gray-600 mt-2">
                                    Amount needed: <span className="font-semibold">${Math.max(selectedPerson.amountNeeded - (selectedPerson.amountRaised || 0), 0)}</span>
                                </p>
                            </div>

                            <form onSubmit={handleDonationSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Donation Amount ($)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-lg font-semibold"
                                            placeholder="Enter amount"
                                            value={donationAmount}
                                            onChange={(e) => setDonationAmount(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-emerald-200 mt-4"
                                >
                                    Confirm Donation
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
