'use client';

import { useState, useEffect } from 'react';
import { Trash2, Star } from 'lucide-react';
import axios from '@/lib/axios';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Feedback {
    id: string;
    orderId: string;
    fullName: string;
    email: string;
    subject: string;
    message: string;
    rating: number;
    createdAt: string;
}

export default function FeedbackList() {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const fetchFeedback = async () => {
        try {
            const response = await axios.get('/feedback');
            setFeedback(response.data);
        } catch (error) {
            console.error('Failed to fetch feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await axios.delete(`/feedback/${itemToDelete}`);
            fetchFeedback();
        } catch (error) {
            console.error('Failed to delete feedback:', error);
        } finally {
            setItemToDelete(null);
        }
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Feedback</h1>
                    <p className="text-sm text-gray-500 mt-1">Review feedback and ratings from users.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User / Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback Details</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 z-10 bg-gray-50 shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {feedback.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="font-medium text-gray-900">{item.fullName}</div>
                                    <div className="text-gray-500 text-xs">{item.email}</div>
                                    <div className="text-gray-400 text-xs mt-1">Order: {item.orderId}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < item.rating ? 'fill-[#FACC15] text-[#FACC15]' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="font-medium">{item.subject}</div>
                                    <div className="text-gray-500 text-xs mt-1 line-clamp-2">{item.message}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 z-10 bg-white group-hover:bg-gray-50 transition-colors shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)]">
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {feedback.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No feedback found.
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
                title="Delete Feedback"
                message="Are you sure you want to delete this feedback? This action cannot be undone."
                confirmText="Delete"
            />
        </div>
    );
}
