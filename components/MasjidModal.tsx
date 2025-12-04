"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import { Masjid } from '@/types';

interface MasjidModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (masjid: Masjid) => void;
}

export default function MasjidModal({ isOpen, onClose, onSuccess }: MasjidModalProps) {
    const [formData, setFormData] = useState<Partial<Masjid>>({
        name: '',
        address: '',
        imamName: '',
        contact: '',
        image: '',
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/masjids', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const newMasjid = await res.json();
                onSuccess(newMasjid);
                onClose();
                // Reset form
                setFormData({ name: '', address: '', imamName: '', contact: '', image: '', username: '', password: '' });
                alert('Masjid added successfully');
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to add masjid');
            }
        } catch (error) {
            console.error('Error adding masjid:', error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">Add New Masjid</h3>
                                <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-500">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Masjid Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 border"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Address</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 border"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Imam Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 border"
                                            value={formData.imamName}
                                            onChange={e => setFormData({ ...formData, imamName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Contact</label>
                                        <input
                                            type="text"
                                            required
                                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 border"
                                            value={formData.contact}
                                            onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Image URL</label>
                                    <input
                                        type="url"
                                        className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 border"
                                        placeholder="https://example.com/masjid.jpg"
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    />
                                    <p className="mt-1 text-xs text-slate-500">Optional. Leave blank for default placeholder.</p>
                                </div>

                                <div className="border-t pt-4 mt-4">
                                    <h4 className="text-sm font-medium text-slate-900 mb-2">Login Credentials</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Username</label>
                                            <input
                                                type="text"
                                                required
                                                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 border"
                                                value={formData.username}
                                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Password</label>
                                            <input
                                                type="password"
                                                required
                                                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 border"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Masjid'}
                            </button>
                            <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
