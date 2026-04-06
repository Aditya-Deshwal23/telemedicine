'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { patientAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video, FileText, Activity, Brain } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export default function PatientDashboard() {
    const { user, loadUser, isAuthenticated } = useAuthStore();
    const [profile, setProfile] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) router.push('/auth/login');
        else {
            loadUser();
            patientAPI.getProfile().then(({ data }) => setProfile(data)).catch(console.error);
        }
    }, [isAuthenticated]);

    if (!user) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

    const upcomingAppts = [
        { id: '1', date: 'Oct 24, 2023', time: '10:00 AM', doctor: 'Dr. Sarah Smith', spec: 'Cardiologist', status: 'CONFIRMED' }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            <nav className="bg-white border-b sticky top-0 z-10 px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Activity className="text-teal-600 w-6 h-6" />
                    <span className="font-bold text-xl text-teal-800">MediConnect</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-right hidden sm:block">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-gray-500 text-xs">Patient Profile</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold border border-teal-200">
                        {getInitials(user.name)}
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
                    <p className="text-gray-600">Managing your health has never been easier.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link href="/patient/symptom-checker" className="col-span-1">
                        <Card className="hover:border-purple-300 hover:shadow-md transition-all cursor-pointer h-full bg-gradient-to-br from-purple-50 to-white">
                            <CardContent className="p-6">
                                <Brain className="w-8 h-8 text-purple-600 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-1">AI Symptom Checker</h3>
                                <p className="text-sm text-gray-600 mb-4">Not feeling well? Let our AI guide you to the right specialist.</p>
                                <span className="text-purple-600 text-sm font-semibold flex items-center">Check now &rarr;</span>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/doctors" className="col-span-1">
                        <Card className="hover:border-teal-300 hover:shadow-md transition-all cursor-pointer h-full bg-gradient-to-br from-teal-50 to-white">
                            <CardContent className="p-6">
                                <Video className="w-8 h-8 text-teal-600 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Book Consultation</h3>
                                <p className="text-sm text-gray-600 mb-4">Find top doctors and book a video consultation instantly.</p>
                                <span className="text-teal-600 text-sm font-semibold flex items-center">Find a doctor &rarr;</span>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/patient/reports" className="col-span-1">
                        <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full bg-gradient-to-br from-blue-50 to-white">
                            <CardContent className="p-6">
                                <FileText className="w-8 h-8 text-blue-600 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Health Reports</h3>
                                <p className="text-sm text-gray-600 mb-4">Upload blood reports and get them analyzed by our AI.</p>
                                <span className="text-blue-600 text-sm font-semibold flex items-center">View reports &rarr;</span>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-teal-600" /> Upcoming Appointments</CardTitle>
                                <Button variant="ghost" size="sm" asChild><Link href="/patient/appointments">View All</Link></Button>
                            </CardHeader>
                            <CardContent>
                                {upcomingAppts.length > 0 ? (
                                    upcomingAppts.map(apt => (
                                        <div key={apt.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex gap-4">
                                                <div className="bg-teal-50 text-teal-700 p-3 rounded-lg text-center min-w-[70px]">
                                                    <div className="text-xs font-semibold uppercase">{apt.date.split(' ')[0]}</div>
                                                    <div className="text-xl font-bold">{apt.date.split(' ')[1].replace(',', '')}</div>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{apt.doctor}</h4>
                                                    <p className="text-sm text-gray-500">{apt.spec}</p>
                                                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1"><Clock className="w-3 h-3" /> {apt.time}</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded font-medium">{apt.status}</span>
                                                <Link href={`/consultation/${apt.id}`}>
                                                    <Button size="sm" className="gradient-primary text-white"><Video className="w-4 h-4 mr-2" /> Join Call</Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-gray-500">No appointments scheduled.</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-teal-600" /> Health Vitals</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <span className="text-gray-600 text-sm">Blood Group</span>
                                    <span className="font-bold text-gray-900">{profile?.bloodGroup || 'Not added'}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <span className="text-gray-600 text-sm">Allergies</span>
                                    <span className="font-bold text-red-600">{profile?.allergies || 'None'}</span>
                                </div>
                                <Button variant="outline" className="w-full text-sm" asChild><Link href="/patient/profile">Update Profile</Link></Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
