import Image from 'next/image';
import { Mail, Phone } from 'lucide-react';
import volunteersData from '@/data/volunteers.json';
import { Volunteer } from '@/types';

const volunteers = volunteersData as Volunteer[];

export default function VolunteersPage() {
    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                        Our Dedicated Volunteers
                    </h1>
                    <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
                        Meet the amazing individuals who dedicate their time and effort to serve our community.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {volunteers.map((volunteer) => (
                        <div key={volunteer.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
                            <div className="relative h-64 w-full">
                                <Image
                                    src={volunteer.image}
                                    alt={volunteer.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="px-6 py-5">
                                <h3 className="text-xl font-semibold text-slate-900">{volunteer.name}</h3>
                                <p className="text-sm font-medium text-primary mb-4">{volunteer.role}</p>

                                <div className="space-y-2">
                                    <div className="flex items-center text-slate-500 text-sm">
                                        <Mail className="w-4 h-4 mr-2" />
                                        <a href={`mailto:${volunteer.email}`} className="hover:text-primary transition-colors">
                                            {volunteer.email}
                                        </a>
                                    </div>
                                    <div className="flex items-center text-slate-500 text-sm">
                                        <Phone className="w-4 h-4 mr-2" />
                                        <a href={`tel:${volunteer.phone}`} className="hover:text-primary transition-colors">
                                            {volunteer.phone}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
