'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import axios from '@/lib/axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
}

export default function ProgramsPage() {
    const router = useRouter();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(true);



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






    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this program?')) {
            try {
                await axios.delete(`/programs/${id}`);
                fetchPrograms();
            } catch (error) {
                console.error('Failed to delete program:', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Programs</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage programs for Hero and Navbar</p>
                </div>
                <Link
                    href="/dashboard/programs/create"
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
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
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Name</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Heading</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Href</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {programs.map((program) => (
                                    <tr key={program.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{program.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{program.heading}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{program.href.replace(/^\/programs\//, '')}</td>
                                        <td className="px-6 py-4 text-sm text-right space-x-3">

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


        </div>
    );
}
