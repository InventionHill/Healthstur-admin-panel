'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { Save, Loader2, AlertCircle } from 'lucide-react';

interface FaqFormProps {
    id?: string;
}

export default function FaqForm({ id }: FaqFormProps) {
    const router = useRouter();
    const isEditing = !!id;
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditing);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        isActive: true,
    });

    useEffect(() => {
        if (isEditing) {
            fetchFaq();
        }
    }, [id]);

    const fetchFaq = async () => {
        try {
            const response = await axios.get(`/faq/${id}`);
            setFormData({
                question: response.data.question,
                answer: response.data.answer,
                isActive: response.data.isActive,
            });
        } catch (error) {
            console.error('Failed to fetch FAQ:', error);
            setError('Failed to load FAQ data');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const payload = {
                ...formData,
            };

            if (isEditing) {
                await axios.put(`/faq/${id}`, payload);
            } else {
                await axios.post('/faq', payload);
            }

            router.push('/dashboard/faq');
            router.refresh(); // Refresh the list
        } catch (err) {
            console.error('Failed to save FAQ:', err);
            setError('Failed to save FAQ. Please try again.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                {error && (
                    <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start shadow-sm">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-semibold text-red-800">Action Required</h3>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                            Question *
                        </label>
                        <input
                            type="text"
                            id="question"
                            required
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                            placeholder="e.g., What is the best diet for weight loss?"
                        />
                    </div>

                    <div>
                        <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                            Answer *
                        </label>
                        <textarea
                            id="answer"
                            required
                            rows={4}
                            value={formData.answer}
                            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors resize-y"
                            placeholder="Enter the detailed answer here..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <div className="flex items-center h-[42px]">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#023051]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#023051]"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                        {formData.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => router.push('/dashboard/faq')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center space-x-2 bg-[#023051] text-white px-6 py-2 rounded-lg hover:bg-[#023051]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span>{isEditing ? 'Update FAQ' : 'Save FAQ'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
