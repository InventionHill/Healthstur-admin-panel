'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import axios from '@/lib/axios';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Category {
    id: string;
    name: string;
    isActive: boolean;
    order: number;
}

export default function StoryCategoriesList() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/success-story-category/admin');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await axios.delete(`/success-story-category/${itemToDelete}`);
            fetchCategories();
        } catch (error) {
            console.error('Failed to delete category:', error);
        } finally {
            setItemToDelete(null);
        }
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
    };

    const handleToggleActive = async (category: Category) => {
        try {
            const newStatus = !category.isActive;
            setCategories(current => current.map(c => c.id === category.id ? { ...c, isActive: newStatus } : c));
            await axios.put(`/success-story-category/${category.id}`, { ...category, isActive: newStatus });
        } catch (error) {
            console.error('Failed to toggle category status:', error);
            fetchCategories();
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

        const draggedIndex = categories.findIndex(c => c.id === draggedItemId);
        const targetIndex = categories.findIndex(c => c.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newCategories = [...categories];
        const [removedItem] = newCategories.splice(draggedIndex, 1);
        newCategories.splice(targetIndex, 0, removedItem);

        setCategories(newCategories);
        setIsSavingOrder(true);

        try {
            const payload = newCategories.map((c, index) => ({ id: c.id, order: index }));
            await axios.put('/success-story-category/reorder', payload);
        } catch (error) {
            console.error('Failed to save new order:', error);
            alert('Failed to save the new order. Refreshing.');
            fetchCategories();
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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Story Categories</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage categories for success stories directly influencing front-end filters.</p>
                </div>
                <Link
                    href="/dashboard/story-categories/create"
                    className="flex items-center space-x-2 bg-[#023051] text-white px-4 py-2 rounded-lg hover:bg-[#023051]/90"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Category</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left w-10"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`bg-white divide-y divide-gray-200 ${isSavingOrder ? 'opacity-50 pointer-events-none' : ''}`}>
                        {categories.map((category) => (
                            <tr
                                key={category.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, category.id)}
                                onDragOver={(e) => handleDragOver(e, category.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, category.id)}
                                onDragEnd={handleDragEnd}
                                className={`transition-colors group ${dragOverItemId === category.id ? 'bg-blue-50 border-t-2 border-t-blue-500' : 'hover:bg-gray-50'}`}
                            >
                                <td className="px-6 py-4 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors">
                                    <GripVertical className="w-5 h-5" />
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 select-none">
                                    {category.name}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <label className="inline-flex items-center cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={category.isActive}
                                                onChange={() => handleToggleActive(category)}
                                            />
                                            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 transition-colors shadow-sm"></div>
                                        </div>
                                        <span className={`ml-3 text-sm font-medium transition-colors ${category.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            {category.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </label>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <Link
                                            href={`/dashboard/story-categories/${category.id}`}
                                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    No Categories found. Create one to get started.
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
                title="Delete Category"
                message="Are you sure you want to delete this Category? Keep in mind this may affect any success stories linked to it."
                confirmText="Delete"
            />
        </div>
    );
}
