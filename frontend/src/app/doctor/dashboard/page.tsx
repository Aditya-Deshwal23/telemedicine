'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Video, DollarSign, Clock, Star } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { patientAPI } from '@/lib/api'; // Assuming you have api calls for the doctor dashboard

export default function DoctorDashboard() {
    const { user, loadUser, isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) router.push('/auth/login');
        else if (user && user.role !== 'DOCTOR') router.push('/');
        else loadUser();
    }, [isAuthenticated, user]);

    if (!user) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <nav className="bg-white border-b sticky top-0 z-10 px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Star className="text-teal-600 w-6 h-6" />
                    <span className="font-bold text-xl text-teal-800">MediConnect Doctor</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-right hidden sm:block">
                        <p className="font-semibold text-gray-900">Dr. {user.name}</p>
                        <p className="text-gray-500 text-xs text-green-600 font-medium">• Online</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold border border-teal-200">
                        {getInitials(user.name)}
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Dr. {user.name.split(' ')[0]}</h1>
                        <p className="text-gray-600">Here's your schedule for today.</p>
                    </div>
                    <Button variant="outline" className="border-teal-200 text-teal-700 bg-teal-50" asChild><Link href="/doctor/schedule">Manage Schedule</Link></Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Today's Appts", value: '4', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Total Patients', value: '142', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Consult Hours', value: '3.5', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
                        { label: "Today's Earnings", value: '₹2,000', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
                    ].map((stat, i) => (
                        <Card key={i}>
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}><stat.icon className="w-6 h-6" /></div>
                                <div>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                                <CardTitle className="text-lg">Appointments Queue</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {/* Mock Queue Items */}
                                <div className="divide-y">
                                    {[
                                        { id: '1', time: '10:00 AM', name: 'Alok Kumar', type: 'First Visit', status: 'WAITING' },
                                        { id: '2', time: '10:30 AM', name: 'Sneha Gupta', type: 'Follow up', status: 'UPCOMING' },
                                    ].map((apt) => (
                                        <div key={apt.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-16 text-center text-sm font-bold text-gray-900 bg-gray-100 py-2 rounded-md">{apt.time}</div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{apt.name}</div>
                                                    <div className="text-sm text-gray-500">{apt.type}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${apt.status === 'WAITING' ? 'bg-orange-100 text-orange-700 animate-pulse' : 'bg-gray-100 text-gray-600'}`}>{apt.status}</span>
                                                {apt.status === 'WAITING' && (
                                                    <Link href={`/consultation/${apt.id}`}>
                                                        <Button size="sm" className="gradient-primary text-white"><Video className="w-4 h-4 mr-2" /> Start Call</Button>
                                                    </Link>
                                                )}
                                                {apt.status === 'UPCOMING' && <Button size="sm" variant="outline" disabled>Starts soon</Button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">AI Tools</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                    <h4 className="font-bold text-purple-900 mb-1">AI Prescription Assistant</h4>
                                    <p className="text-xs text-purple-700 mb-3">Dictate notes and AI formats it into a structured Rx.</p>
                                    <Button variant="outline" size="sm" className="w-full text-purple-700 border-purple-300 hover:bg-purple-100 bg-white">Open Assistant</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
