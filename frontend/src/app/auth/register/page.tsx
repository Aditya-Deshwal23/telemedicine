'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth.store';
import { Heart, Loader2, User, Stethoscope } from 'lucide-react';

export default function RegisterPage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4">Loading...</div>}>
            <RegisterForm />
        </React.Suspense>
    );
}

function RegisterForm() {
    const searchParams = useSearchParams();
    const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>(searchParams.get('role') === 'doctor' ? 'DOCTOR' : 'PATIENT');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', specialization: '', qualification: '', experience: '', fee: '', licenseNumber: '', bio: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { register } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register({ ...formData, role, experience: Number(formData.experience), fee: Number(formData.fee) });
            router.push(role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

    return (
        <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400 rounded-full blur-3xl" />
            </div>
            <Card className="w-full max-w-lg relative z-10 shadow-2xl border-0 my-8">
                <CardHeader className="text-center pb-2">
                    <Link href="/" className="flex items-center justify-center gap-2 mb-2">
                        <Heart className="w-7 h-7 text-teal-600" />
                        <span className="text-xl font-bold text-gradient">MediConnect</span>
                    </Link>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>Join as a patient or doctor</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Role Toggle */}
                    <div className="flex gap-2 mb-6">
                        {[
                            { key: 'PATIENT' as const, label: 'Patient', icon: User },
                            { key: 'DOCTOR' as const, label: 'Doctor', icon: Stethoscope },
                        ].map((r) => (
                            <button key={r.key} onClick={() => setRole(r.key)}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${role === r.key ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-gray-300'}`}>
                                <r.icon className="w-5 h-5" /> {r.label}
                            </button>
                        ))}
                    </div>

                    {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-sm font-medium mb-1 block">Full Name</label><Input placeholder="John Doe" value={formData.name} onChange={e => updateField('name', e.target.value)} required /></div>
                            <div><label className="text-sm font-medium mb-1 block">Phone</label><Input placeholder="+91 98765 43210" value={formData.phone} onChange={e => updateField('phone', e.target.value)} /></div>
                        </div>
                        <div><label className="text-sm font-medium mb-1 block">Email</label><Input type="email" placeholder="you@example.com" value={formData.email} onChange={e => updateField('email', e.target.value)} required /></div>
                        <div><label className="text-sm font-medium mb-1 block">Password</label><Input type="password" placeholder="Min 8 characters" value={formData.password} onChange={e => updateField('password', e.target.value)} required /></div>

                        {role === 'DOCTOR' && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="text-sm font-medium mb-1 block">Specialization</label><Input placeholder="Cardiologist" value={formData.specialization} onChange={e => updateField('specialization', e.target.value)} required /></div>
                                    <div><label className="text-sm font-medium mb-1 block">Qualification</label><Input placeholder="MBBS, MD" value={formData.qualification} onChange={e => updateField('qualification', e.target.value)} required /></div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div><label className="text-sm font-medium mb-1 block">Experience (yrs)</label><Input type="number" placeholder="5" value={formData.experience} onChange={e => updateField('experience', e.target.value)} required /></div>
                                    <div><label className="text-sm font-medium mb-1 block">Fee (₹)</label><Input type="number" placeholder="500" value={formData.fee} onChange={e => updateField('fee', e.target.value)} required /></div>
                                    <div><label className="text-sm font-medium mb-1 block">License #</label><Input placeholder="MCI12345" value={formData.licenseNumber} onChange={e => updateField('licenseNumber', e.target.value)} required /></div>
                                </div>
                                <div><label className="text-sm font-medium mb-1 block">Bio</label><textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={2} placeholder="Brief about yourself..." value={formData.bio} onChange={e => updateField('bio', e.target.value)} /></div>
                            </>
                        )}

                        <Button type="submit" className="w-full gradient-primary border-0 text-white h-11 mt-2" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Create Account
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-4">
                        Already have an account? <Link href="/auth/login" className="text-teal-600 font-medium hover:underline">Sign In</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
