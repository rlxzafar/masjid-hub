"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BecomeDonorPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        username: '',
        password: '',
        address: '',
        location: null as { lat: number; lng: number } | null,
    });
    const [fieldErrors, setFieldErrors] = useState({
        name: '',
        email: '',
        mobile: '',
        username: '',
        password: '',
        address: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loadingLocation, setLoadingLocation] = useState(false);

    const validateField = (name: string, value: string) => {
        let errorMessage = '';
        switch (name) {
            case 'mobile':
                const mobileRegex = /^[6-9]\d{9}$/;
                if (value && !mobileRegex.test(value)) {
                    errorMessage = 'Invalid mobile number. Must be 10 digits starting with 6-9.';
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                    errorMessage = 'Invalid email address.';
                }
                break;
            case 'password':
                if (value && value.length < 6) {
                    errorMessage = 'Password must be at least 6 characters.';
                }
                break;
            case 'name':
            case 'username':
            case 'address':
                if (!value.trim()) {
                    errorMessage = `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
                }
                break;
            default:
                break;
        }
        setFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'mobile') {
            const val = value.replace(/\D/g, '');
            if (val.length <= 10) {
                setFormData(prev => ({ ...prev, [name]: val }));
                validateField(name, val);
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
            validateField(name, value);
        }
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setFormData(prev => ({
                    ...prev,
                    location: { lat: latitude, lng: longitude }
                }));

                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.display_name) {
                            setFormData(prev => ({ ...prev, address: data.display_name }));
                            validateField('address', data.display_name);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching address:', err);
                    // Don't set error here, just let user manually enter address if auto-fill fails
                } finally {
                    setLoadingLocation(false);
                }
            },
            (err) => {
                console.error('Geolocation error:', err);
                setError('Unable to retrieve your location. Please enter address manually.');
                setLoadingLocation(false);
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Final validation check
        const hasErrors = Object.values(fieldErrors).some(err => err !== '') ||
            Object.values(formData).some((val) => val === '' && typeof val === 'string'); // Check only string fields for empty

        if (hasErrors) {
            setError('Please fix the errors before submitting.');
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/login'), 2000);
            } else {
                const data = await res.json();
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-emerald-800 mb-6 text-center">Become a Donor</h1>

                {success ? (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-center">
                        Registration successful! Redirecting to login...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${fieldErrors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-emerald-500'}`}
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={(e) => validateField('name', e.target.value)}
                            />
                            {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${fieldErrors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-emerald-500'}`}
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={(e) => validateField('email', e.target.value)}
                            />
                            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                            <input
                                type="tel"
                                name="mobile"
                                required
                                maxLength={10}
                                placeholder="Enter 10 digit mobile number"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${fieldErrors.mobile ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-emerald-500'}`}
                                value={formData.mobile}
                                onChange={handleChange}
                                onBlur={(e) => validateField('mobile', e.target.value)}
                            />
                            {fieldErrors.mobile && <p className="text-red-500 text-xs mt-1">{fieldErrors.mobile}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <div className="flex gap-2">
                                <textarea
                                    name="address"
                                    required
                                    rows={2}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${fieldErrors.address ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-emerald-500'}`}
                                    value={formData.address}
                                    onChange={handleChange}
                                    onBlur={(e) => validateField('address', e.target.value)}
                                    placeholder="Enter your address or use location button"
                                />
                                <button
                                    type="button"
                                    onClick={getLocation}
                                    disabled={loadingLocation}
                                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                                    title="Get Current Location"
                                >
                                    {loadingLocation ? (
                                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    )}
                                </button>
                            </div>
                            {fieldErrors.address && <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                name="username"
                                required
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${fieldErrors.username ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-emerald-500'}`}
                                value={formData.username}
                                onChange={handleChange}
                                onBlur={(e) => validateField('username', e.target.value)}
                            />
                            {fieldErrors.username && <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${fieldErrors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-emerald-500'}`}
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={(e) => validateField('password', e.target.value)}
                            />
                            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={Object.values(fieldErrors).some(err => err !== '')}
                            className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors mt-4 ${Object.values(fieldErrors).some(err => err !== '') ? 'bg-gray-400 cursor-not-allowed text-gray-200' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                        >
                            Register
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
