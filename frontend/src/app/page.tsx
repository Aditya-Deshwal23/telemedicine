'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, Calendar, Shield, Brain, MessageCircle, FileText, Star, ArrowRight, Heart, Clock, Users, Stethoscope } from 'lucide-react';

const features = [
    { icon: Video, title: 'HD Video Consultation', description: 'Crystal clear 1-to-1 video calls with your doctor from anywhere', color: 'text-teal-600 bg-teal-50' },
    { icon: Brain, title: 'AI Symptom Checker', description: 'Describe symptoms and get instant specialization recommendations', color: 'text-purple-600 bg-purple-50' },
    { icon: Calendar, title: 'Easy Scheduling', description: 'Book appointments with available time slots and smart queue', color: 'text-blue-600 bg-blue-50' },
    { icon: Shield, title: 'Secure & Private', description: 'End-to-end encrypted calls with HIPAA-compliant data storage', color: 'text-green-600 bg-green-50' },
    { icon: FileText, title: 'Digital Prescriptions', description: 'Get prescriptions digitally, accessible anytime from your dashboard', color: 'text-orange-600 bg-orange-50' },
    { icon: MessageCircle, title: 'Real-time Chat', description: 'Chat with your doctor before, during, and after consultations', color: 'text-pink-600 bg-pink-50' },
];

const stats = [
    { value: '10,000+', label: 'Consultations', icon: Video },
    { value: '500+', label: 'Verified Doctors', icon: Stethoscope },
    { value: '50,000+', label: 'Happy Patients', icon: Heart },
    { value: '< 15min', label: 'Avg Wait Time', icon: Clock },
];

const specializations = [
    'General Physician', 'Cardiologist', 'Dermatologist', 'Orthopedic', 'Neurologist',
    'Psychiatrist', 'Gynecologist', 'Pediatrician', 'ENT Specialist', 'Ophthalmologist',
    'Gastroenterologist', 'Pulmonologist',
];

const steps = [
    { step: '01', title: 'Describe Symptoms', description: 'Use our AI symptom checker or search for a doctor by specialization' },
    { step: '02', title: 'Book Appointment', description: 'Choose a doctor, pick a time slot, and pay securely via Razorpay' },
    { step: '03', title: 'Video Consultation', description: 'Join your video call with HD quality, screen sharing, and in-call chat' },
    { step: '04', title: 'Get Prescription', description: 'Receive digital prescriptions and follow-up recommendations instantly' },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                            <Heart className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gradient">MediConnect</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/doctors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Find Doctors</Link>
                        <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                        <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/auth/login">
                            <Button variant="ghost" size="sm">Log In</Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button size="sm" className="gradient-primary border-0 text-white">Sign Up Free</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="gradient-hero text-white pt-32 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
                            Trusted by 50,000+ patients across India
                        </div>
                        <h1 className="text-5xl md:text-6xl font-800 leading-tight mb-6">
                            Consult Top Doctors<br />
                            <span className="text-teal-300">Online, Anytime</span>
                        </h1>
                        <p className="text-lg text-teal-100 mb-8 max-w-xl mx-auto">
                            Skip the waiting room. Connect with verified specialists via secure HD video calls.
                            Get prescriptions, reports analyzed by AI, and follow-ups — all from home.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/patient/symptom-checker">
                                <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 text-base font-semibold px-8 h-12">
                                    <Brain className="w-5 h-5 mr-2" /> Check Symptoms with AI
                                </Button>
                            </Link>
                            <Link href="/doctors">
                                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base h-12 px-8">
                                    Find a Doctor <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 border-b bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <stat.icon className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                                <div className="text-3xl font-bold text-gradient">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 bg-gray-50/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need for <span className="text-gradient">Digital Healthcare</span></h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">From AI-powered symptom checking to HD video consultations and digital prescriptions — healthcare reimagined.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <Card key={feature.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm">
                                <CardContent className="p-6">
                                    <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                        <p className="text-muted-foreground">Four simple steps to your online consultation</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((item, i) => (
                            <div key={item.step} className="relative">
                                <div className="text-6xl font-800 text-teal-100 mb-4">{item.step}</div>
                                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                {i < steps.length - 1 && <div className="hidden lg:block absolute top-8 right-0 w-12 h-0.5 bg-teal-200" />}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Specializations */}
            <section className="py-20 bg-gray-50/50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-10">Browse by <span className="text-gradient">Specialization</span></h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {specializations.map((spec) => (
                            <Link key={spec} href={`/doctors?specialization=${encodeURIComponent(spec)}`}>
                                <Button variant="outline" className="rounded-full hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-all">{spec}</Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 gradient-hero text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Consult a Doctor?</h2>
                    <p className="text-teal-100 mb-8 max-w-md mx-auto">Join thousands of patients who trust MediConnect for their healthcare needs.</p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/auth/register">
                            <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 font-semibold px-8">Get Started Free</Button>
                        </Link>
                        <Link href="/auth/register?role=doctor">
                            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">Join as Doctor</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Heart className="w-6 h-6 text-teal-500" />
                                <span className="text-white font-bold text-lg">MediConnect</span>
                            </div>
                            <p className="text-sm">India&apos;s trusted telemedicine platform connecting patients with verified doctors.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-3">For Patients</h4>
                            <div className="space-y-2 text-sm">
                                <Link href="/doctors" className="block hover:text-white">Find Doctors</Link>
                                <Link href="/patient/symptom-checker" className="block hover:text-white">AI Symptom Checker</Link>
                                <Link href="/auth/login" className="block hover:text-white">My Appointments</Link>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-3">For Doctors</h4>
                            <div className="space-y-2 text-sm">
                                <Link href="/auth/register?role=doctor" className="block hover:text-white">Join as Doctor</Link>
                                <Link href="/doctor/dashboard" className="block hover:text-white">Doctor Dashboard</Link>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-3">Support</h4>
                            <div className="space-y-2 text-sm">
                                <a href="#" className="block hover:text-white">Help Center</a>
                                <a href="#" className="block hover:text-white">Privacy Policy</a>
                                <a href="#" className="block hover:text-white">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
                        © {new Date().getFullYear()} MediConnect. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
