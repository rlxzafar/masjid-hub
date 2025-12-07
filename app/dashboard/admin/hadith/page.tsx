"use client";
import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, AlertCircle, Quote } from 'lucide-react';
import Swal from 'sweetalert2';

interface Hadith {
    id: string;
    arabic: string;
    english: string;
    source: string;
    topic: string;
}

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

export default function HadithPage() {
    const [hadiths, setHadiths] = useState<Hadith[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHadith, setEditingHadith] = useState<Hadith | null>(null);
    const [formData, setFormData] = useState({
        arabic: '',
        english: '',
        source: '',
        topic: '',
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    useEffect(() => {
        fetchHadiths();
    }, []);

    const fetchHadiths = async () => {
        try {
            const res = await fetch('/api/hadiths');
            if (res.ok) {
                setHadiths(await res.json());
            }
        } catch (error) {
            console.error('Error fetching hadiths:', error);
            showToast('Failed to fetch hadiths', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (hadith?: Hadith) => {
        if (hadith) {
            setEditingHadith(hadith);
            setFormData({
                arabic: hadith.arabic,
                english: hadith.english,
                source: hadith.source,
                topic: hadith.topic,
            });
        } else {
            setEditingHadith(null);
            setFormData({ arabic: '', english: '', source: '', topic: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingHadith(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const method = editingHadith ? 'PUT' : 'POST';
        const body = editingHadith
            ? { ...formData, id: editingHadith.id }
            : formData;

        try {
            const res = await fetch('/api/hadiths', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                showToast(editingHadith ? 'Hadith updated' : 'Hadith added');
                fetchHadiths();
                handleCloseModal();
            } else {
                showToast('Operation failed', 'error');
            }
        } catch (error) {
            showToast('Operation failed', 'error');
        }
    };

    const handleDelete = async (hadith: Hadith) => {
        const result = await Swal.fire({
            title: 'Delete Hadith?',
            text: `Are you sure you want to delete this Hadith?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/hadiths?id=${hadith.id}`, {
                    method: 'DELETE',
                });
                if (res.ok) {
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'The Hadith has been deleted.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    fetchHadiths();
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to delete Hadith.',
                        icon: 'error',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete Hadith.',
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
                    <h1 className="text-3xl font-bold text-emerald-800">Manage Hadiths</h1>
                    <p className="text-gray-600 mt-2">Add, edit, and remove Hadiths displayed on the dashboard.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="cursor-pointer flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                    <Plus className="w-4 h-4" />
                    Add Hadith
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-64 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : hadiths.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                    <Quote className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>No Hadiths found. Add one to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hadiths.map((hadith) => (
                        <div key={hadith.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col relative group">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenModal(hadith)}
                                    className="p-2 bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-600 rounded-lg transition-all cursor-pointer"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(hadith)}
                                    className="p-2 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                                {hadith.topic}
                            </span>

                            <h3 className="text-xl font-bold text-gray-900 mb-3 font-arabic text-right leading-relaxed" dir="rtl">
                                {hadith.arabic}
                            </h3>

                            <p className="text-gray-600 text-sm mb-4 italic flex-grow">
                                "{hadith.english}"
                            </p>

                            <div className="pt-4 border-t border-gray-100 mt-auto">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Source: <span className="text-emerald-600">{hadith.source}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingHadith ? 'Edit Hadith' : 'Add Hadith'}
                            </h3>
                            <button onClick={handleCloseModal} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="e.g. Charity, Iman"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Arabic Text</label>
                                <textarea
                                    required
                                    dir="rtl"
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-arabic text-lg"
                                    placeholder="Enter Arabic text..."
                                    value={formData.arabic}
                                    onChange={(e) => setFormData({ ...formData, arabic: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">English Translation</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Enter English translation..."
                                    value={formData.english}
                                    onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="e.g. Sahih Al-Bukhari"
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="submit"
                                    className="cursor-pointer flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
                                >
                                    {editingHadith ? 'Save Changes' : 'Add Hadith'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="cursor-pointer flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
