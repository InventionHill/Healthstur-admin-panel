'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { DynamicIcon } from '@/components/DynamicIcon';
import { COMMON_ICONS } from '@/lib/constants';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

export interface CuratedTrack {
    id?: string;
    title: string;
    description: string;
    image?: string;
    icon?: string;
    iconWidth?: number;
    iconHeight?: number;
    linkText: string;
    isActive?: boolean;
}

export default function CuratedTrackForm({ initialData }: { initialData?: CuratedTrack }) {
    const router = useRouter();
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
    const [iconSearchQuery, setIconSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        image: initialData?.image || '',
        icon: initialData?.icon || '',
        iconWidth: initialData?.iconWidth || 30,
        iconHeight: initialData?.iconHeight || 30,
        linkText: initialData?.linkText || '',
        isActive: initialData?.isActive ?? true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(null);

        if (!formData.title.trim()) return setApiError('Title is required.');
        if (!formData.description.trim()) return setApiError('Description is required.');
        if (!formData.image) return setApiError('Background Image is required.');
        if (!formData.icon) return setApiError('Icon is required.');
        if (!formData.linkText.trim()) return setApiError('Link Text is required.');

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                image: formData.image,
                icon: formData.icon,
                iconWidth: Number(formData.iconWidth),
                iconHeight: Number(formData.iconHeight),
                linkText: formData.linkText,
                isActive: formData.isActive,
            };

            if (initialData?.id) {
                await axios.put(`/curated-tracks/${initialData.id}`, payload);
            } else {
                await axios.post('/curated-tracks', payload);
            }

            router.push('/dashboard/curated-tracks');
            router.refresh();
        } catch (error: any) {
            console.error('Failed to save track:', error);
            if (error.response?.data?.message) {
                const msgs = Array.isArray(error.response.data.message)
                    ? error.response.data.message.join(', ')
                    : error.response.data.message;
                setApiError(`Validation Error: ${msgs}`);
            } else {
                setApiError('An unknown error occurred while saving.');
            }
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploadingImage(true);

            const data = new FormData();
            data.append('file', file);

            const res = await axios.post('/curated-tracks/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFormData(prev => ({ ...prev, image: res.data.url }));
        } catch (error) {
            console.error('Error uploading file', error);
            alert('Error uploading file');
        } finally {
            setIsUploadingImage(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            {apiError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <p className="text-red-700 text-sm font-medium">{apiError}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Track Title</label>
                    <div className="flex items-center gap-4">
                        <input
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
                        />
                        <label className="flex items-center gap-2 cursor-pointer select-none shrink-0 py-2 border border-gray-200 px-3 rounded-lg bg-gray-50">
                            <span className="text-sm font-medium text-gray-700">Active</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </div>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Text (Footer of Card)</label>
                    <input
                        required
                        value={formData.linkText}
                        onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
                        placeholder="e.g. About Yoga & Meditation"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        required
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Image</label>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors border border-gray-300 shadow-sm text-sm font-medium">
                            <Upload className="w-4 h-4 mr-2" />
                            {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                            <input type="file" className="hidden" accept="image/*, image/svg+xml" onChange={(e) => handleFileUpload(e)} disabled={isUploadingImage} />
                        </label>
                        {formData.image && (
                            <div className="w-16 h-12 rounded bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                                <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}${formData.image}`} alt="Preview" className="max-w-full max-h-full object-contain" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Top Icon</label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-gray-900 text-left flex items-center justify-between"
                        >
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <DynamicIcon name={formData.icon || 'Activity'} className="w-5 h-5" />
                            </div>
                            <span className="block truncate">{formData.icon || 'Select an Icon'}</span>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <LucideIcons.ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                            </span>
                        </button>

                        {isIconDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsIconDropdownOpen(false)}></div>
                                <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                    <div className="px-2 pb-2 sticky top-0 bg-white z-30">
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-900 bg-white placeholder-gray-400"
                                            placeholder="Search icons..."
                                            value={iconSearchQuery}
                                            onChange={(e) => setIconSearchQuery(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                        />
                                    </div>
                                    <ul className="relative z-20">
                                        <li
                                            className={`cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 ${!formData.icon ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}`}
                                            onClick={() => {
                                                setFormData({ ...formData, icon: '' });
                                                setIsIconDropdownOpen(false);
                                                setIconSearchQuery('');
                                            }}
                                        >
                                            <div className="flex items-center">
                                                <span className="ml-3 block truncate font-normal">Select an Icon (Clear)</span>
                                            </div>
                                        </li>
                                        {COMMON_ICONS.filter(icon => icon.toLowerCase().includes(iconSearchQuery.toLowerCase())).map((iconName) => {
                                            const isSelected = formData.icon === iconName;
                                            return (
                                                <li
                                                    key={iconName}
                                                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}`}
                                                    onClick={() => {
                                                        setFormData({ ...formData, icon: iconName });
                                                        setIsIconDropdownOpen(false);
                                                        setIconSearchQuery('');
                                                    }}
                                                >
                                                    <div className="flex items-center">
                                                        <DynamicIcon name={iconName} className="w-5 h-5 text-gray-500" />
                                                        <span className={`ml-3 block truncate ${isSelected ? 'font-semibold' : 'font-normal'}`}>
                                                            {iconName}
                                                        </span>
                                                    </div>
                                                    {isSelected && (
                                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                                            <LucideIcons.Check className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    )}
                                                </li>
                                            );
                                        })}
                                        {COMMON_ICONS.filter(icon => icon.toLowerCase().includes(iconSearchQuery.toLowerCase())).length === 0 && (
                                            <li className="text-gray-500 text-sm text-center py-4">No icons found.</li>
                                        )}
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon Width (px)</label>
                    <input
                        type="number"
                        min="10"
                        max="100"
                        value={formData.iconWidth}
                        onChange={(e) => setFormData({ ...formData, iconWidth: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon Height (px)</label>
                    <input
                        type="number"
                        min="10"
                        max="100"
                        value={formData.iconHeight}
                        onChange={(e) => setFormData({ ...formData, iconHeight: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
                    />
                </div>
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button
                    type="button"
                    onClick={() => router.push('/dashboard/curated-tracks')}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2.5 text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm font-medium"
                >
                    {initialData?.id ? 'Save Changes' : 'Create Track'}
                </button>
            </div>
        </form>
    );
}
