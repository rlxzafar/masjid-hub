"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Donor, NeedyPerson } from '@/types';
import { Plus, Edit2, CheckCircle, X, Check, AlertCircle } from 'lucide-react';

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
            <button onClick={onClose} className="ml-2 hover:opacity-80">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default function AdminDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [donors, setDonors] = useState<Donor[]>([]);
    const [needy, setNeedy] = useState<NeedyPerson[]>([]);
    const [activeTab, setActiveTab] = useState<'donors' | 'needy'>('donors');

    // Toast State
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<NeedyPerson | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        contact: '',
        amountNeeded: '',
    });

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'needy') {
            setActiveTab('needy');
        } else {
            setActiveTab('donors');
        }
    }, [searchParams]);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/login');
            return;
        }
        try {
            const user = JSON.parse(userStr);
            if (user.username !== 'admin') {
                router.push('/dashboard/donor');
            }
        } catch (e) {
            router.push('/login');
        }

        fetchDonors();
        fetchNeedy();
    }, [router]);

    const fetchDonors = async () => {
        const res = await fetch('/api/admin/donors');
        if (res.ok) setDonors(await res.json());
    };

    const fetchNeedy = async () => {
        const res = await fetch('/api/needy');
        if (res.ok) setNeedy(await res.json());
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

    const handleOpenModal = (person?: NeedyPerson) => {
        if (person) {
            setEditingPerson(person);
            setFormData({
                name: person.name,
                description: person.description,
                contact: person.contact,
                amountNeeded: person.amountNeeded.toString(),
            });
        } else {
            setEditingPerson(null);
            setFormData({ name: '', description: '', contact: '', amountNeeded: '' });
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

    const markFulfilled = async (person: NeedyPerson) => {
        if (confirm(`Mark ${person.name}'s request as fulfilled?`)) {
            const res = await fetch('/api/needy', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: person.id, status: 'fulfilled' }),
            });
            if (res.ok) {
                showToast('Request marked as fulfilled');
                fetchNeedy();
            } else {
                showToast('Failed to update status', 'error');
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <h1 className="text-3xl font-bold text-emerald-800 mb-8">Admin Dashboard</h1>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('donors')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === 'donors' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    Manage Donors
                </button>
                <button
                    onClick={() => setActiveTab('needy')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === 'needy' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    Manage Needy Persons
                </button>
            </div>

            {activeTab === 'donors' && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Donor Requests</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="pb-3 font-semibold text-gray-600">Name</th>
                                    <th className="pb-3 font-semibold text-gray-600">Email</th>
                                    <th className="pb-3 font-semibold text-gray-600">Username</th>
                                    <th className="pb-3 font-semibold text-gray-600">Status</th>
                                    <th className="pb-3 font-semibold text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donors.map(donor => (
                                    <tr key={donor.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-2">{donor.name}</td>
                                        <td className="py-3 px-2">{donor.email}</td>
                                        <td className="py-3 px-2">{donor.username}</td>
                                        <td className="py-3 px-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${donor.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {donor.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2">
                                            {donor.status === 'pending' && (
                                                <button
                                                    onClick={() => approveDonor(donor.id)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1 rounded transition-colors shadow-sm"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'needy' && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Needy Persons List</h2>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            Add Needy
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="pb-3 font-semibold text-gray-600">Name</th>
                                    <th className="pb-3 font-semibold text-gray-600">Description</th>
                                    <th className="pb-3 font-semibold text-gray-600">Contact</th>
                                    <th className="pb-3 font-semibold text-gray-600">Amount</th>
                                    <th className="pb-3 font-semibold text-gray-600">Status</th>
                                    <th className="pb-3 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {needy.map(person => (
                                    <tr key={person.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-2 font-medium">{person.name}</td>
                                        <td className="py-3 px-2 max-w-xs truncate" title={person.description}>{person.description}</td>
                                        <td className="py-3 px-2">{person.contact}</td>
                                        <td className="py-3 px-2">${person.amountNeeded}</td>
                                        <td className="py-3 px-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${person.status === 'fulfilled' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                {person.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(person)}
                                                    className="p-2 bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-600 rounded-full transition-all cursor-pointer"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                {person.status !== 'fulfilled' && (
                                                    <button
                                                        onClick={() => markFulfilled(person)}
                                                        className="p-2 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-full transition-all cursor-pointer"
                                                        title="Mark as Fulfilled"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {needy.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-500">
                                            No needy persons found. Click "Add Needy" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingPerson ? 'Edit Needy Person' : 'Add Needy Person'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Needed ($)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    value={formData.amountNeeded}
                                    onChange={(e) => setFormData({ ...formData, amountNeeded: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
                                >
                                    {editingPerson ? 'Save Changes' : 'Add Person'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
