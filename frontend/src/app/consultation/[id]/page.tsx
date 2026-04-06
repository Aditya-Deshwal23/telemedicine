'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import { doctorAPI } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function VideoConsultationPage() {
    const { id: appointmentId } = useParams();
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [token, setToken] = useState('');
    const [roomName, setRoomName] = useState(`room_${appointmentId}`);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) router.push('/auth/login');
    }, [isAuthenticated]);

    useEffect(() => {
        if (user && appointmentId) {
            // Fetch token from backend
            doctorAPI.getVideoToken(roomName)
                .then(({ data }) => setToken(data.token))
                .catch(err => setError(err.response?.data?.error || 'Failed to connect to video server'));
        }
    }, [user, appointmentId]);

    if (!user) return null;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Card className="p-8 max-w-sm text-center"><h2 className="text-xl font-bold text-red-600 mb-2">Connection Error</h2><p className="text-gray-600 mb-4">{error}</p><Button onClick={() => router.back()}>Go Back</Button></Card></div>;
    if (!token) return <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col"><Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-4" /><p>Connecting to secure room...</p></div>;

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <header className="bg-gray-900 border-b border-gray-800 p-4 text-white flex justify-between items-center">
                <h1 className="font-bold">MediConnect Video Consultation</h1>
                <div className="text-sm text-gray-400">End-to-End Encrypted</div>
            </header>

            <main className="flex-1 relative">
                <LiveKitRoom
                    video={true}
                    audio={true}
                    token={token}
                    serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                    data-lk-theme="default"
                    className="h-[calc(100vh-64px)]"
                    onDisconnected={() => router.push(user.role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard')}
                >
                    {/* Main video layout */}
                    <VideoConference />

                    {/* Renders other participant's audio */}
                    <RoomAudioRenderer />
                </LiveKitRoom>
            </main>
        </div>
    );
}
