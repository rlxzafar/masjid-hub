"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Masjid } from '@/types';
import { Plus, MapPin, ArrowLeft, Building, Edit2, Trash2, User, Phone, X, Upload, Lock, Mail, Settings, Power, Eye } from 'lucide-react';
import Swal from 'sweetalert2';

export default function MasjidsPage() {
    const [masjids, setMasjids] = useState<Masjid[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMasjid, setEditingMasjid] = useState<Masjid | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        imamName: '',
        contact: '',
        image: '',
        username: '',
        password: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchMasjids();
    }, []);

    const fetchMasjids = async () => {
        try {
            const res = await fetch('/api/masjids');
            if (res.ok) {
                setMasjids(await res.json());
            }
        } catch (error) {
            console.error('Error fetching masjids:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (masjid?: Masjid) => {
        if (masjid) {
            setEditingMasjid(masjid);
            setFormData({
                name: masjid.name,
                address: masjid.address,
                imamName: masjid.imamName,
                contact: masjid.contact,
                image: masjid.image || '',
                username: masjid.username || '',
                password: '' // Keep password empty for security, only update if provided
            });
        } else {
            setEditingMasjid(null);
            setFormData({
                name: '',
                address: '',
                imamName: '',
                contact: '',
                image: '',
                username: '',
                password: ''
            });
        }
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMasjid(null);
        setModalLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalLoading(true);

        try {
            let imageUrl = formData.image;

            if (selectedFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', selectedFile);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData,
                });

                if (!uploadRes.ok) {
                    throw new Error('Failed to upload image');
                }

                const uploadData = await uploadRes.json();
                imageUrl = uploadData.url;
            }

            const method = editingMasjid ? 'PUT' : 'POST';
            const body = editingMasjid
                ? { ...formData, image: imageUrl, id: editingMasjid.id }
                : { ...formData, image: imageUrl };

            // If editing and password is empty, remove it from body so it's not updated
            if (editingMasjid && !formData.password) {
                delete (body as any).password;
            }

            const res = await fetch('/api/masjids', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                // Fetch latest data to ensure consistency
                fetchMasjids();
                handleCloseModal();

                // Use setTimeout to ensure modal is unmounted before Swal fires
                setTimeout(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: editingMasjid ? 'Masjid updated successfully' : 'Masjid added successfully',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }, 100);
            } else {
                const error = await res.json();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.error || 'Operation failed'
                });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An unexpected error occurred'
            });
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${name}. This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/masjids?id=${id}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    setMasjids(masjids.filter(m => m.id !== id));
                    Swal.fire(
                        'Deleted!',
                        'The masjid has been deleted.',
                        'success'
                    );
                } else {
                    Swal.fire(
                        'Error!',
                        'Failed to delete masjid.',
                        'error'
                    );
                }
            } catch (error) {
                console.error('Error deleting masjid:', error);
                Swal.fire(
                    'Error!',
                    'An error occurred while deleting.',
                    'error'
                );
            }
        }
    };

    const handleToggleStatus = async (masjid: Masjid) => {
        try {
            const newStatus = !masjid.isDisabled;

            // Optimistic update
            setMasjids(masjids.map(m =>
                m.id === masjid.id ? { ...m, isDisabled: newStatus } : m
            ));

            const res = await fetch('/api/masjids', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: masjid.id,
                    isDisabled: newStatus
                }),
            });

            if (!res.ok) {
                // Revert on failure
                setMasjids(masjids.map(m =>
                    m.id === masjid.id ? { ...m, isDisabled: masjid.isDisabled } : m
                ));
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to update masjid status'
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Status Updated',
                    text: `Masjid has been ${newStatus ? 'disabled' : 'enabled'}.`,
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            // Revert on error
            setMasjids(masjids.map(m =>
                m.id === masjid.id ? { ...m, isDisabled: masjid.isDisabled } : m
            ));
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <Link
                    href="/dashboard/admin"
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-emerald-800 flex items-center gap-3">
                        <Building className="w-8 h-8" />
                        Manage Masjids
                    </h1>
                    <p className="text-gray-600 mt-2">View and manage all registered masjids.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="cursor-pointer flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg font-medium w-full sm:w-auto justify-center"
                >
                    <Plus className="w-5 h-5" />
                    Add New Masjid
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading masjids...</div>
            ) : masjids.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    No masjids found. Click "Add New Masjid" to create one.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {masjids.map(masjid => (
                        <div key={masjid.id} className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border ${masjid.isDisabled ? 'border-red-200' : 'border-gray-100'} overflow-hidden flex flex-col h-full transform hover:-translate-y-1`}>
                            {/* Cover Image */}
                            <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                                <img
                                    src={masjid.image || '/masjid-placeholder.png'}
                                    alt={masjid.name}
                                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${masjid.isDisabled ? 'grayscale' : ''}`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                                {/* Status Badge */}
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${masjid.isDisabled
                                            ? 'bg-red-500 text-white'
                                            : 'bg-emerald-500 text-white'
                                        }`}>
                                        {masjid.isDisabled ? 'DISABLED' : 'ACTIVE'}
                                    </span>
                                </div>

                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-xl font-bold text-white truncate shadow-sm" title={masjid.name}>{masjid.name}</h3>
                                    <div className="flex items-center text-emerald-100 text-sm mt-1">
                                        <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                        <span className="truncate" title={masjid.address}>{masjid.address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-5 flex-grow flex flex-col">
                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Imam</p>
                                                <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{masjid.imamName}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Contact</p>
                                                <p className="text-sm font-semibold text-gray-900">{masjid.contact}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto space-y-3">
                                    <Link
                                        href={`/dashboard/admin/masjids/${masjid.id}/manage`}
                                        className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Manage Content
                                    </Link>

                                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                            @{masjid.username}
                                        </span>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleToggleStatus(masjid)}
                                                className={`cursor-pointer p-2 rounded-lg transition-all ${masjid.isDisabled
                                                        ? 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        : 'text-emerald-600 hover:text-red-600 hover:bg-red-50'
                                                    }`}
                                                title={masjid.isDisabled ? "Enable Masjid" : "Disable Masjid"}
                                            >
                                                <Power className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(masjid)}
                                                className="cursor-pointer p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Edit Details"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(masjid.id, masjid.name)}
                                                className="cursor-pointer p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete Masjid"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Masjid Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden transform transition-all scale-100">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Building className="w-5 h-5 text-emerald-600" />
                                {editingMasjid ? 'Edit Masjid' : 'Add New Masjid'}
                            </h3>
                            <button onClick={handleCloseModal} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Masjid Name</label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                placeholder="e.g. Masjid Al-Noor"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                placeholder="Full Address"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Imam Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                placeholder="Imam's Name"
                                                value={formData.imamName}
                                                onChange={(e) => setFormData({ ...formData, imamName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                placeholder="Phone Number"
                                                value={formData.contact}
                                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Masjid Image</label>
                                        <div className="relative">
                                            <Upload className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setSelectedFile(e.target.files[0]);
                                                    }
                                                }}
                                            />
                                        </div>
                                        {formData.image && !selectedFile && (
                                            <p className="text-xs text-gray-500 mt-1">Current image: <a href={formData.image} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">View</a></p>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 mt-4">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Account Credentials</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        required
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                        placeholder="Login Username"
                                                        value={formData.username}
                                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {editingMasjid ? 'New Password (Optional)' : 'Password'}
                                                </label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                    <input
                                                        type="password"
                                                        required={!editingMasjid}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                        placeholder={editingMasjid ? "Leave blank to keep current" : "Secure Password"}
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="cursor-pointer px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalLoading}
                                    className="cursor-pointer px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {modalLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            {editingMasjid ? 'Save Changes' : 'Create Masjid'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
