"use client";

import { useEffect, useState } from 'react';
import { Plus, Trash, Edit, Video } from 'lucide-react';
import masjidsData from '@/data/masjids.json';
import speechesData from '@/data/speeches.json';
import { Masjid, Speech } from '@/types';
import { format } from 'date-fns';

const masjids = masjidsData as Masjid[];
const initialSpeeches = speechesData as Speech[];

export default function ManageSpeechesPage() {
    const [masjidId, setMasjidId] = useState<string | null>(null);
    const [speeches, setSpeeches] = useState<Speech[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<Speech>>({
        type: 'speech',
        title: '',
        speaker: '',
        datetime: '',
        youtubeUrl: '',
        description: ''
    });

    useEffect(() => {
        const id = localStorage.getItem('masjidId');
        if (id) {
            setMasjidId(id);
            // Filter speeches for this masjid
            setSpeeches(initialSpeeches.filter(s => s.masjidId === id));
        }
    }, []);

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this speech?')) {
            setSpeeches(speeches.filter(s => s.id !== id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock save
        const newSpeech: Speech = {
            id: Math.random().toString(36).substr(2, 9),
            masjidId: masjidId!,
            title: formData.title!,
            speaker: formData.speaker!,
            datetime: formData.datetime!,
            type: formData.type as 'speech' | 'event',
            youtubeUrl: formData.youtubeUrl,
            description: formData.description!
        };

        setSpeeches([...speeches, newSpeech]);
        setIsModalOpen(false);
        setFormData({ type: 'speech', title: '', speaker: '', datetime: '', youtubeUrl: '', description: '' });
        alert('Speech added successfully (Mock)');
    };

    if (!masjidId) return null;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">Manage Speeches & Events</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-slate-200">
                    {speeches.length === 0 ? (
                        <li className="px-6 py-4 text-center text-slate-500">No speeches found. Add one to get started.</li>
                    ) : (
                        speeches.map((speech) => (
                            <li key={speech.id}>
                                <div className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-slate-50">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Video className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-primary truncate">{speech.title}</div>
                                            <div className="flex items-center text-sm text-slate-500">
                                                <span className="truncate">{speech.speaker}</span>
                                                <span className="mx-1">•</span>
                                                <span>{format(new Date(speech.datetime), 'MMM d, yyyy h:mm a')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button className="p-2 text-slate-400 hover:text-slate-500">
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDelete(speech.id)} className="p-2 text-red-400 hover:text-red-500">
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
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">Add New Speech/Event</h3>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Type</label>
                                            <select
                                                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                                value={formData.type}
                                                onChange={e => setFormData({ ...formData, type: e.target.value as 'speech' | 'event' })}
                                            >
                                                <option value="speech">Speech</option>
                                                <option value="event">Event</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Title</label>
                                            <input
                                                type="text"
                                                required
                                                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Speaker</label>
                                            <input
                                                type="text"
                                                required
                                                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                                value={formData.speaker}
                                                onChange={e => setFormData({ ...formData, speaker: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                required
                                                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                                value={formData.datetime}
                                                onChange={e => setFormData({ ...formData, datetime: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">YouTube URL (Optional)</label>
                                            <input
                                                type="url"
                                                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                                value={formData.youtubeUrl}
                                                onChange={e => setFormData({ ...formData, youtubeUrl: e.target.value })}
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
                                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm">
                                        Save
                                    </button>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
