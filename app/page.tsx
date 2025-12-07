"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import PrayerCard from '@/components/PrayerCard';
import SpeechCard from '@/components/SpeechCard';
import MasjidSkeleton from '@/components/MasjidSkeleton';
import prayersData from '@/data/prayers.json';
import speechesData from '@/data/speeches.json';
import { Masjid, PrayerTimes, Speech } from '@/types';

// Cast data to types
const prayers = prayersData as PrayerTimes[];
const speeches = speechesData as Speech[];

export default function Home() {
  // Get featured speeches (let's say first 3 are featured for the slider)
  const featuredSpeeches = speeches.slice(0, 3);
  const recentSpeeches = speeches.slice(3);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [masjids, setMasjids] = useState<Masjid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);

    // Fetch masjids
    const fetchMasjids = async () => {
      try {
        const res = await fetch('/api/masjids');
        if (res.ok) {
          const data = await res.json();
          setMasjids(data);
        }
      } catch (error) {
        console.error('Error fetching masjids:', error);
      } finally {
        // Add a small delay to show off the skeleton (optional, but good for UX feel if API is too fast locally)
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchMasjids();

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredSpeeches.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredSpeeches.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredSpeeches.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredSpeeches.length) % featuredSpeeches.length);
  };

  const currentFeaturedSpeech = featuredSpeeches[currentSlide];
  const currentFeaturedMasjid = masjids.find(m => m.id === currentFeaturedSpeech.masjidId);

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section with Slider */}
      <section className="bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center transition-all duration-500 ease-in-out">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
                Featured Speech
              </div>
              <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Connect with your</span>{' '}
                <span className="block text-primary xl:inline">Spiritual Community</span>
              </h1>
              <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Stay updated with prayer times, listen to inspiring speeches, and join community events at your local Masjids.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                {isLoggedIn ? (
                  <Link href="/dashboard/donor" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10">
                    Go to Dashboard
                  </Link>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    <Link href="/login" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10">
                      Login
                    </Link>
                    <Link href="/become-donor" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 md:py-4 md:text-lg md:px-10">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative w-full h-[450px] flex items-center justify-center perspective-1000">
                {featuredSpeeches.map((speech, index) => {
                  const masjid = masjids.find(m => m.id === speech.masjidId);

                  // Calculate position relative to current slide
                  let position = (index - currentSlide + featuredSpeeches.length) % featuredSpeeches.length;

                  // We want to show:
                  // 0: Center (Active)
                  // 1: Right 1
                  // 2: Right 2
                  // ...
                  // Last: Left 1 (Previous)

                  // Adjust position for the "previous" card visual
                  const isLast = position === featuredSpeeches.length - 1;
                  const effectivePosition = isLast ? -1 : position;

                  // Only render cards that are relevant to the stack (Active, Next, Next+1, Prev)
                  // You might want to render all but hide others, or just render a subset. 
                  // For simplicity with small lists, rendering all with opacity 0 for hidden ones is fine.

                  let style = {};
                  let zIndex = 0;
                  let opacity = 0;
                  let pointerEvents = 'none';

                  if (effectivePosition === 0) {
                    // Active Card
                    style = { transform: 'translateX(0) scale(1)', zIndex: 20 };
                    opacity = 1;
                    pointerEvents = 'auto';
                  } else if (effectivePosition === 1) {
                    // Next Card
                    style = { transform: 'translateX(40px) scale(0.9)', zIndex: 10 };
                    opacity = 0.7;
                  } else if (effectivePosition === 2) {
                    // Next + 1
                    style = { transform: 'translateX(80px) scale(0.8)', zIndex: 5 };
                    opacity = 0.4;
                  } else if (effectivePosition === -1) {
                    // Previous Card (Visual cue on the left)
                    style = { transform: 'translateX(-40px) scale(0.9)', zIndex: 10 };
                    opacity = 0; // Hiding previous card for a cleaner "stack" look, or set to 0.7 if you want it visible
                  } else {
                    // Others hidden behind
                    style = { transform: 'translateX(80px) scale(0.8)', zIndex: 0 };
                    opacity = 0;
                  }

                  return (
                    <div
                      key={speech.id}
                      className="absolute top-0 left-0 w-full h-full transition-all duration-500 ease-in-out flex items-center justify-center"
                      style={{
                        ...style,
                        opacity,
                        pointerEvents: pointerEvents as any,
                      }}
                    >
                      <div className="w-full max-w-lg">
                        <SpeechCard speech={speech} masjid={masjid} featured className="w-full shadow-xl" />
                      </div>
                    </div>
                  );
                })}

                {/* Slider Controls */}
                <div className="absolute top-1/2 -left-4 -translate-y-1/2 z-30 hidden md:block">
                  <button onClick={prevSlide} className="cursor-pointer p-2 rounded-full bg-white shadow-lg text-slate-600 hover:text-primary hover:scale-110 transition-all">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                </div>
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 z-30 hidden md:block">
                  <button onClick={nextSlide} className="cursor-pointer p-2 rounded-full bg-white shadow-lg text-slate-600 hover:text-primary hover:scale-110 transition-all">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Dots */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
                  {featuredSpeeches.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`cursor-pointer w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-primary w-4' : 'bg-slate-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prayer Times Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Prayer Times</h2>
            <p className="mt-1 text-slate-500">Accurate timings for Masjids near you</p>
          </div>
          <Link href="/masjids" className="hidden sm:flex items-center text-primary font-medium hover:text-primary/80">
            View all Masjids <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-12">
          {loading ? (
            // Show 6 skeletons while loading
            Array.from({ length: 6 }).map((_, i) => (
              <MasjidSkeleton key={i} />
            ))
          ) : (
            masjids.map(masjid => {
              const masjidPrayers = prayers.find(p => p.masjidId === masjid.id);
              // Even if no prayers found, we might want to show the masjid card, 
              // but PrayerCard expects prayers. For now, let's skip if no prayers 
              // or handle it inside PrayerCard. The original code skipped.
              if (!masjidPrayers) return null;
              return (
                <PrayerCard key={masjid.id} masjid={masjid} prayers={masjidPrayers} />
              );
            })
          )}
        </div>

        <div className="mt-6 sm:hidden">
          <Link href="/masjids" className="flex items-center justify-center text-primary font-medium hover:text-primary/80">
            View all Masjids <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Recent Updates Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Recent Updates</h2>
            <p className="mt-1 text-slate-500">Latest speeches and upcoming events</p>
          </div>
          <Link href="/events" className="hidden sm:flex items-center text-primary font-medium hover:text-primary/80">
            View all Content <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentSpeeches.map(speech => {
            const masjid = masjids.find(m => m.id === speech.masjidId);
            return (
              <SpeechCard key={speech.id} speech={speech} masjid={masjid} />
            );
          })}
        </div>
      </section>
    </div>
  );
}
