'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Activity, Stethoscope } from 'lucide-react';
import { adminAPI } from '@/lib/api';

export default function AdminDashboard() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [analytics, setAnalytics] = useState<any>(null);

    useEffect(() => {
        if (!isAuthenticated) router.push('/auth/login');
        else if (user?.role !== 'ADMIN') router.push('/');
        else {
            adminAPI.getAnalytics().then(({ data }) => setAnalytics(data)).catch(console.error);
        }
    }, [isAuthenticated, user]);

    if (!user || user.role !== 'ADMIN') return null;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-gray-300 min-h-screen sticky top-0 hidden md:block">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <Shield className="text-teal-500 w-8 h-8" />
                        <span className="font-bold text-white text-xl">Admin Panel</span>
                    </div>
                    <nav className="space-y-2">
                        <a href="#" className="flex items-center gap-3 bg-gray-800 text-white px-4 py-3 rounded-lg"><Activity className="w-5 h-5" /> Dashboard</a>
                        <a href="#" className="flex items-center gap-3 hover:bg-gray-800 hover:text-white px-4 py-3 rounded-lg"><Users className="w-5 h-5" /> Users</a>
                        <a href="#" className="flex items-center gap-3 hover:bg-gray-800 hover:text-white px-4 py-3 rounded-lg"><Stethoscope className="w-5 h-5" /> Doctor Approval</a>
                    </nav>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Platform Analytics</h1>

                {analytics ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            {[
                                { title: 'Total Users', value: analytics.totalUsers, icon: Users, color: 'text-blue-600' },
                                { title: 'Verified Doctors', value: analytics.totalDoctors, icon: Stethoscope, color: 'text-teal-600' },
                                { title: 'Total Revenue', value: `₹${analytics.totalRevenue}`, icon: Activity, color: 'text-green-600' },
                                { title: 'Appointments', value: analytics.totalAppointments, icon: Activity, color: 'text-purple-600' },
                            ].map((stat, i) => (
                                <Card key={i}>
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                                        </div>
                                        <div className={`p-3 bg-gray-50 rounded-full ${stat.color}`}><stat.icon className="w-6 h-6" /></div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card>
                            <CardHeader><CardTitle>Recent Appointments</CardTitle></CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                            <tr><th className="px-6 py-3">Patient</th><th className="px-6 py-3">Doctor</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Status</th></tr>
                                        </thead>
                                        <tbody>
                                            {analytics.recentAppointments.map((apt: any) => (
                                                <tr key={apt.id} className="border-b">
                                                    <td className="px-6 py-4 font-medium text-gray-900">{apt.patient.user.name}</td>
                                                    <td className="px-6 py-4">Dr. {apt.doctor.user.name}</td>
                                                    <td className="px-6 py-4">{new Date(apt.dateTime).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{apt.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {analytics.recentAppointments.length === 0 && <div className="text-center py-4 text-gray-500">No appointments found</div>}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="flex justify-center p-20"><div className="animate-spin h-8 w-8 border-b-2 border-teal-600 rounded-full" /></div>
                )}
            </main>
        </div>
    );
}
