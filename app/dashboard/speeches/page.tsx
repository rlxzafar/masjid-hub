"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash, Video, Search, Calendar, User, Mic, Filter, X, LayoutGrid, List as ListIcon, Pencil } from 'lucide-react';
import { Speech, Masjid } from '@/types';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { useInView } from 'react-intersection-observer';
import { SpeechSkeleton } from '@/components/SpeechSkeleton';

interface PaginatedResponse {
    speeches: Speech[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
}

export default function ManageSpeechesPage() {
    const router = useRouter();
    const [masjidId, setMasjidId] = useState<string | null>(null);
    const [currentMasjid, setCurrentMasjid] = useState<Masjid | null>(null);
    const [speeches, setSpeeches] = useState<Speech[]>([]);
    const [totalSpeeches, setTotalSpeeches] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editingSpeech, setEditingSpeech] = useState<Speech | null>(null);
    const [formData, setFormData] = useState<Partial<Speech>>({
        title: '',
        speaker: 'Imam Name', // Default placeholder
        datetime: new Date().toISOString().slice(0, 16), // Default to current time
        youtubeUrl: '',
        description: ''
    });

    const { ref, inView } = useInView();

    useEffect(() => {
        const id = localStorage.getItem('masjidId');
        if (id) {
            setMasjidId(id);
            fetchMasjidDetails(id);
            fetchSpeeches(id, 1, '', '', '', true);
        }
    }, []);

    const fetchMasjidDetails = async (id: string) => {
        try {
            const res = await fetch('/api/masjids');
            if (res.ok) {
                const masjids: Masjid[] = await res.json();
                const found = masjids.find(m => m.id === id);
                if (found) {
                    if (found.isDisabled) {
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
                        return;
                    }
                    setCurrentMasjid(found);
                }
            }
        } catch (error) {
            console.error('Error fetching masjid details:', error);
        }
    };

    useEffect(() => {
        if (inView && hasMore && !loading && !loadingMore && masjidId) {
            fetchSpeeches(masjidId, page + 1, searchQuery, startDate, endDate, false);
        }
    }, [inView, hasMore, loading, loadingMore, masjidId, page, searchQuery, startDate, endDate]);

    useEffect(() => {
        if (!masjidId) return;
        const timer = setTimeout(() => {
            fetchSpeeches(masjidId, 1, searchQuery, startDate, endDate, true);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, startDate, endDate, masjidId]);

    useEffect(() => {
        if (isModalOpen && formData.title && formData.speaker) {
            const autoDesc = `This video uploaded by Masjid 360 on the topic of ${formData.title} by ${formData.speaker}`;
            setFormData(prev => ({ ...prev, description: autoDesc }));
        }
    }, [formData.title, formData.speaker, isModalOpen]);



    const fetchSpeeches = async (id: string, pageNum: number, search: string, start: string, end: string, reset: boolean) => {
        if (reset) {
            setLoading(true);
            setPage(1);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = new URLSearchParams({
                masjidId: id,
                page: pageNum.toString(),
                limit: '9',
                search: search
            });

            if (start) params.append('startDate', start);
            if (end) params.append('endDate', end);

            const res = await fetch(`/api/speeches?${params}`);
            if (res.ok) {
                const data: PaginatedResponse = await res.json();
                const fetchedSpeeches = data.speeches;

                if (reset) {
                    setSpeeches(fetchedSpeeches);
                } else {
                    setSpeeches(prev => {
                        const existingIds = new Set(prev.map(p => p.id));
                        const uniqueNew = fetchedSpeeches.filter(s => !existingIds.has(s.id));
                        return [...prev, ...uniqueNew];
                    });
                }

                setHasMore(data.pagination.hasMore);
                setTotalSpeeches(data.pagination.total);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Error fetching speeches:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        const result = await Swal.fire({
            title: 'Delete Khutba?',
            text: "This will remove the video from YouTube and the database.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                Swal.fire({
                    title: 'Deleting...',
                    text: 'Removing video from YouTube and database.',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                const res = await fetch(`/api/speeches?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setSpeeches(speeches.filter(s => s.id !== id));
                    setTotalSpeeches(prev => Math.max(0, prev - 1));
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Video removed successfully.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire('Error!', 'Failed to delete Khutba.', 'error');
                }
            } catch (error) {
                console.error('Error deleting speech:', error);
                Swal.fire('Error!', 'An unexpected error occurred.', 'error');
            }
        }
    };

    const extractVideoId = (url: string) => {
        if (!url) return null;
        if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
        if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
        return null;
    };

    const handleOpenModal = () => {
        setEditingSpeech(null);
        setFormData({
            title: '',
            speaker: 'Imam Name',
            datetime: new Date().toISOString().slice(0, 16),
            youtubeUrl: '',
            description: ''
        });
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleEdit = (speech: Speech) => {
        setEditingSpeech(speech);
        setFormData({
            title: speech.title,
            speaker: speech.speaker,
            datetime: speech.datetime,
            youtubeUrl: speech.youtubeUrl,
            description: speech.description
        });
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!masjidId) return;

        if (!editingSpeech) {
            if (!selectedFile && !formData.youtubeUrl) {
                Swal.fire('Error', 'Please provide either an Audio File or a YouTube URL', 'error');
                return;
            }
        }

        try {
            setIsSubmitting(true);
            if (editingSpeech) {
                // Handle Update (PUT)
                const res = await fetch('/api/speeches', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingSpeech.id,
                        masjidId,
                        title: formData.title,
                        speaker: formData.speaker,
                        datetime: formData.datetime,
                        description: formData.description
                    })
                });

                if (res.ok) {
                    const updatedSpeech = await res.json();
                    setSpeeches(prev => prev.map(s => s.id === updatedSpeech.id ? updatedSpeech : s));
                    setIsModalOpen(false);
                    Swal.fire({ icon: 'success', title: 'Updated!', text: 'Speech details updated successfully.', timer: 1500, showConfirmButton: false });
                } else {
                    const err = await res.json();
                    Swal.fire('Error', err.error || 'Failed to update speech', 'error');
                }
                setIsSubmitting(false);
                return;
            }

            const submitData = new FormData();
            submitData.append('masjidId', masjidId);
            submitData.append('title', formData.title || '');
            submitData.append('speaker', formData.speaker || '');
            submitData.append('datetime', formData.datetime || '');
            submitData.append('description', formData.description || '');

            if (formData.youtubeUrl) submitData.append('youtubeUrl', formData.youtubeUrl);
            if (selectedFile) submitData.append('file', selectedFile);

            if (selectedFile) {
                // Show initial progress popup
                Swal.fire({
                    title: 'Uploading Audio...',
                    html: `
                        <div class="mb-2">Please wait while we upload your file.</div>
                        <div class="w-full bg-slate-200 rounded-full h-2.5 mb-1">
                            <div id="upload-progress-bar" class="bg-primary h-2.5 rounded-full" style="width: 0%"></div>
                        </div>
                        <div id="upload-progress-text" class="text-xs text-slate-500 text-center">0%</div>
                    `,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => Swal.showLoading()
                });

                // Use XMLHttpRequest for progress tracking
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/speeches', true);

                // 1. Upload Progress (Client -> Server) - Maps to 0-30%
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 30);
                        const progressBar = document.getElementById('upload-progress-bar');
                        const progressText = document.getElementById('upload-progress-text');

                        if (progressBar) progressBar.style.width = `${percentComplete}%`;
                        if (progressText) progressText.innerText = `Uploading... ${Math.round((event.loaded / event.total) * 100)}%`;
                    }
                };

                // 2. Download Progress (Server Stream) - Maps to 30-100%
                xhr.onprogress = () => {
                    const response = xhr.responseText;
                    const lines = response.split('\n').filter(line => line.trim() !== '');
                    if (lines.length > 0) {
                        try {
                            const lastMsg = JSON.parse(lines[lines.length - 1]);
                            const progressBar = document.getElementById('upload-progress-bar');
                            const progressText = document.getElementById('upload-progress-text');

                            if (lastMsg.type === 'progress') {
                                let totalPercent = 30;
                                let statusText = 'Processing...';

                                if (lastMsg.stage === 'encoding') {
                                    // Encoding maps to 30-80%
                                    totalPercent = 30 + Math.round(lastMsg.percent * 0.5);
                                    statusText = `Converting Audio... ${lastMsg.percent}%`;
                                } else if (lastMsg.stage === 'uploading') {
                                    // YouTube Upload maps to 80-100%
                                    totalPercent = 80 + Math.round(lastMsg.percent * 0.2); // Usually percent is 0 here since simplified
                                    statusText = 'Uploading to YouTube...';
                                    if (lastMsg.percent === 0) totalPercent = 80;
                                }

                                if (progressBar) progressBar.style.width = `${totalPercent}%`;
                                if (progressText) progressText.innerText = statusText;
                            }
                        } catch (e) {
                            // meaningful partial chunks might be ignored, ensuring only valid JSON is processed
                        }
                    }
                };

                xhr.onload = async () => {
                    setIsSubmitting(false);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        // Find the completion message
                        const lines = xhr.responseText.split('\n').filter(line => line.trim() !== '');
                        let newSpeech = null;

                        try {
                            for (const line of lines) {
                                const msg = JSON.parse(line);
                                if (msg.type === 'complete') {
                                    newSpeech = msg.speech;
                                    break;
                                }
                                if (msg.type === 'error') {
                                    throw new Error(msg.message);
                                }
                            }
                        } catch (e: any) {
                            Swal.fire('Error', e.message || 'Failed to parse server response', 'error');
                            return;
                        }

                        if (newSpeech) {
                            setSpeeches(prev => [newSpeech, ...prev]);
                            setIsModalOpen(false);
                            setFormData({ title: '', speaker: '', datetime: '', youtubeUrl: '', description: '' });
                            setSelectedFile(null);

                            Swal.fire({
                                icon: 'success',
                                title: 'Published!',
                                text: 'Your Khutba is now live.',
                                timer: 1500,
                                showConfirmButton: false
                            });
                        } else {
                            Swal.fire('Error', 'Upload completed but speech data missing', 'error');
                        }
                    } else {
                        // Handle standard HTTP errors
                        Swal.fire('Error', 'Server connection failed', 'error');
                    }
                };

                xhr.onerror = () => {
                    setIsSubmitting(false);
                    Swal.fire('Error', 'Network error occurred', 'error');
                };

                xhr.send(submitData);
            } else {
                // Regular fetch for URL-only submission (no large file upload)
                const res = await fetch('/api/speeches', {
                    method: 'POST',
                    body: submitData,
                });

                if (res.ok) {
                    const newSpeech = await res.json();
                    setSpeeches(prev => [newSpeech, ...prev]);
                    setIsModalOpen(false);
                    setFormData({ title: '', speaker: '', datetime: '', youtubeUrl: '', description: '' });

                    Swal.fire({
                        icon: 'success',
                        title: 'Published!',
                        text: 'Your Khutba is now live.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } else {
                    const errorData = await res.json();
                    Swal.fire('Error', errorData.error || 'Failed to add Khutba', 'error');
                }
            }

        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'An unexpected error occurred', 'error');
        } finally {
            // Only turn off submitting if we waited for the result (i.e. not using XHR for file upload)
            if (!selectedFile) {
                setIsSubmitting(false);
            }
        }
    };

    if (!masjidId) return null;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
            {/* Top Header Area */}
            <div className="flex-none px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Khutba Library</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage and organize your recorded speeches</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">
                        Total Results: <span className="text-primary font-bold">{totalSpeeches}</span>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="cursor-pointer inline-flex items-center px-5 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-lg shadow-primary/30 transition-all active:scale-95"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Upload Khutba
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex-none px-8 pb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">

                    {/* Search */}
                    <div className="relative flex-1 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search topic or speaker..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    </div>

                    {/* Date Filters */}
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-40">
                            <input
                                type="date"
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm text-slate-600"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        </div>
                        <div className="relative flex-1 md:w-40">
                            <input
                                type="date"
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm text-slate-600"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-8 bg-slate-200 mx-2"></div>

                    {/* View Switcher & Reset */}
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 h-[38px] items-center">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-all h-full aspect-square flex items-center justify-center cursor-pointer ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Grid View"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <div className="w-px h-4 bg-slate-200 mx-1"></div>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-all h-full aspect-square flex items-center justify-center cursor-pointer ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                title="List View"
                            >
                                <ListIcon className="h-4 w-4" />
                            </button>
                        </div>

                        {(searchQuery || startDate || endDate) && (
                            <button
                                onClick={() => { setSearchQuery(''); setStartDate(''); setEndDate(''); }}
                                className="text-sm text-red-500 hover:text-red-700 font-medium cursor-pointer px-2"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
                {loading && page === 1 ? (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {[...Array(8)].map((_, i) => (
                            <SpeechSkeleton key={i} />
                        ))}
                    </div>
                ) : speeches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 mt-10">
                        <div className="bg-slate-100 p-6 rounded-full mb-4">
                            <Mic className="h-12 w-12 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-600">No Khutbas Found</h3>
                        <p className="max-w-xs text-center mt-2 text-sm">
                            Try adjusting your search or upload your first Khutba to get started.
                        </p>
                    </div>
                ) : (
                    <div className={`gap-6 pb-10 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}`}>
                        {speeches.map((speech) => {
                            const videoId = extractVideoId(speech.youtubeUrl);
                            const thumb = videoId
                                ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                                : '/images/khutba-placeholder.jpg';

                            if (viewMode === 'list') {
                                return (
                                    <div key={speech.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-row items-center p-3 gap-4 cursor-pointer">
                                        {/* List View Item */}
                                        <div className="relative h-16 w-28 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                            <img src={thumb} alt={speech.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                                                    <Video className="h-3 w-3 text-primary ml-0.5" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                            <h3 className="font-semibold text-slate-900 line-clamp-1 text-base col-span-1">{speech.title}</h3>

                                            <div className="flex items-center gap-2 text-sm text-slate-500 col-span-1">
                                                <User className="h-4 w-4" />
                                                <span className="truncate">{speech.speaker}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-slate-500 col-span-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>{format(new Date(speech.datetime), 'MMM d, yyyy')}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEdit(speech); }}
                                            className="cursor-pointer p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors ml-2"
                                            title="Edit"
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </button>

                                        <button
                                            onClick={(e) => handleDelete(speech.id, e)}
                                            className="cursor-pointer p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                                            title="Delete"
                                        >
                                            <Trash className="h-5 w-5" />
                                        </button>
                                    </div>
                                );
                            }

                            return (
                                <div key={speech.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
                                    {/* Grid View Item */}
                                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                                        <img src={thumb} alt={speech.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm">
                                            Video
                                        </div>
                                        <a
                                            href={speech.youtubeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                                <Video className="h-5 w-5 text-primary ml-0.5" />
                                            </div>
                                        </a>
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-semibold text-slate-900 line-clamp-1 mb-1" title={speech.title}>
                                            {speech.title}
                                        </h3>

                                        <div className="space-y-1 mt-2 flex-1">
                                            <div className="flex items-center text-xs text-slate-500 mb-2">
                                                <User className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                                                <span className="truncate">{speech.speaker}</span>
                                            </div>
                                            {speech.description && (
                                                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                                                    {speech.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                                            <div className="flex items-center text-xs text-slate-400">
                                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                                <span>{format(new Date(speech.datetime), 'MMM d, yyyy')}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(speech); }}
                                                    className="cursor-pointer p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(speech.id, e)}
                                                    className="cursor-pointer p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Infinite Scroll Skeleton Loader */}
                        {hasMore && (
                            <div ref={ref} className="col-span-full py-4">
                                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                    {[...Array(4)].map((_, i) => (
                                        <SpeechSkeleton key={`loader-${i}`} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* New Modal Implementation */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">{editingSpeech ? 'Edit Khutba' : 'New Khutba Upload'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="speechForm" onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Title (Topic)</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary py-2.5 px-3"
                                        placeholder="e.g. The Importance of Patience"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Speaker</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary py-2.5 px-3"
                                            placeholder="Imam Name"
                                            value={formData.speaker}
                                            onChange={e => setFormData({ ...formData, speaker: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary py-2.5 px-3"
                                            value={formData.datetime}
                                            onChange={e => setFormData({ ...formData, datetime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Media Source - Hidden when editing */}
                                {!editingSpeech && (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <p className="text-sm font-semibold text-slate-700 mb-3">Media Source</p>

                                        <div className="space-y-4">
                                            <div className={`p-3 rounded-lg border transition-all ${selectedFile ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50'}`}>
                                                <label className="flex items-center cursor-pointer w-full">
                                                    <input
                                                        type="file"
                                                        accept="audio/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                setSelectedFile(e.target.files[0]);
                                                                setFormData({ ...formData, youtubeUrl: '' });
                                                            }
                                                        }}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-slate-900">Upload Audio File</div>
                                                        <div className="text-xs text-slate-500">{selectedFile ? selectedFile.name : 'MP3, WAV, M4A supported'}</div>
                                                    </div>
                                                    <div className="bg-white border border-slate-200 px-3 py-1.5 rounded text-xs font-medium text-slate-600 shadow-sm">
                                                        {selectedFile ? 'Change' : 'Browse'}
                                                    </div>
                                                </label>
                                            </div>

                                            <div className="relative flex items-center">
                                                <div className="flex-grow border-t border-slate-200"></div>
                                                <span className="flex-shrink-0 mx-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider">OR</span>
                                                <div className="flex-grow border-t border-slate-200"></div>
                                            </div>

                                            <div>
                                                <input
                                                    type="url"
                                                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary py-2.5 px-3 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                                                    placeholder="Paste YouTube Link (if already uploaded)"
                                                    value={formData.youtubeUrl}
                                                    onChange={e => {
                                                        setFormData({ ...formData, youtubeUrl: e.target.value });
                                                        setSelectedFile(null);
                                                    }}
                                                    disabled={!!selectedFile}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Description</label>
                                    <textarea
                                        rows={3}
                                        className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 flex-row-reverse">
                            <button
                                type="submit"
                                form="speechForm"
                                disabled={isSubmitting}
                                className="cursor-pointer inline-flex justify-center rounded-lg border border-transparent px-5 py-2.5 bg-primary text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Processing...' : (editingSpeech ? 'Update Speech' : 'Upload & Publish')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="cursor-pointer inline-flex justify-center rounded-lg border border-slate-300 px-5 py-2.5 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div >
            )
            }
        </div >
    );
}
