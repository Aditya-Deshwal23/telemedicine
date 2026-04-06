'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { doctorAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, Search, Filter, Calendar } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

export default function DoctorSearchPage() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [specialization, setSpecialization] = useState('');
    const { isAuthenticated } = useAuthStore();

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const { data } = await doctorAPI.search({ name: search, specialization });
            setDoctors(data.doctors);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, [specialization]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchDoctors();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b py-6">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-6">Find a Doctor</h1>
                    <form onSubmit={handleSearch} className="flex gap-4 max-w-3xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input placeholder="Search doctors by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-12" />
                        </div>
                        <div className="w-1/3">
                            <select className="w-full h-12 rounded-md border border-input bg-background px-3" value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
                                <option value="">All Specializations</option>
                                <option value="Cardiologist">Cardiologist</option>
                                <option value="Dermatologist">Dermatologist</option>
                                <option value="General Physician">General Physician</option>
                                <option value="Neurologist">Neurologist</option>
                                <option value="Pediatrician">Pediatrician</option>
                            </select>
                        </div>
                        <Button type="submit" className="h-12 w-24">Search</Button>
                    </form>
                </div>
            </header>

            {/* Results */}
            <main className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>
                ) : (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">Showing {doctors.length} doctors</h2>
                        {doctors.map((doctor: any) => (
                            <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <CardContent className="p-0 sm:flex">
                                    <div className="bg-teal-50 w-full sm:w-48 h-48 flex items-center justify-center border-r">
                                        {doctor.user.avatar ? (
                                            <img src={doctor.user.avatar} alt={doctor.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-teal-200 flex items-center justify-center text-teal-700 text-3xl font-bold">
                                                {doctor.user.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900">Dr. {doctor.user.name}</h3>
                                                    <p className="text-teal-600 font-medium text-lg mb-2">{doctor.specialization}</p>
                                                </div>
                                                <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md text-sm font-bold">
                                                    <Star className="w-4 h-4 fill-current text-yellow-500" /> {doctor.rating || 'New'}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                                                <div className="flex items-center gap-1"><Badge variant="outline">{doctor.qualification}</Badge></div>
                                                <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {doctor.experience} yrs exp</div>
                                            </div>
                                            <p className="text-gray-600 line-clamp-2 text-sm">{doctor.bio || 'Experienced doctor providing comprehensive care.'}</p>
                                        </div>
                                        <div className="mt-6 flex items-center justify-between border-t pt-4">
                                            <div className="text-lg font-bold text-gray-900">₹{doctor.fee} <span className="text-sm font-normal text-gray-500">per consult</span></div>
                                            {isAuthenticated ? (
                                                <Link href={`/patient/book/${doctor.id}`}>
                                                    <Button className="gradient-primary text-white"><Calendar className="w-4 h-4 mr-2" /> Book Appointment</Button>
                                                </Link>
                                            ) : (
                                                <Link href="/auth/login"><Button variant="outline">Login to Book</Button></Link>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {doctors.length === 0 && (
                            <div className="text-center py-20 text-gray-500">No doctors found matching your criteria.</div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
