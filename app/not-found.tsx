import Link from 'next/link';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="text-center animate-fade-in">
                <div className="flex justify-center mb-6">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <AlertCircle className="w-12 h-12 text-primary" />
                    </div>
                </div>
                <h1 className="text-4xl font-extrabold text-primary tracking-tight sm:text-5xl mb-2">
                    404
                </h1>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    Page Not Found
                </h2>
                <p className="text-base text-slate-600 max-w-md mx-auto mb-8">
                    Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
                </p>
                <div className="flex justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-all hover:scale-105 shadow-md"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
