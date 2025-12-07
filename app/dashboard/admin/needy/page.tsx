"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { NeedyPerson, Donation, Donor } from '@/types';
import { Plus, Edit2, CheckCircle, X, Check, AlertCircle, Users, Search, Filter, MapPin, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';
import NeedySkeleton from '@/components/NeedySkeleton';

const ITEMS_PER_PAGE = 6;

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

export default function NeedyPage() {
    // Data State
    const [allNeedy, setAllNeedy] = useState<NeedyPerson[]>([]);
    const [filteredNeedy, setFilteredNeedy] = useState<NeedyPerson[]>([]);
    const [displayedNeedy, setDisplayedNeedy] = useState<NeedyPerson[]>([]);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [donors, setDonors] = useState<Donor[]>([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'fulfilled'>('all');
    const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'normal' | 'low'>('all');
    const [addressFilter, setAddressFilter] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingDonors, setViewingDonors] = useState<NeedyPerson | null>(null);
    const [editingPerson, setEditingPerson] = useState<NeedyPerson | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        contact: '',
        amountNeeded: '',
        priority: 'normal',
        address: '',
    });

    // Infinite Scroll Observer
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

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    // Initial Fetch
    useEffect(() => {
        fetchNeedy();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = [...allNeedy];

        // Search Name
        if (searchTerm) {
            result = result.filter(person =>
                person.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter Status
        if (statusFilter !== 'all') {
            result = result.filter(person => person.status === statusFilter);
        }

        // Filter Priority
        if (priorityFilter !== 'all') {
            result = result.filter(person => person.priority === priorityFilter);
        }

        // Filter Address
        if (addressFilter) {
            result = result.filter(person =>
                person.address?.toLowerCase().includes(addressFilter.toLowerCase())
            );
        }

        // Sort by Priority (High -> Normal -> Low) then by Date (Newest first - assuming ID is timestamp)
        result.sort((a, b) => {
            const priorityOrder = { high: 3, normal: 2, low: 1 };
            const pA = priorityOrder[a.priority || 'normal'];
            const pB = priorityOrder[b.priority || 'normal'];

            if (pA !== pB) return pB - pA;
            return parseInt(b.id) - parseInt(a.id);
        });

        setFilteredNeedy(result);
        setPage(1); // Reset to first page on filter change
        setDisplayedNeedy(result.slice(0, ITEMS_PER_PAGE));
        setHasMore(result.length > ITEMS_PER_PAGE);
    }, [allNeedy, searchTerm, statusFilter, priorityFilter, addressFilter]);

    // Load More Logic
    useEffect(() => {
        if (page === 1) return; // Handled by filter effect

        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const newItems = filteredNeedy.slice(startIndex, endIndex);

        if (newItems.length > 0) {
            setLoadingMore(true);
            // Simulate small delay for smooth UX
            setTimeout(() => {
                setDisplayedNeedy(prev => [...prev, ...newItems]);
                setHasMore(endIndex < filteredNeedy.length);
                setLoadingMore(false);
            }, 300);
        } else {
            setHasMore(false);
        }
    }, [page, filteredNeedy]);

    const fetchNeedy = async () => {
        try {
            const res = await fetch('/api/needy');
            if (res.ok) {
                setAllNeedy(await res.json());
            }

            const donationsRes = await fetch('/api/donations');
            if (donationsRes.ok) {
                setDonations(await donationsRes.json());
            }

            const donorsRes = await fetch('/api/donors');
            if (donorsRes.ok) {
                setDonors(await donorsRes.json());
            }
        } catch (error) {
            console.error('Error fetching needy persons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (person?: NeedyPerson) => {
        if (person) {
            setEditingPerson(person);
            setFormData({
                name: person.name,
                description: person.description,
                contact: person.contact,
                amountNeeded: person.amountNeeded.toString(),
                priority: person.priority || 'normal',
                address: person.address || '',
            });
        } else {
            setEditingPerson(null);
            setFormData({ name: '', description: '', contact: '', amountNeeded: '', priority: 'normal', address: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPerson(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const method = editingPerson ? 'PUT' : 'POST';
        const body = editingPerson
            ? { ...formData, id: editingPerson.id }
            : formData;

        const res = await fetch('/api/needy', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            showToast(editingPerson ? 'Needy person updated' : 'Needy person added');
            fetchNeedy();
            handleCloseModal();
        } else {
            showToast('Operation failed', 'error');
        }
    };

    const closeRequest = async (person: NeedyPerson) => {
        const result = await Swal.fire({
            title: 'Close Request?',
            text: `Are you sure you want to close ${person.name}'s request? This will stop further donations.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, close it!'
        });

        if (result.isConfirmed) {
            const res = await fetch('/api/needy', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: person.id, status: 'fulfilled' }),
            });
            if (res.ok) {
                Swal.fire({
                    title: 'Closed!',
                    text: 'The request has been closed.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchNeedy();
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to close request.',
                    icon: 'error',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-emerald-800">Manage Needy Persons</h1>
                    <p className="text-gray-600 mt-2">View and manage requests for assistance.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="cursor-pointer flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                    <Plus className="w-4 h-4" />
                    Add Needy
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Main Content - List (Col-8) */}
                <div className="lg:col-span-8 order-2 lg:order-1">
                    <div className="grid grid-cols-1 gap-6">
                        {loading && page === 1 ? (
                            // Initial Loading Skeletons
                            Array.from({ length: 4 }).map((_, i) => <NeedySkeleton key={i} />)
                        ) : (
                            <>
                                {displayedNeedy.map((person, index) => {
                                    const isLastElement = index === displayedNeedy.length - 1;

                                    return (
                                        <div
                                            key={person.id}
                                            ref={isLastElement ? lastNeedyElementRef : null}
                                            className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow flex flex-col ${person.priority === 'high' ? 'border-red-400' :
                                                person.priority === 'low' ? 'border-blue-300' :
                                                    'border-gray-200'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-bold text-gray-900 text-lg">{person.name}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${person.status === 'fulfilled' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                                                    {person.status === 'fulfilled' ? 'Closed' : 'Open'}
                                                </span>
                                            </div>
                                            <div className="mb-2 flex flex-wrap gap-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${person.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                    person.priority === 'low' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {person.priority || 'normal'} Priority
                                                </span>
                                                {person.address && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-50 text-gray-500 border border-gray-100">
                                                        <MapPin className="w-3 h-3" />
                                                        {person.address}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow" title={person.description}>
                                                {person.description}
                                            </p>

                                            <div className="space-y-2 mb-6 text-sm">
                                                <div className="flex items-center text-gray-600">
                                                    <span className="font-medium text-gray-700 w-20">Contact:</span>
                                                    {person.contact}
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <span className="font-medium text-gray-700 w-20">Amount:</span>
                                                    <span className="font-semibold text-emerald-600">₹{person.amountNeeded.toLocaleString()}</span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mt-4">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-gray-500">Raised: ₹{(person.amountRaised || 0).toLocaleString()}</span>
                                                        <span className="text-gray-500">Remaining: ₹{Math.max(person.amountNeeded - (person.amountRaised || 0), 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                                        <div
                                                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${Math.min(((person.amountRaised || 0) / person.amountNeeded) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
                                                <button
                                                    onClick={() => setViewingDonors(person)}
                                                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Users className="w-4 h-4" />
                                                    View Donors
                                                </button>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(person)}
                                                        className="p-2 bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-600 rounded-lg transition-all cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    {person.status !== 'fulfilled' ? (
                                                        <button
                                                            onClick={() => closeRequest(person)}
                                                            className="p-2 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                                                            title="Close Request"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <span className="p-2 text-gray-400 cursor-not-allowed" title="Closed">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Loading More Skeletons */}
                                {loadingMore && (
                                    Array.from({ length: 2 }).map((_, i) => <NeedySkeleton key={`more-${i}`} />)
                                )}
                            </>
                        )}

                        {!loading && filteredNeedy.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                                No needy persons found matching your filters.
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Filters (Col-4) */}
                <div className="lg:col-span-4 order-1 lg:order-2 space-y-6 lg:sticky lg:top-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4 text-gray-800">
                            <Filter className="w-5 h-5" />
                            <h2 className="font-bold text-lg">Filters</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Search Name</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="open">Open</option>
                                    <option value="fulfilled">Fulfilled / Closed</option>
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value as any)}
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="high">High Priority</option>
                                    <option value="normal">Normal Priority</option>
                                    <option value="low">Low Priority</option>
                                </select>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nearby Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Filter by address..."
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                        value={addressFilter}
                                        onChange={(e) => setAddressFilter(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Reset Button */}
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setPriorityFilter('all');
                                    setAddressFilter('');
                                }}
                                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-dashed border-gray-300"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-6">
                        <h3 className="font-bold text-emerald-900 mb-4">Quick Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-emerald-700">Total Requests</span>
                                <span className="font-bold text-emerald-900">{allNeedy.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-emerald-700">Open Requests</span>
                                <span className="font-bold text-emerald-900">{allNeedy.filter(n => n.status !== 'fulfilled').length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-emerald-700">High Priority</span>
                                <span className="font-bold text-red-600">{allNeedy.filter(n => n.priority === 'high').length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-none bg-white z-10">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingPerson ? 'Edit Needy Person' : 'Add Needy Person'}
                            </h3>
                            <button onClick={handleCloseModal} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info (Private)</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                            value={formData.contact}
                                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                            placeholder="Full address..."
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount Needed (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                            value={formData.amountNeeded}
                                            onChange={(e) => setFormData({ ...formData, amountNeeded: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="low">Low</option>
                                            <option value="normal">Normal</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        required
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100 flex gap-3 flex-none bg-white z-10">
                                <button
                                    type="submit"
                                    className="cursor-pointer flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
                                    title={editingPerson ? 'Save Changes' : 'Add Person'}
                                >
                                    {editingPerson ? 'Save Changes' : 'Add Person'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="cursor-pointer flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                    title="Cancel"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Donors Modal */}
            {viewingDonors && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 relative">
                        <div className="p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Donation Details</h3>
                                <p className="text-sm text-gray-500">For {viewingDonors.name}</p>
                            </div>
                            <button
                                onClick={() => setViewingDonors(null)}
                                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-0 max-h-[60vh] overflow-y-auto">
                            {(() => {
                                const relevantDonations = donations.filter(d => d.needyId === viewingDonors.id);

                                // Aggregate donations by donor
                                const donorStats = relevantDonations.reduce((acc, donation) => {
                                    if (!acc[donation.donorId]) {
                                        acc[donation.donorId] = {
                                            count: 0,
                                            totalAmount: 0,
                                            donations: []
                                        };
                                    }
                                    acc[donation.donorId].count += 1;
                                    acc[donation.donorId].totalAmount += donation.amount;
                                    acc[donation.donorId].donations.push(donation);
                                    return acc;
                                }, {} as Record<string, { count: number, totalAmount: number, donations: Donation[] }>);

                                const donorIds = Object.keys(donorStats);

                                return donorIds.length > 0 ? (
                                    <div className="divide-y divide-gray-100">
                                        {donorIds.map(donorId => {
                                            const donor = donors.find(d => d.id === donorId);
                                            const stats = donorStats[donorId];

                                            return (
                                                <div key={donorId} className="px-8 py-5 hover:bg-gray-50 transition-colors flex flex-col gap-2">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                                                                {donor?.name.charAt(0) || '?'}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 capitalize leading-tight pt-1">{donor?.name || 'Unknown Donor'}</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    {stats.count} donation{stats.count > 1 ? 's' : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-bold text-emerald-600 block">₹{stats.totalAmount.toLocaleString()}</span>
                                                            {stats.count > 1 && (
                                                                <span className="text-xs text-gray-400">Total</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Individual Donations Breakdown (if more than 1) */}
                                                    {stats.count > 1 && (
                                                        <div className="mt-2 pl-3 border-l-2 border-emerald-100 text-xs text-gray-500 space-y-1">
                                                            {stats.donations.map((d, idx) => (
                                                                <div key={d.id} className="flex justify-between">
                                                                    <span>{new Date(d.date).toLocaleDateString()}</span>
                                                                    <span>₹{d.amount.toLocaleString()}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {viewingDonors.status === 'fulfilled' && donor && (
                                                        <div className="mt-2 pl-3 border-l-2 border-emerald-100 text-sm text-gray-600 bg-emerald-50/50 p-2 rounded">
                                                            <p className="font-medium text-emerald-800 text-xs uppercase tracking-wide mb-1">Contact Donor</p>
                                                            <p className="italic">Email: {donor.email}</p>
                                                            {donor.mobile && (
                                                                <p className="italic">Mobile: {donor.mobile}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p>No donations yet.</p>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Total Raised</span>
                            <span className="text-lg font-bold text-emerald-700">
                                ₹{(viewingDonors.amountRaised || 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
