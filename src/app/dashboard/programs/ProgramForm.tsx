'use client';

import { useState, useEffect } from 'react';
import { Upload, Trash2, Edit2, Plus, AlertCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { DynamicIcon } from '@/components/DynamicIcon';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { COMMON_ICONS } from '@/lib/constants';



interface Solution {
    id: string;
    title: string;
    description: string;
    approach: string;
    benefits: string;
    image: string;
    isActive?: boolean;
}

interface Program {
    id?: string;
    name: string;
    icon?: string;
    href: string;
    heading: string;
    subtext: string;
    background?: string;
    homeHeading?: string;
    homeSubtext?: string;
    homeBackground?: string;
    solutionsHeading?: string;
    solutionsSubtext?: string;
    bullets: any;
    subItems: any;
    solutions?: Solution[];
    isActive?: boolean;
    iconColor?: string;

    // Curated Track Fields
    isCurated?: boolean;
    curatedTitle?: string;
    curatedDescription?: string;
    curatedImage?: string;
    curatedIcon?: string;
    curatedIconWidth?: number;
    curatedIconHeight?: number;
    curatedLinkText?: string;
}

export default function ProgramForm({ initialData }: { initialData?: Program }) {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingHomeImage, setIsUploadingHomeImage] = useState(false);
    const [isUploadingCuratedImage, setIsUploadingCuratedImage] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'home' | 'program' | 'solutions' | 'curated'>('home');

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        icon: initialData?.icon || '',
        href: initialData?.href?.replace(/^\/programs\//, '') || '',
        heading: initialData?.heading || '',
        subtext: initialData?.subtext || '',
        background: initialData?.background || '',
        homeHeading: initialData?.homeHeading || '',
        homeSubtext: initialData?.homeSubtext || '',
        homeBackground: initialData?.homeBackground || '',
        solutionsHeading: initialData?.solutionsHeading || '',
        solutionsSubtext: initialData?.solutionsSubtext || '',
        bullets: Array.isArray(initialData?.bullets) && initialData.bullets.length > 0 ? initialData.bullets : [''],
        subItems: initialData?.subItems ? JSON.stringify(initialData.subItems, null, 2) : '[]',
        isActive: initialData?.isActive ?? true,
        iconColor: initialData?.iconColor || '#023051',

        // Curated Track Fields
        isCurated: initialData?.isCurated || false,
        curatedTitle: initialData?.curatedTitle || '',
        curatedDescription: initialData?.curatedDescription || '',
        curatedImage: initialData?.curatedImage || '',
        curatedIcon: initialData?.curatedIcon || '',
        curatedIconWidth: initialData?.curatedIconWidth || 30,
        curatedIconHeight: initialData?.curatedIconHeight || 30,
        curatedLinkText: initialData?.curatedLinkText || 'Start Transformation',
    });

    const [isManualSlug, setIsManualSlug] = useState(!!initialData);

    const safeInitialSolutions = Array.isArray(initialData?.solutions)
        ? initialData.solutions.filter(s => s && typeof s === 'object' && !Array.isArray(s) && s.title)
        : [];

    const [solutionsList, setSolutionsList] = useState<Solution[]>(safeInitialSolutions as Solution[]);
    const [currentSolution, setCurrentSolution] = useState<Solution>({ id: '', title: '', description: '', approach: '', benefits: '', image: '', isActive: true });
    const [isUploadingSolutionImage, setIsUploadingSolutionImage] = useState(false);
    const [isEditingSolution, setIsEditingSolution] = useState(false);

    const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
    const [isCuratedIconDropdownOpen, setIsCuratedIconDropdownOpen] = useState(false);
    const [iconSearchQuery, setIconSearchQuery] = useState('');
    const [draggedBulletIndex, setDraggedBulletIndex] = useState<number | null>(null);
    const [draggedSolutionIndex, setDraggedSolutionIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!isManualSlug && formData.name) {
            const slug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');

            setFormData(prev => ({ ...prev, href: slug }));
        }
    }, [formData.name, isManualSlug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(null);

        // Validation
        if (!formData.name.trim()) return setApiError('Program Title is required.');
        if (!formData.href.trim()) return setApiError('URL Slug is required.');
        if (!formData.icon) return setApiError('Navbar Icon is required.');

        // Home Page Hero Validation
        if (!formData.homeHeading.trim()) return setApiError('Home Hero Heading is required.');
        if (!formData.homeSubtext.trim()) return setApiError('Home Hero Subtext is required.');
        if (!formData.homeBackground) return setApiError('Home Hero Background Image is required. Please upload an image.');

        // Bullets Validation
        const validBullets = formData.bullets.filter((b: string) => b.trim() !== '');
        if (validBullets.length === 0) return setApiError('At least one valid Benefit Bullet is required.');

        // Program Page Hero Validation
        if (!formData.heading.trim()) return setApiError('Program Hero Heading is required.');
        if (!formData.subtext.trim()) return setApiError('Program Hero Subtext is required.');
        if (!formData.background) return setApiError('Program Hero Background Image is required. Please upload an image.');

        // Solutions Validation
        if (!formData.solutionsHeading.trim()) return setApiError('Solutions Section Title is required.');
        if (!formData.solutionsSubtext.trim()) return setApiError('Solutions Section Subtext is required.');
        if (solutionsList.length === 0) return setApiError('At least one Program Solution is required. Please add a solution in the Program Solutions tab.');

        try {
            let parsedSubItems = [];
            try { parsedSubItems = JSON.parse(formData.subItems); } catch { /* ignore */ }

            // Ensure the backend reliably receives the /programs/ prefix
            const finalHref = formData.href.startsWith('/') ? formData.href : `/programs/${formData.href.replace(/^\//, '')}`;

            const payload = {
                name: formData.name,
                icon: formData.icon,
                href: finalHref,
                heading: formData.heading,
                subtext: formData.subtext,
                background: formData.background,
                homeHeading: formData.homeHeading,
                homeSubtext: formData.homeSubtext,
                homeBackground: formData.homeBackground,
                solutionsHeading: formData.solutionsHeading,
                solutionsSubtext: formData.solutionsSubtext,
                bullets: validBullets,
                subItems: parsedSubItems,
                solutions: solutionsList,
                isActive: formData.isActive,
                iconColor: formData.iconColor,

                // Curated Track Fields
                isCurated: formData.isCurated,
                curatedTitle: formData.curatedTitle,
                curatedDescription: formData.curatedDescription,
                curatedImage: formData.curatedImage,
                curatedIcon: formData.curatedIcon,
                curatedIconWidth: Number(formData.curatedIconWidth),
                curatedIconHeight: Number(formData.curatedIconHeight),
                curatedLinkText: formData.curatedLinkText,
            };

            if (initialData?.id) {
                await axios.put(`/programs/${initialData.id}`, payload);
            } else {
                await axios.post('/programs', payload);
            }

            router.push('/dashboard/programs');
            router.refresh();
        } catch (error: any) {
            console.error('Failed to save program:', error);
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageType: 'home' | 'program' | 'curated' = 'program') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            if (imageType === 'curated') setIsUploadingCuratedImage(true);
            else if (imageType === 'home') setIsUploadingHomeImage(true);
            else setIsUploading(true);

            const data = new FormData();
            data.append('file', file);

            const res = await axios.post('/programs/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (imageType === 'curated') {
                setFormData(prev => ({ ...prev, curatedImage: res.data.url }));
            } else if (imageType === 'home') {
                setFormData(prev => ({ ...prev, homeBackground: res.data.url }));
            } else {
                setFormData(prev => ({ ...prev, background: res.data.url }));
            }

        } catch (error) {
            console.error('Error uploading image', error);
            setApiError('Error uploading image');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            if (imageType === 'curated') setIsUploadingCuratedImage(false);
            else if (imageType === 'home') setIsUploadingHomeImage(false);
            else setIsUploading(false);
        }
    };

    const handleSolutionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // ... (kept mostly the same logic for brevity)
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploadingSolutionImage(true);
            const data = new FormData();
            data.append('file', file);
            const res = await axios.post('/programs/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCurrentSolution(prev => ({ ...prev, image: res.data.url }));
        } catch (error) {
            setApiError('Error uploading image');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsUploadingSolutionImage(false);
        }
    };

    const handleAddOrUpdateSolution = () => {
        setApiError(null);
        if (!currentSolution.title.trim()) { setApiError('Title is required'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
        if (!currentSolution.description.trim()) { setApiError('Description is required'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
        if (!currentSolution.approach.trim()) { setApiError('Approach is required'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
        if (!currentSolution.benefits.trim()) { setApiError('Benefits is required'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
        if (!currentSolution.image) { setApiError('Solution Image is required'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

        if (isEditingSolution && currentSolution.id) {
            setSolutionsList(prev => prev.map(s => s.id === currentSolution.id ? currentSolution : s));
        } else {
            const newSolution = { ...currentSolution, id: Date.now().toString() };
            setSolutionsList(prev => [...prev, newSolution]);
        }
        setCurrentSolution({ id: '', title: '', description: '', approach: '', benefits: '', image: '', isActive: true });
        setIsEditingSolution(false);
    };

    const handleEditSolution = (solution: Solution) => {
        setCurrentSolution(solution);
        setIsEditingSolution(true);
    };

    const handleDeleteSolution = (id: string) => {
        setSolutionsList(prev => prev.filter(s => s.id !== id));
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">

            {apiError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start shadow-sm">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                        <h3 className="text-sm font-semibold text-red-800">Action Required</h3>
                        <p className="text-sm text-red-600 mt-1">{apiError}</p>
                    </div>
                </div>
            )}

            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Title (Name)</label>
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
                        <input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="flex-1 min-w-[120px] w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
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
                    <p className="text-xs text-gray-500 mt-1">Used in Navbar & Breadcrumbs. Uncheck to hide this program.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                    <input
                        required
                        value={formData.href}
                        onChange={(e) => {
                            setIsManualSlug(true);
                            setFormData({ ...formData, href: e.target.value });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-generates from title unless edited.</p>
                </div>
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Navbar Icon</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hover Color</label>
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                        <input
                            type="color"
                            value={formData.iconColor}
                            onChange={(e) => setFormData({ ...formData, iconColor: e.target.value })}
                            className="h-10 w-10 p-0 border border-gray-300 rounded-lg cursor-pointer bg-white overflow-hidden shrink-0"
                            style={{ padding: '2px' }}
                        />
                        <input
                            type="text"
                            value={formData.iconColor}
                            onChange={(e) => setFormData({ ...formData, iconColor: e.target.value })}
                            className="w-full min-w-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white font-mono text-sm uppercase"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Navbar icon hover colour.</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 mt-8 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0">
                <button type="button" onClick={() => setActiveTab('home')} className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors duration-200 outline-none ${activeTab === 'home' ? 'border-[#023051] text-[#023051]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Home Page Hero</button>
                <button type="button" onClick={() => setActiveTab('program')} className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors duration-200 outline-none ${activeTab === 'program' ? 'border-[#023051] text-[#023051]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Program Page Hero</button>
                <button type="button" onClick={() => setActiveTab('solutions')} className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors duration-200 outline-none ${activeTab === 'solutions' ? 'border-[#023051] text-[#023051]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Program Solutions</button>
                <button type="button" onClick={() => setActiveTab('curated')} className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors duration-200 outline-none ${activeTab === 'curated' ? 'border-[#023051] text-[#023051]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Curated Track</button>
            </div>

            {/* TAB CONTENT: HOME HERO */}
            {activeTab === 'home' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Home Hero Heading</label>
                        <input value={formData.homeHeading} onChange={(e) => setFormData({ ...formData, homeHeading: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white" placeholder="e.g. Health-Specific Programs" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Home Hero Subtext</label>
                        <textarea rows={3} value={formData.homeSubtext} onChange={(e) => setFormData({ ...formData, homeSubtext: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white" placeholder="Description shown on the sliding home page hero" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Home Hero Background Image</label>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors border border-gray-300 shadow-sm text-sm font-medium">
                                <Upload className="w-4 h-4 mr-2" />
                                {isUploadingHomeImage ? 'Uploading...' : 'Upload Home Image'}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'home')} disabled={isUploadingHomeImage} />
                            </label>
                            {formData.homeBackground && (
                                <div className="w-16 h-12 rounded overflow-hidden border border-gray-300 shadow-sm">
                                    <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}${formData.homeBackground}`} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Benefits Bullets</label>
                        <div className="space-y-3">
                            {formData.bullets.map((bullet: string, index: number) => (
                                <div
                                    key={index}
                                    className={`flex gap-2 items-center p-1 rounded-lg transition-colors border border-transparent ${draggedBulletIndex === index ? 'opacity-50 bg-gray-50 border-gray-200 border-dashed' : 'hover:bg-gray-50'}`}
                                    draggable
                                    onDragStart={(e) => {
                                        setDraggedBulletIndex(index);
                                        e.dataTransfer.effectAllowed = "move";
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = "move";
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        if (draggedBulletIndex === null || draggedBulletIndex === index) return;
                                        const newBullets = [...formData.bullets];
                                        const draggedItem = newBullets[draggedBulletIndex];
                                        newBullets.splice(draggedBulletIndex, 1);
                                        newBullets.splice(index, 0, draggedItem);
                                        setFormData({ ...formData, bullets: newBullets });
                                        setDraggedBulletIndex(null);
                                    }}
                                    onDragEnd={() => setDraggedBulletIndex(null)}
                                >
                                    <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 px-1 py-2 flex items-center justify-center">
                                        <LucideIcons.GripVertical className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={bullet}
                                        onChange={(e) => {
                                            const newBullets = [...formData.bullets];
                                            newBullets[index] = e.target.value;
                                            setFormData({ ...formData, bullets: newBullets });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white shadow-sm"
                                        placeholder={`Bullet ${index + 1}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (formData.bullets.length <= 1) return;
                                            const newBullets = formData.bullets.filter((_: any, i: number) => i !== index);
                                            setFormData({ ...formData, bullets: newBullets });
                                        }}
                                        disabled={formData.bullets.length <= 1}
                                        className={`px-3 py-2 rounded-lg transition-colors border shadow-sm ${formData.bullets.length <= 1
                                            ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
                                            : 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                                            }`}
                                        title={formData.bullets.length <= 1 ? "Minimum one bullet required" : "Remove Bullet"}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, bullets: [...formData.bullets, ''] })}
                                className="mt-3 px-4 py-2 border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 text-gray-600 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 w-full"
                            >
                                <Plus className="w-4 h-4" /> Add Another Bullet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: PROGRAM HERO */}
            {activeTab === 'program' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Program Hero Heading</label>
                        <input required value={formData.heading} onChange={(e) => setFormData({ ...formData, heading: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white" />
                        <p className="text-xs text-gray-500 mt-1">Fallback for Home Page if Home Hero fields are left blank.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Program Hero Subtext</label>
                        <textarea required rows={3} value={formData.subtext} onChange={(e) => setFormData({ ...formData, subtext: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Program Hero Background Image</label>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors border border-gray-300 shadow-sm text-sm font-medium">
                                <Upload className="w-4 h-4 mr-2" />
                                {isUploading ? 'Uploading...' : 'Upload Image'}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'program')} disabled={isUploading} />
                            </label>
                            {formData.background && (
                                <div className="w-16 h-12 rounded overflow-hidden border border-gray-300 shadow-sm">
                                    <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}${formData.background}`} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: SOLUTIONS */}
            {activeTab === 'solutions' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Program Solutions</h3>
                            <p className="text-sm text-gray-500">Add detailed solutions that belong to this program.</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                        <div className="w-full">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Program Solutions Header</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Solutions Section Title</label>
                                    <input value={formData.solutionsHeading} onChange={(e) => setFormData({ ...formData, solutionsHeading: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white" placeholder="e.g. Complete Nutrition & Diet Solutions" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Solutions Section Subtext</label>
                                    <textarea rows={2} value={formData.solutionsSubtext} onChange={(e) => setFormData({ ...formData, solutionsSubtext: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white" placeholder="e.g. Simple, safe, and sustainable plans..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-inner space-y-4">
                        <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            {isEditingSolution ? 'Edit Solution' : 'Add New Solution'}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input value={currentSolution.title} onChange={e => setCurrentSolution(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white" placeholder="e.g. Weight Loss" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea rows={3} value={currentSolution.description} onChange={e => setCurrentSolution(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Approach (Healthstur's Approach)</label>
                                    <textarea rows={2} value={currentSolution.approach} onChange={e => setCurrentSolution(p => ({ ...p, approach: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Benefits (Results)</label>
                                    <textarea rows={2} value={currentSolution.benefits} onChange={e => setCurrentSolution(p => ({ ...p, benefits: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Solution Image</label>
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center justify-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg cursor-pointer transition-colors border border-gray-300 text-sm">
                                                <Upload className="w-4 h-4 mr-2" />
                                                {isUploadingSolutionImage ? 'Uploading...' : 'Upload Image'}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleSolutionImageUpload} disabled={isUploadingSolutionImage} />
                                            </label>
                                            {currentSolution.image && (
                                                <div className="w-12 h-16 rounded overflow-hidden border border-gray-200">
                                                    <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}${currentSolution.image}`} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <label className="inline-flex items-center gap-2 cursor-pointer select-none py-2 border border-gray-200 px-3 rounded-lg bg-white h-10 w-full">
                                            <span className="text-sm font-medium text-gray-700">Active</span>
                                            <div className="relative mt-0.5">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={currentSolution.isActive ?? true}
                                                    onChange={(e) => setCurrentSolution(p => ({ ...p, isActive: e.target.checked }))}
                                                />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={handleAddOrUpdateSolution}
                                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition font-medium"
                            >
                                {isEditingSolution ? 'Update Solution Item' : 'Add Solution Item'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-800">Current Solutions ({solutionsList.length})</h3>
                        {solutionsList.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No solutions added yet. Use the form above to add.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {solutionsList.map((sol, index) => (
                                    <div
                                        key={sol.id}
                                        className={`bg-white border p-4 rounded-lg flex gap-4 transition-colors ${draggedSolutionIndex === index ? 'opacity-50 border-gray-400 border-dashed bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        draggable
                                        onDragStart={(e) => {
                                            setDraggedSolutionIndex(index);
                                            e.dataTransfer.effectAllowed = "move";
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = "move";
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (draggedSolutionIndex === null || draggedSolutionIndex === index) return;
                                            const newSolutions = [...solutionsList];
                                            const draggedItem = newSolutions[draggedSolutionIndex];
                                            newSolutions.splice(draggedSolutionIndex, 1);
                                            newSolutions.splice(index, 0, draggedItem);
                                            setSolutionsList(newSolutions);
                                            setDraggedSolutionIndex(null);
                                        }}
                                        onDragEnd={() => setDraggedSolutionIndex(null)}
                                    >
                                        <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex items-center justify-center -ml-2">
                                            <LucideIcons.GripVertical className="w-5 h-5" />
                                        </div>
                                        {sol.image && (
                                            <div className="w-16 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden shadow-sm">
                                                <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}${sol.image}`} className="w-full h-full object-cover" alt="" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-gray-900 truncate">{sol.title}</h4>
                                                {(sol.isActive ?? true) ? (
                                                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Inactive</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">{sol.description}</p>
                                            <div className="flex items-center gap-4 mt-3">
                                                <button type="button" onClick={() => handleEditSolution(sol)} className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                    <Edit2 className="w-3 h-3" /> Edit
                                                </button>
                                                <button type="button" onClick={() => handleDeleteSolution(sol.id)} className="text-xs font-medium text-red-600 hover:text-red-800 flex items-center gap-1">
                                                    <Trash2 className="w-3 h-3" /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: CURATED TRACK */}
            {activeTab === 'curated' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Curated Track Settings</h3>
                            <p className="text-sm text-gray-500">Feature this program on the Home Page under "Our Curated Tracks".</p>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer select-none shrink-0 py-2 border border-gray-200 px-3 rounded-lg bg-gray-50 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-start">
                            <span className="text-sm font-medium text-gray-700">Enable as Curated Track</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.isCurated}
                                    onChange={(e) => setFormData({ ...formData, isCurated: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </div>
                        </label>
                    </div>

                    {formData.isCurated && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-inner">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input required={formData.isCurated} value={formData.curatedTitle} onChange={(e) => setFormData({ ...formData, curatedTitle: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white" placeholder="e.g. Total Transformation" />
                                <p className="text-xs text-gray-500 mt-1">Title to display on the Curated Track card.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
                                <input required={formData.isCurated} value={formData.curatedLinkText} onChange={(e) => setFormData({ ...formData, curatedLinkText: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white" placeholder="e.g. Start Transformation" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea required={formData.isCurated} rows={3} value={formData.curatedDescription} onChange={(e) => setFormData({ ...formData, curatedDescription: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white" placeholder="Brief description for the track." />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Background Image (Vertical format recommended)</label>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center justify-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg cursor-pointer transition-colors border border-gray-300 shadow-sm text-sm font-medium w-fit">
                                        <Upload className="w-4 h-4 mr-2" />
                                        {isUploadingCuratedImage ? 'Uploading...' : 'Upload Image'}
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'curated')} disabled={isUploadingCuratedImage} />
                                    </label>
                                    {formData.curatedImage && (
                                        <div className="w-16 h-20 rounded overflow-hidden border border-gray-300 shadow-sm flex-shrink-0">
                                            <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}${formData.curatedImage}`} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Icon</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsCuratedIconDropdownOpen(!isCuratedIconDropdownOpen)}
                                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-gray-900 text-left flex items-center justify-between"
                                    >
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                            <DynamicIcon name={formData.curatedIcon || 'Activity'} className="w-5 h-5" />
                                        </div>
                                        <span className="block truncate">{formData.curatedIcon || 'Select an Icon'}</span>
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                            <LucideIcons.ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                        </span>
                                    </button>

                                    {isCuratedIconDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsCuratedIconDropdownOpen(false)}></div>
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
                                                        className={`cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 ${!formData.curatedIcon ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}`}
                                                        onClick={() => {
                                                            setFormData({ ...formData, curatedIcon: '' });
                                                            setIsCuratedIconDropdownOpen(false);
                                                            setIconSearchQuery('');
                                                        }}
                                                    >
                                                        <div className="flex items-center">
                                                            <span className="ml-3 block truncate font-normal">Select an Icon (Clear)</span>
                                                        </div>
                                                    </li>
                                                    {COMMON_ICONS.filter(icon => icon.toLowerCase().includes(iconSearchQuery.toLowerCase())).map((iconName) => {
                                                        const isSelected = formData.curatedIcon === iconName;
                                                        return (
                                                            <li
                                                                key={iconName}
                                                                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}`}
                                                                onClick={() => {
                                                                    setFormData({ ...formData, curatedIcon: iconName });
                                                                    setIsCuratedIconDropdownOpen(false);
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon Width (px)</label>
                                    <input type="number" required={formData.isCurated} value={formData.curatedIconWidth} onChange={(e) => setFormData({ ...formData, curatedIconWidth: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white" min={10} max={100} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon Height (px)</label>
                                    <input type="number" required={formData.isCurated} value={formData.curatedIconHeight} onChange={(e) => setFormData({ ...formData, curatedIconHeight: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white" min={10} max={100} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="pt-6 border-t border-gray-100 mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                    type="button"
                    onClick={() => router.push('/dashboard/programs')}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium w-full sm:w-auto flex items-center justify-center shrink-0"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2.5 text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm font-medium w-full sm:w-auto flex items-center justify-center shrink-0 whitespace-nowrap"
                >
                    {initialData?.id ? 'Save Changes' : 'Create Program'}
                </button>
            </div>
        </form>
    );
}
