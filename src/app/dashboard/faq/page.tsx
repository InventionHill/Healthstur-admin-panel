'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Faq {
    id: string;
    question: string;
    answer: string;
    isActive: boolean;
    order: number;
}

export default function FAQList() {
    const router = useRouter();
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const fetchFaqs = async () => {
        try {
            const response = await axios.get('/faq/admin');
            setFaqs(response.data);
        } catch (error) {
            console.error('Failed to fetch FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await axios.delete(`/faq/${itemToDelete}`);
            fetchFaqs();
        } catch (error) {
            console.error('Failed to delete FAQ:', error);
        } finally {
            setItemToDelete(null);
        }
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
    };

    const handleToggleActive = async (faq: Faq) => {
        try {
            const newStatus = !faq.isActive;
            setFaqs(current => current.map(f => f.id === faq.id ? { ...f, isActive: newStatus } : f));
            await axios.put(`/faq/${faq.id}`, { ...faq, isActive: newStatus });
        } catch (error) {
            console.error('Failed to toggle faq status:', error);
            fetchFaqs();
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

        const draggedIndex = faqs.findIndex(f => f.id === draggedItemId);
        const targetIndex = faqs.findIndex(f => f.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newFaqs = [...faqs];
        const [removedItem] = newFaqs.splice(draggedIndex, 1);
        newFaqs.splice(targetIndex, 0, removedItem);

        setFaqs(newFaqs);
        setIsSavingOrder(true);

        try {
            const payload = newFaqs.map((f, index) => ({ id: f.id, order: index }));
            await axios.put('/faq/reorder', payload);
        } catch (error) {
            console.error('Failed to save new order:', error);
            alert('Failed to save the new order. Refreshing.');
            fetchFaqs();
        } finally {
            setIsSavingOrder(false);
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manage FAQs</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage frequently asked questions on the website.</p>
                </div>
                <Link
                    href="/dashboard/faq/create"
                    className="flex items-center justify-center w-full sm:w-auto space-x-2 bg-[#023051] text-white px-4 py-2 rounded-lg hover:bg-[#023051]/90 shrink-0"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add FAQ</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left w-10"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 z-10 bg-gray-50 shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`bg-white divide-y divide-gray-200 ${isSavingOrder ? 'opacity-50 pointer-events-none' : ''}`}>
                        {faqs.map((faq) => (
                            <tr
                                key={faq.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, faq.id)}
                                onDragOver={(e) => handleDragOver(e, faq.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, faq.id)}
                                onDragEnd={handleDragEnd}
                                className={`transition-colors group ${dragOverItemId === faq.id ? 'bg-blue-50 border-t-2 border-t-blue-500' : 'hover:bg-gray-50'}`}
                            >
                                <td className="px-6 py-4 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors">
                                    <GripVertical className="w-5 h-5" />
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 line-clamp-2 select-none">
                                    {faq.question}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <label className="inline-flex items-center cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={faq.isActive}
                                                onChange={() => handleToggleActive(faq)}
                                            />
                                            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 transition-colors shadow-sm"></div>
                                        </div>
                                        <span className={`ml-3 text-sm font-medium transition-colors ${faq.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            {faq.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </label>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 z-10 transition-colors shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)] ${dragOverItemId === faq.id ? 'bg-blue-50' : 'bg-white group-hover:bg-gray-50'}`}>
                                    <div className="flex justify-end space-x-2">
                                        <Link
                                            href={`/dashboard/faq/${faq.id}`}
                                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(faq.id)}
                                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {faqs.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    No FAQs found. Create one to get started.
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
                title="Delete FAQ"
                message="Are you sure you want to delete this FAQ? This action cannot be undone."
                confirmText="Delete"
            />
        </div>
    );
}
