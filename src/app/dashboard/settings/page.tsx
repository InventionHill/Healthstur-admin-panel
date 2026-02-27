'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { Save, Loader2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        address: '',
        facebookUrl: '',
        instagramUrl: '',
        twitterUrl: '',
        youtubeUrl: '',
        mapUrl: '',
        workingHours: '',
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get('/company-info');
                const data = response.data;
                setFormData({
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    facebookUrl: data.facebookUrl || '',
                    instagramUrl: data.instagramUrl || '',
                    twitterUrl: data.twitterUrl || '',
                    youtubeUrl: data.youtubeUrl || '',
                    mapUrl: data.mapUrl || '',
                    workingHours: data.workingHours || '',
                });
            } catch (error) {
                console.error('Failed to fetch Company Info:', error);
                setError('Failed to load Company Settings');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            await axios.put('/company-info', formData);
            setSuccessMessage('Company details successfully updated.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Failed to save Company Info:', err);
            setError('Failed to save settings. Please try again.');
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
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Company Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage global contact details and social media links.</p>
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

                    {/* Contact Details Section */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Contact Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Official Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                                    placeholder="e.g., care.healthstur@gmail.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                                    placeholder="e.g., +91 99981 17873"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                    Office Address
                                </label>
                                <textarea
                                    id="address"
                                    rows={3}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                                    placeholder="Enter physical address here"
                                ></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700 mb-2">
                                    Working Hours
                                </label>
                                <input
                                    type="text"
                                    id="workingHours"
                                    value={formData.workingHours}
                                    onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                                    placeholder="e.g., MON-SAT: 9:30 AM - 6:30 PM"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Media Links Section */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Social Media Links</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                    Instagram URL
                                </label>
                                <input
                                    type="url"
                                    id="instagramUrl"
                                    value={formData.instagramUrl}
                                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                            <div>
                                <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                    Facebook URL
                                </label>
                                <input
                                    type="url"
                                    id="facebookUrl"
                                    value={formData.facebookUrl}
                                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                            <div>
                                <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                    YouTube URL
                                </label>
                                <input
                                    type="url"
                                    id="youtubeUrl"
                                    value={formData.youtubeUrl}
                                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                            <div>
                                <label htmlFor="twitterUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                    Twitter / X URL
                                </label>
                                <input
                                    type="url"
                                    id="twitterUrl"
                                    value={formData.twitterUrl}
                                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                                    placeholder="https://x.com/..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="mapUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                    Google Maps Embed URL (iframe src)
                                </label>
                                <textarea
                                    id="mapUrl"
                                    rows={3}
                                    value={formData.mapUrl}
                                    onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                                    placeholder='e.g., https://www.google.com/maps/embed?pb=...'
                                ></textarea>
                                <p className="text-xs text-gray-500 mt-1">
                                    Go to Google Maps &gt; Share &gt; Embed a map &gt; Copy HTML. Extract the `src` link and paste it here. Leave empty to hide the map.
                                </p>
                            </div>
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
                            <span>Save Settings</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
