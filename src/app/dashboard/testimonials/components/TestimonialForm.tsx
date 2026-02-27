'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { Save, Loader2, Upload, AlertCircle } from 'lucide-react';

interface TestimonialFormProps {
    id?: string;
}

export default function TestimonialForm({ id }: TestimonialFormProps) {
    const router = useRouter();
    const isEditing = !!id;
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditing);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        role: '',
        image: '',
        quote: '',
        stars: 5,
        isActive: true,
    });

    useEffect(() => {
        if (isEditing) {
            fetchTestimonial();
        }
    }, [id]);

    const fetchTestimonial = async () => {
        try {
            const response = await axios.get(`/testimonial/${id}`);
            setFormData({
                name: response.data.name,
                role: response.data.role,
                image: response.data.image || '',
                quote: response.data.quote,
                stars: response.data.stars || 5,
                isActive: response.data.isActive,
            });
        } catch (error) {
            console.error('Failed to fetch Testimonial:', error);
            setError('Failed to load Testimonial data');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setError(null);
            setIsUploadingImage(true);
            const data = new FormData();
            data.append('file', file);

            // Reusing the programs upload endpoint
            const res = await axios.post('/programs/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFormData(prev => ({ ...prev, image: res.data.url }));
        } catch (error) {
            console.error('Error uploading file', error);
            setError('Error uploading file');
        } finally {
            setIsUploadingImage(false);
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
                await axios.put(`/testimonial/${id}`, payload);
            } else {
                await axios.post('/testimonial', payload);
            }

            router.push('/dashboard/testimonials');
            router.refresh();
        } catch (err) {
            console.error('Failed to save Testimonial:', err);
            setError('Failed to save Testimonial. Please try again.');
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                                placeholder="e.g., Jennifer Wu"
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                Role *
                            </label>
                            <input
                                type="text"
                                id="role"
                                required
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                                placeholder="e.g., YOGA ENTHUSIAST"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Avatar Image</label>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors border border-gray-300 shadow-sm text-sm font-medium">
                                    <Upload className="w-4 h-4 mr-2" />
                                    {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e)} disabled={isUploadingImage} />
                                </label>
                                {formData.image && (
                                    <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                                        {formData.image.startsWith('http') ? (
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}${formData.image}`} alt="Preview" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="stars" className="block text-sm font-medium text-gray-700 mb-2">
                                Stars Rating (1-5) *
                            </label>
                            <input
                                type="number"
                                id="stars"
                                min="1"
                                max="5"
                                required
                                value={formData.stars}
                                onChange={(e) => setFormData({ ...formData, stars: Number(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-2">
                            Quote *
                        </label>
                        <textarea
                            id="quote"
                            required
                            rows={3}
                            value={formData.quote}
                            onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors resize-y"
                            placeholder="Enter the testimony quote..."
                        />
                    </div>

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

                    <div className="pt-6 border-t border-gray-100 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => router.push('/dashboard/testimonials')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || isUploadingImage}
                            className="flex items-center space-x-2 bg-[#023051] text-white px-6 py-2 rounded-lg hover:bg-[#023051]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span>{isEditing ? 'Update Story' : 'Save Story'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
