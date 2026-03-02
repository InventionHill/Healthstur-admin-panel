'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { Save, Loader2, Upload, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface StoryFormProps {
    id?: string;
}

export default function StoryForm({ id }: StoryFormProps) {
    const router = useRouter();
    const isEditing = !!id;
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        image: '',
        quote: '',
        achievements: [''] as string[],
        shift: '',
        isActive: true,
    });

    useEffect(() => {
        const loadDependencies = async () => {
            try {
                const catsResponse = await axios.get('/success-story-category/admin');
                setCategories(catsResponse.data.filter((c: any) => c.isActive));

                if (isEditing) {
                    const response = await axios.get(`/success-story/${id}`);
                    setFormData({
                        name: response.data.name,
                        categoryId: response.data.categoryId,
                        image: response.data.image || '',
                        quote: response.data.quote,
                        achievements: response.data.achievements?.length > 0 ? response.data.achievements : [''],
                        shift: response.data.shift || '',
                        isActive: response.data.isActive,
                    });
                }
            } catch (error) {
                console.error('Failed to load form data:', error);
                setError('Failed to load required data');
            } finally {
                setInitialLoading(false);
            }
        };

        loadDependencies();
    }, [id]);

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

    const addAchievement = () => {
        setFormData(prev => ({ ...prev, achievements: [...prev.achievements, ''] }));
    };

    const removeAchievement = (index: number) => {
        setFormData(prev => {
            const newAchievements = [...prev.achievements];
            newAchievements.splice(index, 1);
            return { ...prev, achievements: newAchievements };
        });
    };

    const updateAchievement = (index: number, value: string) => {
        setFormData(prev => {
            const newAchievements = [...prev.achievements];
            newAchievements[index] = value;
            return { ...prev, achievements: newAchievements };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Filter out empty achievements
            const cleanedAchievements = formData.achievements.filter(a => a.trim() !== '');
            if (cleanedAchievements.length === 0) {
                setError('At least one valid Key Achievement is required.');
                setLoading(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            const payload = {
                ...formData,
                achievements: cleanedAchievements
            };

            if (isEditing) {
                await axios.put(`/success-story/${id}`, payload);
            } else {
                await axios.post('/success-story', payload);
            }

            router.push('/dashboard/success-stories');
            router.refresh();
        } catch (err) {
            console.error('Failed to save Story:', err);
            setError('Failed to save Story. Please try again.');
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
                                placeholder="e.g., Rohan Mehra"
                            />
                        </div>

                        <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                id="categoryId"
                                required
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                            >
                                <option value="" disabled>Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {categories.length === 0 && (
                                <p className="text-xs text-red-500 mt-1">Please create a category first.</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Image (Must be transparent SVG/PNG or standard photo) *</label>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors border border-gray-300 shadow-sm text-sm font-medium">
                                    <Upload className="w-4 h-4 mr-2" />
                                    {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e)} disabled={isUploadingImage} />
                                </label>
                                {formData.image && (
                                    <div className="h-16 w-16 bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden rounded-md">
                                        {formData.image.startsWith('http') ? (
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}${formData.image}`} alt="Preview" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-2">
                                Main Quote *
                            </label>
                            <textarea
                                id="quote"
                                required
                                rows={2}
                                value={formData.quote}
                                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors resize-y"
                                placeholder="e.g., Lost 12 kg without starving myself."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-2">
                                The Healthstur Shift *
                            </label>
                            <textarea
                                id="shift"
                                required
                                rows={2}
                                value={formData.shift}
                                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors resize-y"
                                placeholder="e.g., Replaced late-night snacking with protein-rich dinners."
                            />
                        </div>

                        <div className="md:col-span-2 space-y-3">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                                <label className="block text-sm font-medium text-gray-700">
                                    Key Achievements *
                                </label>
                                <button
                                    type="button"
                                    onClick={addAchievement}
                                    className="flex items-center text-sm text-[#023051] hover:text-[#023051]/80 font-medium shrink-0"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Achievement
                                </button>
                            </div>

                            <div className="space-y-3">
                                {formData.achievements.map((achievement, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={achievement}
                                            onChange={(e) => updateAchievement(index, e.target.value)}
                                            required={index === 0 && formData.achievements.length === 1}
                                            className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                                            placeholder="e.g., -12kg in 4 Months"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeAchievement(index)}
                                            disabled={formData.achievements.length <= 1}
                                            className={`px-3 py-2 border rounded-lg transition-colors shrink-0 ${formData.achievements.length <= 1
                                                    ? 'text-gray-300 border-gray-200 bg-gray-50 cursor-not-allowed'
                                                    : 'text-red-500 hover:bg-red-50 border-transparent hover:border-red-100'
                                                }`}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {formData.achievements.length === 0 && (
                                <p className="text-sm text-gray-500 italic">No achievements added yet.</p>
                            )}
                        </div>
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
                            onClick={() => router.push('/dashboard/success-stories')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || isUploadingImage || formData.categoryId === '' || formData.image === ''}
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
