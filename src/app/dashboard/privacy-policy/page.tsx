'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { Save, Loader2, AlertCircle } from 'lucide-react';

export default function PrivacyPolicyPage() {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const response = await axios.get('/privacy-policy');
                if (response.data) {
                    if (response.data.content) setContent(response.data.content);
                    if (response.data.title) setTitle(response.data.title);
                    if (response.data.description) setDescription(response.data.description);
                }
            } catch (error) {
                console.error('Failed to fetch Privacy Policy:', error);
                setError('Failed to load Privacy Policy');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchPolicy();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            await axios.put('/privacy-policy', { title, description, content });
            setSuccessMessage('Privacy Policy successfully updated.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Failed to save Privacy Policy:', err);
            setError('Failed to save policy. Please try again.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>;
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Privacy Policy</h1>
                <p className="text-sm text-gray-500 mt-1">Manage the content displayed on the public Privacy Policy page (accepts HTML formatting).</p>
            </div>

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
                {successMessage && (
                    <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start shadow-sm">
                        <AlertCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-semibold text-green-800">Success</h3>
                            <p className="text-sm text-green-600 mt-1">{successMessage}</p>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Hero Section</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                                    placeholder="e.g., Privacy Policy"
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                                    placeholder="Enter a short description here..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Policy Content</h3>
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                                HTML Content
                            </label>
                            <textarea
                                id="content"
                                rows={25}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors font-mono text-sm"
                                placeholder="<p>Enter HTML formatted privacy policy here...</p>"
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-2">
                                You can use standard HTML tags like <code>&lt;h1&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;ul&gt;</code>, <code>&lt;li&gt;</code>, and <code>&lt;strong&gt;</code> to format the text.
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
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
                            <span>Save Policy</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
