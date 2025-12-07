"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { NeedyPerson, Donation } from '@/types';
import { Heart, DollarSign, Users, X } from 'lucide-react';
import HadithSlider from '@/components/HadithSlider';
import NeedySkeleton from '@/components/NeedySkeleton';

const ITEMS_PER_PAGE = 6;

export default function DonorDashboard() {
    const router = useRouter();
    const [allNeedy, setAllNeedy] = useState<NeedyPerson[]>([]);
    const [displayedNeedy, setDisplayedNeedy] = useState<NeedyPerson[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [totalDonated, setTotalDonated] = useState(0);
    const [user, setUser] = useState<any>(null);
    const [myDonations, setMyDonations] = useState<Donation[]>([]);

    // Modal State
    const [selectedPerson, setSelectedPerson] = useState<NeedyPerson | null>(null);
    const [donationAmount, setDonationAmount] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastNeedyElementRef = useCallback((node: HTMLDivElement) => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

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

    useEffect(() => {
        if (allNeedy.length > 0) {
            loadMoreData();
        }
    }, [page, allNeedy]);

    const loadMoreData = () => {
        setLoadingMore(true);
        // Simulate network delay for better UX feel of infinite scroll
        setTimeout(() => {
            const startIndex = (page - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const newItems = allNeedy.slice(startIndex, endIndex);

            if (newItems.length > 0) {
                setDisplayedNeedy(prev => page === 1 ? newItems : [...prev, ...newItems]);
                setHasMore(endIndex < allNeedy.length);
            } else {
                setHasMore(false);
            }
            setLoadingMore(false);
        }, 500);
    };

    const fetchData = async (userId: string) => {
        setLoading(true);
        try {
            // Fetch Needy Persons
            const needyRes = await fetch('/api/needy');

            // Fetch Donor Stats
            const donationsRes = await fetch(`/api/donations?donorId=${userId}`);

            if (needyRes.ok && donationsRes.ok) {
                const needyData: NeedyPerson[] = await needyRes.json();
                const donations: Donation[] = await donationsRes.json();

                setMyDonations(donations);
                const total = donations.reduce((sum, d) => sum + d.amount, 0);
                setTotalDonated(total);

                // Filter and Sort Logic
                const filteredAndSorted = needyData
                    .filter(person => {
                        const isFulfilled = person.status === 'fulfilled' || (person.amountRaised || 0) >= person.amountNeeded;
                        const hasDonated = donations.some(d => d.needyId === person.id);

                        // If fulfilled and user hasn't donated, hide it
                        if (isFulfilled && !hasDonated) return false;

                        // If fulfilled and time passed > 1 month, hide from everyone
                        if (isFulfilled) {
                            const fulfilledDate = person.fulfilledAt ? new Date(person.fulfilledAt) : new Date(parseInt(person.id));
                            const oneMonthAgo = new Date();
                            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

                            if (fulfilledDate < oneMonthAgo) return false;
                        }

                        return true;
                    })
                    .sort((a, b) => {
                        const urgencyOrder = { critical: 3, urgent: 2, necessary: 1 };
                        const pA = urgencyOrder[a.urgency || 'urgent'];
                        const pB = urgencyOrder[b.urgency || 'urgent'];
                        return pB - pA;
                    });

                setAllNeedy(filteredAndSorted);
                // Initial load will be handled by the useEffect dependent on allNeedy
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
                setPage(1); // Reset pagination
            } else {
                alert('Failed to process donation');
            }
        } catch (error) {
            console.error('Donation failed', error);
            alert('An error occurred');
        }
    };

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
                    className="cursor-pointer text-red-600 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                    Logout
                </button>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">

                {/* Right Sidebar - Hadith Slider (Sticky on Desktop) */}
                <div className="lg:col-span-5 lg:order-2 w-full lg:sticky lg:top-8 h-fit">
                    <HadithSlider />
                </div>

                {/* Left Column - Needy List */}
                <div className="lg:col-span-7 lg:order-1 w-full">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Urgent Needs</h2>

                    <div className="grid grid-cols-1 gap-6">
                        {loading && page === 1 ? (
                            // Initial Loading Skeletons
                            Array.from({ length: 6 }).map((_, i) => <NeedySkeleton key={i} />)
                        ) : (
                            <>
                                {displayedNeedy.map((person, index) => {
                                    const raised = person.amountRaised || 0;
                                    const needed = person.amountNeeded;
                                    const percent = Math.min((raised / needed) * 100, 100);
                                    const isFulfilled = person.status === 'fulfilled' || raised >= needed;

                                    // Attach ref to the last element
                                    const isLastElement = index === displayedNeedy.length - 1;
                                    return (
                                        <div
                                            key={person.id}
                                            ref={isLastElement ? lastNeedyElementRef : null}
                                            className={`bg-white rounded-2xl shadow-sm border hover:shadow-md transition-all overflow-hidden flex flex-col ${person.urgency === 'critical' ? 'border-red-400' :
                                                person.urgency === 'necessary' ? 'border-blue-300' :
                                                    'border-gray-200'
                                                }`}
                                        >
                                            <div className="p-6 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isFulfilled
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-emerald-100 text-emerald-700'
                                                            }`}>
                                                            {isFulfilled ? 'Fulfilled' : 'Active'}
                                                        </span>
                                                        {person.urgency === 'critical' && (
                                                            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">Critical Urgency</span>
                                                        )}
                                                    </div>

                                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{person.name}</h3>
                                                    {person.fatherName && (
                                                        <p className="text-sm text-gray-500 mb-2">S/O {person.fatherName}</p>
                                                    )}

                                                    {person.address && (
                                                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                            {person.address}
                                                        </div>
                                                    )}

                                                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{person.description}</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm font-medium">
                                                        <span className="text-gray-500">Raised: <span className="text-gray-900">₹{raised.toLocaleString()}</span></span>
                                                        <span className="text-gray-500">Goal: <span className="text-gray-900">₹{needed.toLocaleString()}</span></span>
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

                                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
                                                <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    Verified Case
                                                </div>
                                                {!isFulfilled ? (
                                                    <button
                                                        onClick={() => handleDonateClick(person)}
                                                        className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-emerald-200/50 text-sm"
                                                    >
                                                        <Heart className="w-4 h-4" />
                                                        Donate
                                                    </button>
                                                ) : (
                                                    <button disabled className="bg-gray-200 text-gray-400 font-semibold py-2.5 px-6 rounded-xl cursor-not-allowed text-sm">
                                                        Goal Reached
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {loadingMore && (
                                    Array.from({ length: 3 }).map((_, i) => <NeedySkeleton key={`more-${i}`} />)
                                )}
                            </>
                        )}

                        {!loading && allNeedy.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No active requests at the moment. Please check back later.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Donation Modal */}
            {isModalOpen && selectedPerson && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800">Make a Donation</h3>
                            <button onClick={() => setIsModalOpen(false)} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <p className="text-gray-500 text-sm mb-1">You are donating to</p>
                                <h4 className="text-lg font-bold text-emerald-800">{selectedPerson.name}</h4>
                                <p className="text-sm text-gray-600 mt-2">
                                    Amount needed: <span className="font-semibold">₹{Math.max(selectedPerson.amountNeeded - (selectedPerson.amountRaised || 0), 0)}</span>
                                </p>
                            </div>

                            <form onSubmit={handleDonationSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Donation Amount (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
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
                                    className="cursor-pointer w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-emerald-200 mt-4"
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
