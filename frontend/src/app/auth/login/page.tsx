'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth.store';
import { authAPI } from '@/lib/api';
import { Heart, Mail, Lock, Phone, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [tab, setTab] = useState<'email' | 'otp' | 'google'>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { login, setAuth } = useAuthStore();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            const user = useAuthStore.getState().user;
            if (user?.role === 'DOCTOR') router.push('/doctor/dashboard');
            else if (user?.role === 'ADMIN') router.push('/admin/dashboard');
            else router.push('/patient/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        setLoading(true);
        setError('');
        try {
            await authAPI.sendOTP(email);
            setOtpSent(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await authAPI.verifyOTP({ email, otp });
            setAuth(data.user, data.token);
            router.push('/patient/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md relative z-10 shadow-2xl border-0">
                <CardHeader className="text-center pb-2">
                    <Link href="/" className="flex items-center justify-center gap-2 mb-4">
                        <Heart className="w-8 h-8 text-teal-600" />
                        <span className="text-2xl font-bold text-gradient">MediConnect</span>
                    </Link>
                    <CardTitle className="text-2xl">Welcome Back</CardTitle>
                    <CardDescription>Sign in to access your health dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Tab Selector */}
                    <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6">
                        {[
                            { key: 'email', label: 'Email', icon: Mail },
                            { key: 'otp', label: 'OTP', icon: Phone },
                        ].map((t) => (
                            <button key={t.key} onClick={() => { setTab(t.key as any); setError(''); }}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all ${tab === t.key ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                                <t.icon className="w-4 h-4" /> {t.label}
                            </button>
                        ))}
                    </div>

                    {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

                    {tab === 'email' && (
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Email</label>
                                <Input type="email" placeholder="doctor@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Password</label>
                                <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full gradient-primary border-0 text-white h-11" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Sign In
                            </Button>
                        </form>
                    )}

                    {tab === 'otp' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Email or Phone</label>
                                <Input type="email" placeholder="patient@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            {otpSent && (
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Enter OTP</label>
                                    <Input type="text" placeholder="123456" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} className="text-center text-lg tracking-widest" />
                                </div>
                            )}
                            <Button className="w-full gradient-primary border-0 text-white h-11" disabled={loading}
                                onClick={otpSent ? handleVerifyOTP : handleSendOTP}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {otpSent ? 'Verify OTP' : 'Send OTP'}
                            </Button>
                        </div>
                    )}

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Or continue with</span></div>
                    </div>

                    <Button variant="outline" className="w-full h-11" onClick={() => { /* Google OAuth redirect */ }}>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        Continue with Google
                    </Button>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Don&apos;t have an account? <Link href="/auth/register" className="text-teal-600 font-medium hover:underline">Sign Up</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
