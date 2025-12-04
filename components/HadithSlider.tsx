"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Share2, Copy, ChevronLeft, ChevronRight, Download, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';

const hadiths = [
    {
        arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
        english: "Charity does not decrease wealth.",
        source: "Sahih Muslim",
        topic: "Charity"
    },
    {
        arabic: "اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ",
        english: "Save yourself from Hell-fire even by giving half a date-fruit in charity.",
        source: "Sahih Al-Bukhari",
        topic: "Charity"
    },
    {
        arabic: "الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا",
        english: "A believer to another believer is like a building whose different parts enforce each other.",
        source: "Sahih Al-Bukhari",
        topic: "Unity"
    },
    {
        arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
        english: "Whoever believes in Allah and the Last Day should talk what is good or keep quiet.",
        source: "Sahih Al-Bukhari",
        topic: "Iman"
    },
    {
        arabic: "الدُّعَاءُ هُوَ الْعِبَادَةُ",
        english: "Supplication is worship.",
        source: "Sunan Abi Dawud",
        topic: "Tauheed"
    }
];

const backgrounds = [
    "bg-gradient-to-r from-emerald-500 to-teal-600",
    "bg-gradient-to-r from-blue-500 to-cyan-600",
    "bg-gradient-to-r from-indigo-500 to-purple-600",
    "bg-gradient-to-r from-slate-600 to-slate-800",
];

export default function HadithSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [bgIndex, setBgIndex] = useState(0);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        // Randomize on mount
        setCurrentIndex(Math.floor(Math.random() * hadiths.length));
        setBgIndex(Math.floor(Math.random() * backgrounds.length));

        // Auto slide every 10 seconds
        const interval = setInterval(() => {
            handleNext();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleNext = () => {
        setCurrentIndex(prev => (prev + 1) % hadiths.length);
        setBgIndex(prev => (prev + 1) % backgrounds.length);
    };

    const handlePrev = () => {
        setCurrentIndex(prev => (prev - 1 + hadiths.length) % hadiths.length);
        setBgIndex(prev => (prev - 1 + backgrounds.length) % backgrounds.length);
    };

    const currentHadith = hadiths[currentIndex];
    const currentBg = backgrounds[bgIndex];

    const shareText = `"${currentHadith.english}" - ${currentHadith.source}\n\nRead more at M-Times`;

    const handleShare = async () => {
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
            handleCopy();
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shareText);
        alert('Hadith copied to clipboard!');
    };

    const handleDownloadImage = async () => {
        if (!sliderRef.current) return;
        setIsSharing(true);

        try {
            const canvas = await html2canvas(sliderRef.current, {
                scale: 2, // Higher quality
                useCORS: true,
                backgroundColor: null, // Transparent background if needed, but we have gradients
            });

            const image = canvas.toDataURL("image/png");

            // Create a link to download
            const link = document.createElement('a');
            link.href = image;
            link.download = `hadith-${currentIndex}.png`;
            link.click();

            // Optional: If you want to try sharing the image directly via Web Share API (Level 2)
            // This is supported in some modern mobile browsers
            if (navigator.canShare && navigator.canShare({ files: [new File([await (await fetch(image)).blob()], 'hadith.png', { type: 'image/png' })] })) {
                const blob = await (await fetch(image)).blob();
                const file = new File([blob], 'hadith.png', { type: 'image/png' });
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Hadith of the Day',
                        text: shareText,
                    });
                } catch (e) {
                    console.log("Share failed, fallback to download", e);
                }
            }

        } catch (err) {
            console.error('Error generating image:', err);
            alert('Failed to generate image.');
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div ref={sliderRef} className={`relative w-full rounded-2xl overflow-hidden shadow-lg mb-8 transition-colors duration-1000 ${currentBg} group`}>
            <div className="absolute inset-0 bg-black/10"></div>

            {/* Navigation Buttons */}
            <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-20 cursor-pointer"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-20 cursor-pointer"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            <div className="relative z-10 p-8 md:p-12 text-center text-white flex flex-col items-center justify-center min-h-[300px]">
                <div className="mb-6 w-full">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        {currentHadith.topic}
                    </span>
                    <h2 className="text-2xl md:text-4xl font-bold mb-4 font-arabic leading-relaxed" dir="rtl">
                        {currentHadith.arabic}
                    </h2>
                    <p className="text-lg md:text-xl font-medium opacity-90 max-w-2xl mx-auto">
                        "{currentHadith.english}"
                    </p>
                    <p className="text-sm mt-3 opacity-75 font-semibold">
                        — {currentHadith.source}
                    </p>
                </div>

                {/* Controls - Hide during image capture if desired, or keep them. 
                    The user asked to "share them as image with caption my website url". 
                    Usually we want the image to be clean, but maybe with a footer. 
                    Let's add a footer for the image capture only.
                */}
                <div className="absolute bottom-4 left-0 right-0 text-center text-xs opacity-50 hidden print:block image-only">
                    m-times.com
                </div>

                <div className="flex justify-center gap-4 mt-4" data-html2canvas-ignore>
                    <button
                        onClick={handleShare}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
                        title="Share Text"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
                        title="Copy Text"
                    >
                        <Copy className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleDownloadImage}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
                        title="Share as Image"
                    >
                        {isSharing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <ImageIcon className="w-5 h-5" />}
                    </button>
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
                        title="Share on WhatsApp"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                    </a>
                </div>

                {/* Branding for Image Capture */}
                <div className="absolute bottom-2 right-4 text-[10px] text-white/50 font-light hidden group-[.capturing]:block">
                    m-times.com
                </div>
            </div>
        </div>
    );
}
