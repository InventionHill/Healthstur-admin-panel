'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import axios from '@/lib/axios';
import Link from 'next/link';
import ConfirmDialog from '@/components/ConfirmDialog';

export interface CuratedTrack {
    id: string;
    title: string;
    description: string;
    image?: string;
    icon?: string;
    iconWidth?: number;
    iconHeight?: number;
    linkText: string;
    isActive?: boolean;
}

export default function CuratedTracksPage() {
    const [tracks, setTracks] = useState<CuratedTrack[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const fetchTracks = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get('/curated-tracks');
            setTracks(res.data);
        } catch (error) {
            console.error('Failed to fetch curated tracks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTracks();
    }, []);

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await axios.delete(`/curated-tracks/${itemToDelete}`);
            fetchTracks();
        } catch (error) {
            console.error('Failed to delete track:', error);
        } finally {
            setItemToDelete(null);
        }
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
    };

    const handleToggleActive = async (track: CuratedTrack) => {
        try {
            const newStatus = !(track.isActive ?? true);
            setTracks(current => current.map(p => p.id === track.id ? { ...p, isActive: newStatus } : p));
            await axios.put(`/curated-tracks/${track.id}`, { ...track, isActive: newStatus });
        } catch (error) {
            console.error('Failed to toggle track status:', error);
            fetchTracks();
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
        setTimeout(() => {
            if (e.target instanceof HTMLElement) {
                e.target.style.opacity = '0.5';
            }
        }, 0);
    };

    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (id !== dragOverItemId) {
            setDragOverItemId(id);
        }
    };

    const handleDragLeave = () => {
        setDragOverItemId(null);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedItemId(null);
        setDragOverItemId(null);
        if (e.target instanceof HTMLElement) {
            e.target.style.opacity = '1';
        }
    };

    const handleDrop = async (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        setDragOverItemId(null);

        if (!draggedItemId || draggedItemId === targetId) return;

        const draggedIndex = tracks.findIndex(p => p.id === draggedItemId);
        const targetIndex = tracks.findIndex(p => p.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newTracks = [...tracks];
        const [removedItem] = newTracks.splice(draggedIndex, 1);
        newTracks.splice(targetIndex, 0, removedItem);

        setTracks(newTracks);
        setIsSavingOrder(true);

        try {
            const payload = newTracks.map((p, index) => ({
                id: p.id,
                order: index
            }));

            await axios.put('/curated-tracks/reorder', payload);
        } catch (error) {
            console.error('Failed to save new order:', error);
            alert('Failed to save the new order. Refreshing.');
            fetchTracks();
        } finally {
            setIsSavingOrder(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Curated Tracks</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage Curated Tracks for the Home Page Slider</p>
                </div>
                <Link
                    href="/dashboard/curated-tracks/create"
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Track
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading tracks...</div>
                ) : tracks.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No tracks found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 w-10"></th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Image</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Title</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Link Text</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y divide-gray-100 ${isSavingOrder ? 'opacity-50 pointer-events-none' : ''}`}>
                                {tracks.map((track) => (
                                    <tr
                                        key={track.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, track.id)}
                                        onDragOver={(e) => handleDragOver(e, track.id)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, track.id)}
                                        onDragEnd={handleDragEnd}
                                        className={`transition-colors group ${dragOverItemId === track.id ? 'bg-blue-50 border-t-2 border-t-blue-500' : 'hover:bg-gray-50/50 bg-white'}`}
                                    >
                                        <td className="px-6 py-4 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors">
                                            <GripVertical className="w-5 h-5" />
                                        </td>
                                        <td className="px-6 py-4">
                                            {track.image && (
                                                <div className="w-16 h-10 rounded bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                                                    <img src={track.image?.startsWith('http') ? track.image : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}${track.image}`} alt="Background Image" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{track.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{track.linkText}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <label className="inline-flex items-center cursor-pointer group">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={track.isActive ?? true}
                                                        onChange={() => handleToggleActive(track)}
                                                    />
                                                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 transition-colors shadow-sm"></div>
                                                </div>
                                            </label>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right space-x-3">
                                            <Link
                                                href={`/dashboard/curated-tracks/${track.id}/edit`}
                                                className="text-blue-600 hover:text-blue-800 transition-colors inline-block"
                                            >
                                                <Edit2 className="w-4 h-4 inline" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(track.id)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Track"
                message="Are you sure you want to delete this curated track? This action cannot be undone."
                confirmText="Delete"
            />
        </div>
    );
}
