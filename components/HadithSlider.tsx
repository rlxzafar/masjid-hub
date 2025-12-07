"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Share2, Copy, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';

const backgrounds = [
    "bg-gradient-to-r from-emerald-500 to-teal-600",
    "bg-gradient-to-r from-blue-500 to-cyan-600",
    "bg-gradient-to-r from-indigo-500 to-purple-600",
    "bg-gradient-to-r from-slate-600 to-slate-800",
    "bg-gradient-to-r from-rose-500 to-pink-600",
];

interface Hadith {
    id: string;
    arabic: string;
    english: string;
    source: string;
    topic: string;
}

export default function HadithSlider() {
    const [hadiths, setHadiths] = useState<Hadith[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSharing, setIsSharing] = useState(false);
    const [loading, setLoading] = useState(true);
    const activeCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchHadiths = async () => {
            try {
                const res = await fetch('/api/hadiths');
                if (res.ok) {
                    const data = await res.json();
                    setHadiths(data);
                }
            } catch (error) {
                console.error('Error fetching hadiths:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHadiths();
    }, []);

    useEffect(() => {
        if (hadiths.length === 0) return;
        const interval = setInterval(() => {
            handleNext();
        }, 8000);
        return () => clearInterval(interval);
    }, [hadiths]);

    const handleNext = () => {
        setCurrentIndex(prev => (prev + 1) % hadiths.length);
    };

    const handlePrev = () => {
        setCurrentIndex(prev => (prev - 1 + hadiths.length) % hadiths.length);
    };

    const handleShare = async (hadith: Hadith) => {
        const shareText = `"${hadith.english}" - ${hadith.source}\n\nRead more at M-Times`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Hadith of the Day',
                    text: shareText,
                    url: window.location.href,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(shareText);
            alert('Hadith copied to clipboard!');
        }
    };

    const handleCopy = (hadith: Hadith) => {
        const shareText = `"${hadith.english}" - ${hadith.source}\n\nRead more at M-Times`;
        navigator.clipboard.writeText(shareText);
        alert('Hadith copied to clipboard!');
    };

    const handleDownloadImage = async () => {
        if (!activeCardRef.current) return;
        setIsSharing(true);

        // Wait for state update to reflect in DOM
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const dataUrl = await toPng(activeCardRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: 'transparent',
                filter: (node) => {
                    // Exclude elements with data-html2canvas-ignore attribute
                    if (node instanceof HTMLElement && node.hasAttribute('data-html2canvas-ignore')) {
                        return false;
                    }
                    return true;
                }
            });

            const link = document.createElement('a');
            link.download = `hadith-${currentIndex}.png`;
            link.href = dataUrl;
            link.click();

            if (navigator.canShare && navigator.canShare({ files: [new File([new Blob()], 'test.png', { type: 'image/png' })] })) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'hadith.png', { type: 'image/png' });
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Hadith of the Day',
                        text: `"${hadiths[currentIndex].english}" - ${hadiths[currentIndex].source}`,
                    });
                } catch (e) {
                    // Fallback to download (already done)
                }
            }

        } catch (err) {
            console.error('Error generating image:', err);
            alert('Failed to generate image. Please try again.');
        } finally {
            setIsSharing(false);
        }
    };

    const getCardStyle = (index: number) => {
        // Simple slide/fade effect
        if (index === currentIndex) {
            return {
                transform: 'translateX(0)',
                zIndex: 20,
                opacity: 1,
            };
        }

        return {
            transform: 'translateX(100%)',
            zIndex: 0,
            opacity: 0,
        };
    };

    if (loading) {
        return (
            <div className="w-full h-[400px] md:h-[500px] flex items-center justify-center mb-8 p-8">
                <div className="w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-3xl bg-gray-200 animate-pulse"></div>
            </div>
        );
    }

    if (hadiths.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center mb-8 p-8">
            {/* Navigation Buttons Container (Matches Card Size) */}
            <div className="absolute w-[280px] h-[280px] md:w-[380px] md:h-[380px] pointer-events-none z-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <button
                    onClick={handlePrev}
                    className="absolute -left-5 bottom-8 p-3 bg-white hover:bg-gray-50 text-emerald-800 shadow-lg transition-all hover:scale-110 rounded-full border-2 border-white pointer-events-auto"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={handleNext}
                    className="absolute -right-5 bottom-8 p-3 bg-white hover:bg-gray-50 text-emerald-800 shadow-lg transition-all hover:scale-110 rounded-full border-2 border-white pointer-events-auto"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Card Container */}
            <div className="relative w-full max-w-2xl h-full flex items-center justify-center">
                {hadiths.map((hadith, index) => {
                    const style = getCardStyle(index);
                    const isCurrent = index === currentIndex;
                    const bg = backgrounds[index % backgrounds.length];

                    return (
                        <div
                            key={hadith.id}
                            ref={isCurrent ? activeCardRef : null}
                            className={`absolute w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-3xl p-6 text-center text-white flex flex-col items-center justify-center ${bg} shadow-xl transition-all duration-500 ease-in-out`}
                            style={style}
                        >
                            <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>

                            <div className="relative z-10 w-full">
                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                                    {hadith.topic}
                                </span>
                                <h2 className="text-xl md:text-2xl font-bold mb-2 font-arabic leading-relaxed" dir="rtl">
                                    {hadith.arabic}
                                </h2>
                                <p className="text-sm md:text-base font-medium opacity-95 max-w-xl mx-auto leading-relaxed line-clamp-2 md:line-clamp-3">
                                    "{hadith.english}"
                                </p>
                                <p className="text-xs mt-2 opacity-80 font-semibold tracking-wide">
                                    — {hadith.source}
                                </p>
                            </div>

                            {/* Branding for Image Capture */}
                            <div className={`absolute bottom-3 right-5 text-[10px] text-white/60 font-light ${isSharing && isCurrent ? 'block' : 'hidden'}`}>
                                m-times.com
                            </div>

                            {/* Actions (Only visible on active card) */}
                            {isCurrent && (
                                <div className="flex justify-center gap-3 mt-3" data-html2canvas-ignore>
                                    <button
                                        onClick={() => handleShare(hadith)}
                                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all hover:scale-110"
                                        title="Share Text"
                                    >
                                        <Share2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleCopy(hadith)}
                                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all hover:scale-110"
                                        title="Copy Text"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={handleDownloadImage}
                                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all hover:scale-110"
                                        title="Share as Image"
                                    >
                                        {isSharing ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <ImageIcon className="w-3.5 h-3.5" />}
                                    </button>
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(`"${hadith.english}" - ${hadith.source}\n\nRead more at M-Times`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all hover:scale-110"
                                        title="Share on WhatsApp"
                                    >
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                    </a>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
