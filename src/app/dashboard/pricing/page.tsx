'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, GripVertical, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Duration {
    id: string;
    name: string;
    isActive: boolean;
    order: number;
    _count: {
        plans: number;
    }
}

export default function PricingDurationsList() {
    const router = useRouter();
    const [durations, setDurations] = useState<Duration[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const fetchDurations = async () => {
        try {
            const response = await axios.get('/pricing/durations');
            setDurations(response.data);
        } catch (error) {
            console.error('Failed to fetch pricing durations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDurations();
    }, []);

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await axios.delete(`/pricing/durations/${itemToDelete}`);
            fetchDurations();
        } catch (error) {
            console.error('Failed to delete duration:', error);
        } finally {
            setItemToDelete(null);
        }
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
    };

    const handleToggleActive = async (duration: Duration) => {
        try {
            const newStatus = !duration.isActive;
            setDurations(current => current.map(d => d.id === duration.id ? { ...d, isActive: newStatus } : d));
            await axios.put(`/pricing/durations/${duration.id}`, { ...duration, isActive: newStatus });
        } catch (error) {
            console.error('Failed to toggle duration status:', error);
            fetchDurations();
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
        setTimeout(() => {
            if (e.target instanceof HTMLElement) e.target.style.opacity = '0.5';
        }, 0);
    };

    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (id !== dragOverItemId) setDragOverItemId(id);
    };

    const handleDragLeave = () => {
        setDragOverItemId(null);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedItemId(null);
        setDragOverItemId(null);
        if (e.target instanceof HTMLElement) e.target.style.opacity = '1';
    };

    const handleDrop = async (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        setDragOverItemId(null);

        if (!draggedItemId || draggedItemId === targetId) return;

        const draggedIndex = durations.findIndex(d => d.id === draggedItemId);
        const targetIndex = durations.findIndex(d => d.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newDurations = [...durations];
        const [removedItem] = newDurations.splice(draggedIndex, 1);
        newDurations.splice(targetIndex, 0, removedItem);

        setDurations(newDurations);
        setIsSavingOrder(true);

        try {
            const payload = newDurations.map((d, index) => ({ id: d.id, order: index }));
            await axios.put('/pricing/durations/reorder', { orders: payload });
        } catch (error) {
            console.error('Failed to save new order:', error);
            alert('Failed to save the new order. Refreshing.');
            fetchDurations();
        } finally {
            setIsSavingOrder(false);
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manage Pricing Durations</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage durations (e.g. 3 Months, 6 Months) and their respective plans.</p>
                </div>
                <Link
                    href="/dashboard/pricing/create"
                    className="flex items-center space-x-2 bg-[#023051] text-white px-4 py-2 rounded-lg hover:bg-[#023051]/90"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Duration</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left w-10"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plans Configured</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 z-10 bg-gray-50 shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`bg-white divide-y divide-gray-200 ${isSavingOrder ? 'opacity-50 pointer-events-none' : ''}`}>
                        {durations.map((duration) => (
                            <tr
                                key={duration.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, duration.id)}
                                onDragOver={(e) => handleDragOver(e, duration.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, duration.id)}
                                onDragEnd={handleDragEnd}
                                className={`transition-colors group ${dragOverItemId === duration.id ? 'bg-blue-50 border-t-2 border-t-blue-500' : 'hover:bg-gray-50'}`}
                            >
                                <td className="px-6 py-4 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors">
                                    <GripVertical className="w-5 h-5" />
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 select-none font-medium">
                                    {duration.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 select-none">
                                    {duration._count?.plans || 0} Plans
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <label className="inline-flex items-center cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={duration.isActive}
                                                onChange={() => handleToggleActive(duration)}
                                            />
                                            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#023051] transition-colors shadow-sm"></div>
                                        </div>
                                        <span className={`ml-3 text-sm font-medium transition-colors ${duration.isActive ? 'text-[#023051]' : 'text-gray-400'}`}>
                                            {duration.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </label>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 z-10 transition-colors shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)] ${dragOverItemId === duration.id ? 'bg-blue-50' : 'bg-white group-hover:bg-gray-50'}`}>
                                    <div className="flex justify-end space-x-2">
                                        <Link
                                            href={`/dashboard/pricing/${duration.id}`}
                                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                                            title="Edit Duration"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(duration.id)}
                                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                                            title="Delete Duration"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {durations.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No Durations found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmDialog
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Duration"
                message="Are you sure you want to delete this Duration? All associated plans will also be deleted. This action cannot be undone."
                confirmText="Delete"
            />
        </div>
    );
}
