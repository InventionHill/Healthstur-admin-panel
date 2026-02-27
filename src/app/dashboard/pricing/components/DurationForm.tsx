'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import axios from '@/lib/axios';

interface DurationFormProps {
    id?: string;
}

export default function DurationForm({ id }: DurationFormProps) {
    const router = useRouter();
    const [name, setName] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!!id);

    useEffect(() => {
        if (id) {
            const fetchDuration = async () => {
                try {
                    const response = await axios.get(`/pricing/durations/${id}`);
                    const data = response.data;
                    setName(data.name);
                    setIsActive(data.isActive);
                } catch (error) {
                    console.error('Failed to fetch duration:', error);
                } finally {
                    setInitialLoading(false);
                }
            };
            fetchDuration();
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name,
            isActive
        };

        try {
            if (id) {
                await axios.put(`/pricing/durations/${id}`, payload);
            } else {
                await axios.post('/pricing/durations', payload);
            }
            router.push('/dashboard/pricing');
            router.refresh();
        } catch (error) {
            console.error('Failed to save duration:', error);
            alert('Failed to save duration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="w-full">
            <div className="flex items-center space-x-4 mb-6">
                <Link
                    href="/dashboard/pricing"
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        {id ? 'Edit Duration' : 'Create Duration'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {id ? 'Update pricing duration details.' : 'Add a new pricing duration (e.g. 3 Months).'}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#023051] focus:border-transparent outline-none transition-all bg-white text-gray-900"
                            placeholder="e.g. 1 Month, 3 Months, Lifetime"
                        />
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900">Duration Visibility</h4>
                            <p className="text-xs text-gray-500 mt-1">Control if this duration and its plans appear on the website.</p>
                        </div>
                        <label className="flex items-center space-x-3 cursor-pointer bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm shrink-0">
                            <span className="text-sm font-medium text-gray-700">Active</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#023051]"></div>
                            </div>
                        </label>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-end space-x-3">
                            <Link
                                href="/dashboard/pricing"
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center space-x-2 bg-[#023051] text-white px-6 py-2 rounded-lg hover:bg-[#023051]/90 focus:ring-4 focus:ring-[#023051]/20 transition-all disabled:opacity-50 font-medium text-sm"
                            >
                                {loading ? (
                                    <span>Saving...</span>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Save</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
