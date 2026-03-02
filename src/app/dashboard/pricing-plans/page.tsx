'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, GripVertical, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Plan {
    id: string;
    name: string;
    price: string;
    isActive: boolean;
    order: number;
    highlighted: boolean;
    duration: {
        id: string;
        name: string;
    };
}

export default function PricingPlansList() {
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const fetchAllPlans = async () => {
        try {
            const response = await axios.get(`/pricing/plans`);
            setPlans(response.data);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllPlans();
    }, []);

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await axios.delete(`/pricing/plans/${itemToDelete}`);
            fetchAllPlans();
        } catch (error) {
            console.error('Failed to delete plan:', error);
        } finally {
            setItemToDelete(null);
        }
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
    };

    const handleToggleActive = async (plan: Plan) => {
        try {
            const newStatus = !plan.isActive;
            setPlans(current => current.map(p => p.id === plan.id ? { ...p, isActive: newStatus } : p));
            await axios.put(`/pricing/plans/${plan.id}`, { ...plan, isActive: newStatus });
        } catch (error) {
            console.error('Failed to toggle plan status:', error);
            fetchAllPlans();
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

        const draggedIndex = plans.findIndex(p => p.id === draggedItemId);
        const targetIndex = plans.findIndex(p => p.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newPlans = [...plans];
        const [removedItem] = newPlans.splice(draggedIndex, 1);
        newPlans.splice(targetIndex, 0, removedItem);

        setPlans(newPlans);
        setIsSavingOrder(true);

        try {
            const payload = newPlans.map((p, index) => ({ id: p.id, order: index }));
            await axios.put('/pricing/plans/reorder', { orders: payload });
        } catch (error) {
            console.error('Failed to save new order:', error);
            alert('Failed to save the new order. Refreshing.');
            fetchAllPlans();
        } finally {
            setIsSavingOrder(false);
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manage Pricing Plans</h1>
                    <p className="text-sm text-gray-500 mt-1">Configure pricing plans and assign them to durations.</p>
                </div>
                <Link
                    href={`/dashboard/pricing-plans/create-plan`}
                    className="flex items-center space-x-2 bg-[#023051] text-white px-4 py-2 rounded-lg hover:bg-[#023051]/90 w-full sm:w-auto justify-center sm:justify-start shrink-0"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Plan</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left w-10"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name & Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 z-10 bg-gray-50 shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`bg-white divide-y divide-gray-200 ${isSavingOrder ? 'opacity-50 pointer-events-none' : ''}`}>
                        {plans.map((plan) => (
                            <tr
                                key={plan.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, plan.id)}
                                onDragOver={(e) => handleDragOver(e, plan.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, plan.id)}
                                onDragEnd={handleDragEnd}
                                className={`transition-colors group ${dragOverItemId === plan.id ? 'bg-blue-50 border-t-2 border-t-blue-500' : 'hover:bg-gray-50'}`}
                            >
                                <td className="px-6 py-4 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors">
                                    <GripVertical className="w-5 h-5" />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                        <span>${plan.price}</span>
                                        <span className="text-gray-300">•</span>
                                        <span>{plan.duration?.name || 'Unknown Duration'}</span>
                                        {plan.highlighted && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Popular</span>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <label className="inline-flex items-center cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={plan.isActive}
                                                onChange={() => handleToggleActive(plan)}
                                            />
                                            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#023051] transition-colors shadow-sm"></div>
                                        </div>
                                        <span className={`ml-3 text-sm font-medium transition-colors ${plan.isActive ? 'text-[#023051]' : 'text-gray-400'}`}>
                                            {plan.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </label>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 z-10 transition-colors shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)] ${dragOverItemId === plan.id ? 'bg-blue-50' : 'bg-white group-hover:bg-gray-50'}`}>
                                    <div className="flex justify-end space-x-2">
                                        <Link
                                            href={`/dashboard/pricing-plans/${plan.id}`}
                                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(plan.id)}
                                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {plans.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    No Plans found. Create one to get started.
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
                title="Delete Plan"
                message="Are you sure you want to delete this plan? This action cannot be undone."
                confirmText="Delete"
            />
        </div>
    );
}
