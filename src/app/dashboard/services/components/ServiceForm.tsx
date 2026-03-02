'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { Save, Loader2, AlertCircle } from 'lucide-react';

interface ServiceFormProps {
    id?: string;
}

export default function ServiceForm({ id }: ServiceFormProps) {
    const router = useRouter();
    const isEditing = !!id;
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditing);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        isActive: true,
    });

    useEffect(() => {
        if (isEditing) {
            fetchService();
        }
    }, [id]);

    const fetchService = async () => {
        try {
            const response = await axios.get(`/services/${id}`);
            setFormData({
                name: response.data.name,
                isActive: response.data.isActive,
            });
        } catch (error) {
            console.error('Failed to fetch Service:', error);
            setError('Failed to load Service data');
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
                await axios.put(`/services/${id}`, payload);
            } else {
                await axios.post('/services', payload);
            }

            router.push('/dashboard/services');
            router.refresh(); // Refresh the list
        } catch (err) {
            console.error('Failed to save Service:', err);
            setError('Failed to save Service. Please try again.');
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
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Service Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                            placeholder="e.g., Personalized Diet & Nutrition Plans"
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

                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                        <button
                            type="button"
                            onClick={() => router.push('/dashboard/services')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto flex items-center justify-center shrink-0"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center space-x-2 bg-[#023051] text-white px-6 py-2 rounded-lg hover:bg-[#023051]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto shrink-0 whitespace-nowrap"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span>{isEditing ? 'Update Service' : 'Save Service'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
