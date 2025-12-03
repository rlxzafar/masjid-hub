import React from 'react';

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-emerald-800 mb-8 text-center">About MasjidHub</h1>

                <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        MasjidHub is a community-driven platform designed to connect Muslims with their local Masjids.
                        Our mission is to leverage technology to strengthen community bonds, facilitate communication,
                        and make it easier for everyone to stay informed about prayer times, events, and important announcements.
                    </p>

                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        We believe that the Masjid is the heart of the community. By providing a centralized platform
                        for Masjids to share information, we hope to encourage greater participation and engagement
                        in community activities.
                    </p>

                    <h2 className="text-2xl font-semibold text-emerald-700 mb-4">Our Vision</h2>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        To create a connected, informed, and spiritually uplifted community where every individual
                        has easy access to the resources and support they need.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-emerald-50 p-6 rounded-xl text-center">
                        <h3 className="text-xl font-bold text-emerald-800 mb-2">Community First</h3>
                        <p className="text-gray-600">Built to serve the needs of the local Muslim community.</p>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-xl text-center">
                        <h3 className="text-xl font-bold text-emerald-800 mb-2">Transparency</h3>
                        <p className="text-gray-600">Open and clear communication channels for everyone.</p>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-xl text-center">
                        <h3 className="text-xl font-bold text-emerald-800 mb-2">Support</h3>
                        <p className="text-gray-600">Helping those in need through our dedicated donor program.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
