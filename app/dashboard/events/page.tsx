"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash, Edit, Calendar } from 'lucide-react';
import { MasjidEvent } from '@/types';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

export default function ManageEventsPage() {
    const router = useRouter();
    const [masjidId, setMasjidId] = useState<string | null>(null);
    const [events, setEvents] = useState<MasjidEvent[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState<Partial<MasjidEvent>>({
        type: 'other',
        title: '',
        datetime: '',
        description: ''
    });

    useEffect(() => {
        const id = localStorage.getItem('masjidId');
        if (id) {
            setMasjidId(id);
            setMasjidId(id);
            fetchMasjidDetails(id);
            fetchEvents(id);
        }
    }, []);

    const fetchMasjidDetails = async (id: string) => {
        try {
            const res = await fetch('/api/masjids');
            if (res.ok) {
                const masjids: any[] = await res.json();
                const found = masjids.find(m => m.id === id);
                if (found && found.isDisabled) {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Access Denied',
                        text: 'Your masjid account has been disabled. Please contact admin support.',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showConfirmButton: true,
                        confirmButtonText: 'Go to Dashboard'
                    });
                    router.push('/dashboard');
                }
            }
        } catch (error) {
            console.error('Error fetching masjid details:', error);
        }
    };

    const fetchEvents = async (id: string) => {
        try {
            const res = await fetch(`/api/events?masjidId=${id}`);
            if (res.ok) {
                setEvents(await res.json());
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setEvents(events.filter(e => e.id !== id));
                    Swal.fire('Deleted!', 'The event has been deleted.', 'success');
                } else {
                    Swal.fire('Error!', 'Failed to delete event.', 'error');
                }
            } catch (error) {
                console.error('Error deleting event:', error);
                Swal.fire('Error!', 'An unexpected error occurred.', 'error');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!masjidId) return;

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, masjidId }),
            });

            if (res.ok) {
                const newEvent = await res.json();
                setEvents([...events, newEvent]);
                setIsModalOpen(false);
                setFormData({ type: 'other', title: '', datetime: '', description: '' });
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Event added successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to add event'
                });
            }
        } catch (error) {
            console.error('Error adding event:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An unexpected error occurred'
            });
        }
    };

    if (!masjidId) return null;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">Manage Events</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Event
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-slate-200">
                    {events.length === 0 ? (
                        <li className="px-6 py-4 text-center text-slate-500">No events found. Add one to get started.</li>
                    ) : (
                        events.map((event) => (
                            <li key={event.id}>
                                <div className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-slate-50">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-primary truncate">{event.title}</div>
                                            <div className="flex items-center text-sm text-slate-500">
                                                <span className="capitalize px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {event.type}
                                                </span>
                                                <span className="mx-1">•</span>
                                                <span>{format(new Date(event.datetime), 'MMM d, yyyy h:mm a')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleDelete(event.id)} className="cursor-pointer p-2 text-red-400 hover:text-red-500">
                                            <Trash className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Simple Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/50 transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    ></div>

                    <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                        <form onSubmit={handleSubmit}>
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">Add New Event</h3>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Type</label>
                                        <select
                                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-3 px-4"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value as 'khutba' | 'iftari' | 'meeting' | 'other' })}
                                        >
                                            <option value="khutba">Khutba</option>
                                            <option value="iftari">Iftari</option>
                                            <option value="meeting">Meeting</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Title</label>
                                        <input
                                            type="text"
                                            required
                                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-3 px-4"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-3 px-4"
                                            value={formData.datetime}
                                            onChange={e => setFormData({ ...formData, datetime: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Description</label>
                                        <textarea
                                            rows={3}
                                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="submit" className="cursor-pointer w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm">
                                    Save
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="cursor-pointer mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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
