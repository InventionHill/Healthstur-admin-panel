'use client';

import { useEffect, useState, use } from 'react';
import CuratedTrackForm, { CuratedTrack } from '../../CuratedTrackForm';
import axios from '@/lib/axios';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditCuratedTrackPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const [track, setTrack] = useState<CuratedTrack | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTrack = async () => {
            try {
                const res = await axios.get(`/curated-tracks/${unwrappedParams.id}`);
                setTrack(res.data);
            } catch (error) {
                console.error('Failed to fetch track:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrack();
    }, [unwrappedParams.id]);

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading track data...</div>;
    }

    if (!track) {
        return <div className="p-8 text-center text-red-500">Track not found!</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link
                    href="/dashboard/curated-tracks"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Curated Track</h1>
                    <p className="text-sm text-gray-500 mt-1">Update details for {track.title}.</p>
                </div>
            </div>

            <CuratedTrackForm initialData={track} />
        </div>
    );
}
