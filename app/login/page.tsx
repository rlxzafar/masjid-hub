"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            console.log('Login response data:', data);

            if (res.ok) {
                // Store user info in localStorage for simple client-side state
                console.log('Setting localStorage user:', data.user);
                localStorage.setItem('user', JSON.stringify(data.user));

                if (data.user.username === 'admin') {
                    console.log('Redirecting to dashboard (admin)');
                    router.push('/dashboard');
                } else {
                    console.log('Redirecting to dashboard (donor)');
                    router.push('/dashboard');
                }
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Home
                    </Link>
                </div>
                <h1 className="text-3xl font-bold text-emerald-800 mb-6 text-center">Login</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors mt-4"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Demo Credentials</h3>
                    <div className="space-y-3 text-sm">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="font-semibold text-gray-700">Admin Account</p>
                            <p className="text-gray-600">Username: <span className="font-mono text-emerald-600">admin</span></p>
                            <p className="text-gray-600">Password: <span className="font-mono text-emerald-600">adminpassword</span></p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="font-semibold text-gray-700">Donor Account</p>
                            <p className="text-gray-500 italic">Please register a new donor to test donor functionality.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
