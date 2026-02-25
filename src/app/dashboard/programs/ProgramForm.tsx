'use client';

import { useState, useEffect } from 'react';
import { Upload, Trash2, Edit2, Plus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

const COMMON_ICONS = [
    'Activity', 'Airplay', 'AlertCircle', 'AlertOctagon', 'AlertTriangle', 'AlignCenter', 'AlignJustify', 'AlignLeft', 'AlignRight',
    'Anchor', 'Aperture', 'Archive', 'ArrowDownCircle', 'ArrowDownLeft', 'ArrowDownRight', 'ArrowDown', 'ArrowLeftCircle', 'ArrowLeft',
    'ArrowRightCircle', 'ArrowRight', 'ArrowUpCircle', 'ArrowUpLeft', 'ArrowUpRight', 'ArrowUp', 'AtSign', 'Award', 'BarChart2',
    'BarChart', 'BatteryCharging', 'Battery', 'BellOff', 'Bell', 'Bluetooth', 'Bold', 'BookOpen', 'Book', 'Bookmark', 'Box', 'Briefcase',
    'Calendar', 'CameraOff', 'Camera', 'Cast', 'CheckCircle', 'CheckSquare', 'Check', 'ChevronDown', 'ChevronLeft', 'ChevronRight',
    'ChevronUp', 'ChevronsDown', 'ChevronsLeft', 'ChevronsRight', 'ChevronsUp', 'Chrome', 'Circle', 'Clipboard', 'Clock', 'CloudDrizzle',
    'CloudLightning', 'CloudOff', 'CloudRain', 'CloudSnow', 'Cloud', 'Code', 'Codepen', 'Codesandbox', 'Coffee', 'Columns', 'Command',
    'Compass', 'Copy', 'CornerDownLeft', 'CornerDownRight', 'CornerLeftDown', 'CornerLeftUp', 'CornerRightDown', 'CornerRightUp',
    'CornerUpLeft', 'CornerUpRight', 'Cpu', 'CreditCard', 'Crop', 'Crosshair', 'Database', 'Delete', 'Disc', 'DivideCircle', 'DivideSquare',
    'Divide', 'DollarSign', 'DownloadCloud', 'Download', 'Dribbble', 'Droplet', 'Edit2', 'Edit3', 'Edit', 'ExternalLink', 'EyeOff', 'Eye',
    'Facebook', 'FastForward', 'Feather', 'Figma', 'FileMinus', 'FilePlus', 'FileText', 'File', 'Film', 'Filter', 'Flag', 'FolderMinus',
    'FolderPlus', 'Folder', 'Framer', 'Frown', 'Gift', 'GitBranch', 'GitCommit', 'GitMerge', 'GitPullRequest', 'Github', 'Gitlab', 'Globe',
    'Grid', 'HardDrive', 'Hash', 'Headphones', 'Heart', 'HelpCircle', 'Hexagon', 'Home', 'Image', 'Inbox', 'Info', 'Instagram', 'Italic',
    'Key', 'Layers', 'Layout', 'LifeBuoy', 'Link2', 'Link', 'Linkedin', 'List', 'Loader', 'Lock', 'LogIn', 'LogOut', 'Mail', 'MapPin',
    'Map', 'Maximize2', 'Maximize', 'Meh', 'Menu', 'MessageCircle', 'MessageSquare', 'MicOff', 'Mic', 'Minimize2', 'Minimize', 'MinusCircle',
    'MinusSquare', 'Minus', 'Monitor', 'Moon', 'MoreHorizontal', 'MoreVertical', 'MousePointer', 'Move', 'Music', 'Navigation2', 'Navigation',
    'Octagon', 'Package', 'Paperclip', 'PauseCircle', 'Pause', 'PenTool', 'Percent', 'PhoneCall', 'PhoneForwarded', 'PhoneIncoming',
    'PhoneMissed', 'PhoneOff', 'PhoneOutgoing', 'Phone', 'PieChart', 'PlayCircle', 'Play', 'PlusCircle', 'PlusSquare', 'Plus', 'Pocket',
    'Power', 'Printer', 'Radio', 'RefreshCcw', 'RefreshCw', 'Repeat', 'Rewind', 'RotateCcw', 'RotateCw', 'Rss', 'Save', 'Scissors', 'Search',
    'Send', 'Server', 'Settings', 'Share2', 'Share', 'ShieldOff', 'Shield', 'ShoppingBag', 'ShoppingCart', 'Shuffle', 'Sidebar', 'SkipBack',
    'SkipForward', 'Slack', 'Slash', 'Sliders', 'Smartphone', 'Smile', 'Speaker', 'Square', 'Star', 'StopCircle', 'Sun', 'Sunrise', 'Sunset',
    'Tablet', 'Tag', 'Target', 'Terminal', 'Thermometer', 'ThumbsDown', 'ThumbsUp', 'ToggleLeft', 'ToggleRight', 'Tool', 'Trash2', 'Trash',
    'Trello', 'TrendingDown', 'TrendingUp', 'Triangle', 'Truck', 'Tv', 'Twitch', 'Twitter', 'Type', 'Umbrella', 'Underline', 'Unlock',
    'UploadCloud', 'Upload', 'UserCheck', 'UserMinus', 'UserPlus', 'UserX', 'User', 'Users', 'VideoOff', 'Video', 'Voicemail', 'Volume1',
    'Volume2', 'VolumeX', 'Volume', 'Watch', 'WifiOff', 'Wifi', 'Wind', 'XCircle', 'XOctagon', 'XSquare', 'X', 'Youtube', 'ZapOff', 'Zap',
    'ZoomIn', 'ZoomOut', 'Apple', 'Dumbbell', 'Salad'
];

interface Solution {
    id: string;
    title: string;
    description: string;
    approach: string;
    benefits: string;
    image: string;
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
}

export default function ProgramForm({ initialData }: { initialData?: Program }) {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingHomeImage, setIsUploadingHomeImage] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'home' | 'program' | 'solutions'>('home');

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
    });

    const [isManualSlug, setIsManualSlug] = useState(!!initialData);

    const safeInitialSolutions = Array.isArray(initialData?.solutions)
        ? initialData.solutions.filter(s => s && typeof s === 'object' && !Array.isArray(s) && s.title)
        : [];

    const [solutionsList, setSolutionsList] = useState<Solution[]>(safeInitialSolutions as Solution[]);
    const [currentSolution, setCurrentSolution] = useState<Solution>({ id: '', title: '', description: '', approach: '', benefits: '', image: '' });
    const [isUploadingSolutionImage, setIsUploadingSolutionImage] = useState(false);
    const [isEditingSolution, setIsEditingSolution] = useState(false);

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
                bullets: formData.bullets,
                subItems: parsedSubItems,
                solutions: solutionsList,
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isHomeImage: boolean = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            if (isHomeImage) setIsUploadingHomeImage(true);
            else setIsUploading(true);

            const data = new FormData();
            data.append('file', file);

            const res = await axios.post('/programs/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (isHomeImage) {
                setFormData(prev => ({ ...prev, homeBackground: res.data.url }));
            } else {
                setFormData(prev => ({ ...prev, background: res.data.url }));
            }

        } catch (error) {
            console.error('Error uploading image', error);
            alert('Error uploading image');
        } finally {
            if (isHomeImage) setIsUploadingHomeImage(false);
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
            alert('Error uploading image');
        } finally {
            setIsUploadingSolutionImage(false);
        }
    };

    const handleAddOrUpdateSolution = () => {
        if (!currentSolution.title) return alert('Title is required');
        if (isEditingSolution && currentSolution.id) {
            setSolutionsList(prev => prev.map(s => s.id === currentSolution.id ? currentSolution : s));
        } else {
            const newSolution = { ...currentSolution, id: Date.now().toString() };
            setSolutionsList(prev => [...prev, newSolution]);
        }
        setCurrentSolution({ id: '', title: '', description: '', approach: '', benefits: '', image: '' });
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
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <p className="text-red-700 text-sm font-medium">{apiError}</p>
                </div>
            )}

            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Title (Name)</label>
                    <input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Used in Navbar & Breadcrumbs</p>
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Navbar Icon</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            {(() => {
                                const Icon = (LucideIcons as any)[formData.icon || 'Activity'] || LucideIcons.Activity;
                                return <Icon className="w-5 h-5" />;
                            })()}
                        </div>
                        <select
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white text-gray-900"
                        >
                            <option value="">Select an Icon</option>
                            {COMMON_ICONS.map((iconName) => (
                                <option key={iconName} value={iconName}>
                                    {iconName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 mt-8 mb-6">
                <button type="button" onClick={() => setActiveTab('home')} className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors duration-200 ${activeTab === 'home' ? 'border-[#023051] text-[#023051]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Home Page Hero</button>
                <button type="button" onClick={() => setActiveTab('program')} className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors duration-200 ${activeTab === 'program' ? 'border-[#023051] text-[#023051]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Program Page Hero</button>
                <button type="button" onClick={() => setActiveTab('solutions')} className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors duration-200 ${activeTab === 'solutions' ? 'border-[#023051] text-[#023051]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Program Solutions</button>
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
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true)} disabled={isUploadingHomeImage} />
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
                                <div key={index} className="flex gap-2">
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
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, false)} disabled={isUploading} />
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {solutionsList.map((sol) => (
                                    <div key={sol.id} className="bg-white border border-gray-200 p-4 rounded-lg flex gap-4">
                                        {sol.image && (
                                            <div className="w-16 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden shadow-sm">
                                                <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}${sol.image}`} className="w-full h-full object-cover" alt="" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 truncate">{sol.title}</h4>
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

            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button
                    type="button"
                    onClick={() => router.push('/dashboard/programs')}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2.5 text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm font-medium"
                >
                    {initialData?.id ? 'Save Changes' : 'Create Program'}
                </button>
            </div>
        </form>
    );
}
