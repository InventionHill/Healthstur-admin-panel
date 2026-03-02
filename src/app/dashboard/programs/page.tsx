'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import axios from '@/lib/axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ConfirmDialog';

export const COMMON_ICONS = [
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
    'ZoomIn', 'ZoomOut', 'Apple', 'Dumbbell', 'Salad', 'Activity'
];

interface Program {
    id: string;
    name: string;
    icon?: string;
    href: string;
    heading: string;
    subtext: string;
    background?: string;
    bullets: any;
    subItems: any;
    isActive?: boolean;
}

export default function ProgramsPage() {
    const router = useRouter();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);



    const fetchPrograms = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get('/programs');
            setPrograms(res.data);
        } catch (error) {
            console.error('Failed to fetch programs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, []);






    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await axios.delete(`/programs/${itemToDelete}`);
            fetchPrograms();
        } catch (error) {
            console.error('Failed to delete program:', error);
        } finally {
            setItemToDelete(null);
        }
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
    };

    const handleToggleActive = async (program: Program) => {
        try {
            const newStatus = !(program.isActive ?? true);
            // Optimistically update the UI
            setPrograms(current => current.map(p => p.id === program.id ? { ...p, isActive: newStatus } : p));
            // Send to backend
            await axios.put(`/programs/${program.id}`, { ...program, isActive: newStatus });
        } catch (error) {
            console.error('Failed to toggle program status:', error);
            fetchPrograms(); // Revert on failure
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedItemId(id);
        // Required for Firefox
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
        // Make the dragged ghost look semi-transparent
        setTimeout(() => {
            if (e.target instanceof HTMLElement) {
                e.target.style.opacity = '0.5';
            }
        }, 0);
    };

    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
        if (id !== dragOverItemId) {
            setDragOverItemId(id);
        }
    };

    const handleDragLeave = () => {
        setDragOverItemId(null);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedItemId(null);
        setDragOverItemId(null);
        if (e.target instanceof HTMLElement) {
            e.target.style.opacity = '1';
        }
    };

    const handleDrop = async (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        setDragOverItemId(null);

        if (!draggedItemId || draggedItemId === targetId) return;

        const draggedIndex = programs.findIndex(p => p.id === draggedItemId);
        const targetIndex = programs.findIndex(p => p.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        // Reorder array locally
        const newPrograms = [...programs];
        const [removedItem] = newPrograms.splice(draggedIndex, 1);
        newPrograms.splice(targetIndex, 0, removedItem);

        // Optimistically update state
        setPrograms(newPrograms);
        setIsSavingOrder(true);

        try {
            // Build payload of { id, order } for the backend
            const payload = newPrograms.map((p, index) => ({
                id: p.id,
                order: index
            }));

            await axios.put('/programs/reorder', payload);
        } catch (error) {
            console.error('Failed to save new order:', error);
            alert('Failed to save the new order. Refreshing.');
            fetchPrograms(); // Revert on failure
        } finally {
            setIsSavingOrder(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Programs</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage programs for Hero and Navbar</p>
                </div>
                <Link
                    href="/dashboard/programs/create"
                    className="flex items-center justify-center w-full sm:w-auto gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors shadow-sm shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Add Program
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading programs...</div>
                ) : programs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No programs found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 w-10"></th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">Name</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">Heading</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">Href</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right sticky right-0 z-10 bg-gray-50 shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y divide-gray-100 ${isSavingOrder ? 'opacity-50 pointer-events-none' : ''}`}>
                                {programs.map((program) => (
                                    <tr
                                        key={program.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, program.id)}
                                        onDragOver={(e) => handleDragOver(e, program.id)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, program.id)}
                                        onDragEnd={handleDragEnd}
                                        className={`transition-colors group ${dragOverItemId === program.id ? 'bg-blue-50 border-t-2 border-t-blue-500' : 'hover:bg-gray-50/50 bg-white'}`}
                                    >
                                        <td className="px-6 py-4 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors">
                                            <GripVertical className="w-5 h-5" />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 select-none">{program.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.heading}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <label className="inline-flex items-center cursor-pointer group">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={program.isActive ?? true}
                                                        onChange={() => handleToggleActive(program)}
                                                    />
                                                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 transition-colors shadow-sm"></div>
                                                </div>
                                                <span className={`ml-3 text-sm font-medium transition-colors ${program.isActive ?? true ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                    {(program.isActive ?? true) ? 'Active' : 'Inactive'}
                                                </span>
                                            </label>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.href.replace(/^\/programs\//, '')}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right space-x-3 sticky right-0 z-10 transition-colors shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)] ${dragOverItemId === program.id ? 'bg-blue-50' : 'bg-white group-hover:bg-gray-50'}`}>

                                            <Link
                                                href={`/dashboard/programs/${program.id}/edit`}
                                                className="text-blue-600 hover:text-blue-800 transition-colors inline-block"
                                            >
                                                <Edit2 className="w-4 h-4 inline" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(program.id)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Program"
                message="Are you sure you want to delete this program? This action cannot be undone."
                confirmText="Delete"
            />
        </div>
    );
}
