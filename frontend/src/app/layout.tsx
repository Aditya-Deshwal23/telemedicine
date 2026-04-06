import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'MediConnect - Online Doctor Consultation & Telemedicine',
    description: 'Connect with top doctors instantly via video consultation. Book appointments, get prescriptions, and manage your health online.',
    keywords: 'telemedicine, online doctor, video consultation, health, appointment booking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="min-h-screen antialiased">{children}</body>
        </html>
    );
}
