'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, LayoutDashboard, Users, UserCog, CalendarDays, Wallet, Settings, Menu, X, LogOut, CheckSquare, Bell, FileQuestion, Map, Layers, Star, BookOpen, Activity, ChevronLeft, ChevronRight, MessageSquare, ClipboardList, MessageCircle, ShieldCheck, Lock, FileText, Trophy, Tags } from 'lucide-react';
import { usePathname } from 'next/navigation';
import axios from '@/lib/axios';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setDesktopCollapsed] = useState(false);
    const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
    const [adminUser, setAdminUser] = useState<{ email?: string } | null>(null);

    useEffect(() => {
        // Check auth on mount
        const verifyAuth = async () => {
            const token = localStorage.getItem('admin_access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                // Test token validity
                const res = await axios.get('/auth/me');
                setAdminUser(res.data);
            } catch (err) {
                // Interceptor handles the redirect if 401
            }
        };

        verifyAuth();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_user');
        router.push('/login');
    };

    if (!adminUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Programs', href: '/dashboard/programs', icon: Layers },
        { name: 'Resources', href: '/dashboard/resources', icon: BookOpen },
        { name: 'Community Stories', href: '/dashboard/testimonials', icon: Star },
        { name: 'Success Stories', href: '/dashboard/success-stories', icon: Trophy },
        { name: 'Story Categories', href: '/dashboard/story-categories', icon: Tags },
        { name: 'FAQ', href: '/dashboard/faq', icon: FileQuestion },
        { name: 'Services', href: '/dashboard/services', icon: Activity },
        { name: 'Pricing Durations', href: '/dashboard/pricing', icon: CalendarDays },
        { name: 'Pricing Plans', href: '/dashboard/pricing-plans', icon: Wallet },
        { name: 'Consultations', href: '/dashboard/consultations', icon: MessageSquare },
        { name: 'Applications', href: '/dashboard/applications', icon: ClipboardList },
        { name: 'Feedback', href: '/dashboard/feedback', icon: MessageCircle },
        { name: 'Refund Policy', href: '/dashboard/refund-policy', icon: ShieldCheck },
        { name: 'Privacy Policy', href: '/dashboard/privacy-policy', icon: Lock },
        { name: 'Terms & Conditions', href: '/dashboard/terms-policy', icon: FileText },
        { name: 'Company Settings', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Desktop */}
            <aside className={`hidden md:flex flex-col bg-primary border-r border-primary-hover fixed h-full z-10 transition-all duration-300 ${isDesktopCollapsed ? 'w-20' : 'w-64'}`}>
                <div className={`h-16 flex items-center bg-primary border-b border-white/5 overflow-hidden ${isDesktopCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
                    <div className="flex items-center overflow-hidden whitespace-nowrap">
                        {!isDesktopCollapsed && <Activity className="h-6 w-6 text-white flex-shrink-0 mr-3" />}
                        {!isDesktopCollapsed && (
                            <div className="text-xl tracking-tight transition-opacity duration-300">
                                <span className="font-extrabold text-white">Healthstur</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setDesktopCollapsed(!isDesktopCollapsed)}
                        className={`text-white/50 hover:text-white focus:outline-none flex-shrink-0 transition-colors ${isDesktopCollapsed ? '' : 'ml-2'}`}
                    >
                        {isDesktopCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => {
                        const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={isDesktopCollapsed ? item.name : undefined}
                                className={`group flex items-center py-2.5 rounded-lg transition-all duration-200 ${isActive
                                    ? 'text-white bg-white/10'
                                    : 'text-white/70 hover:text-white hover:bg-white/5'
                                    } ${isDesktopCollapsed ? 'justify-center px-0' : 'px-3'}`}
                            >
                                <item.icon className={`flex-shrink-0 h-5 w-5 transition-colors ${isActive
                                    ? 'text-white'
                                    : 'text-white/50 group-hover:text-white'
                                    } ${isDesktopCollapsed ? '' : 'mr-4'}`} strokeWidth={1.5} />
                                {!isDesktopCollapsed && <span className="text-sm font-medium whitespace-nowrap opacity-100 transition-opacity duration-300">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => setLogoutModalOpen(true)}
                        title={isDesktopCollapsed ? "Logout" : undefined}
                        className={`group flex w-full items-center py-2 hover:bg-white/5 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200 ${isDesktopCollapsed ? 'justify-center px-0' : 'px-3'}`}
                    >
                        {isDesktopCollapsed ? (
                            <LogOut className="flex-shrink-0 h-5 w-5 transition-colors" strokeWidth={1.5} />
                        ) : (
                            <>
                                <div className="h-7 w-7 rounded-full bg-black/40 flex items-center justify-center font-semibold text-white text-xs mr-3 border border-white/10 shadow-inner">
                                    {adminUser.email ? adminUser.email[0].toUpperCase() : 'A'}
                                </div>
                                <span className="text-sm font-medium whitespace-nowrap opacity-100 transition-opacity duration-300">Logout</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 bg-[#f8f9fa] ${isDesktopCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
                {/* Header - Mobile & Search/Profile area */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 z-10 sticky top-0">
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="ml-4 flex items-center">
                            <Activity className="h-6 w-6 text-primary mr-2" />
                            <div className="text-xl tracking-tight">
                                <span className="font-extrabold text-primary">Healthstur</span>
                            </div>
                        </div>
                    </div>

                    {/* Empty div to push items to the right on desktop */}
                    <div className="hidden md:block"></div>

                    <div className="flex items-center ml-auto">
                        <div className="text-xs font-medium text-gray-500 hidden sm:block mr-3">
                            {adminUser.email}
                        </div>
                        <div className="h-8 w-8 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                            {adminUser.email ? adminUser.email[0].toUpperCase() : 'A'}
                        </div>

                        <button
                            onClick={() => setLogoutModalOpen(true)}
                            className="ml-4 md:hidden text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                {/* Mobile menu overlay */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 z-40 md:hidden block">
                        <div
                            className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                            onClick={() => setSidebarOpen(false)}
                        ></div>
                        <nav className="fixed top-0 left-0 bottom-0 flex flex-col w-64 max-w-sm bg-primary pt-5 pb-4">
                            <div className="flex items-center justify-between px-4 pb-4 border-b border-primary-hover">
                                <div className="flex items-center">
                                    <Activity className="h-6 w-6 text-white mr-2" />
                                    <div className="text-xl font-black tracking-tight text-white">
                                        Healthstur<span className="text-gray-300 font-medium">Admin</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="text-gray-300 hover:text-white"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="mt-5 flex-1 h-0 overflow-y-auto">
                                <nav className="px-2 space-y-1">
                                    {navItems.map((item) => {
                                        const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${isActive
                                                    ? 'bg-primary-hover text-white'
                                                    : 'text-gray-300 hover:bg-primary-hover hover:text-white'
                                                    }`}
                                            >
                                                <item.icon className={`mr-4 h-6 w-6 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                                                    }`} />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </nav>
                                <div className="mt-8 px-2">
                                    <button
                                        onClick={() => {
                                            setSidebarOpen(false);
                                            setLogoutModalOpen(true);
                                        }}
                                        className="group flex w-full items-center px-2 py-2 text-base font-medium rounded-md text-red-400 hover:bg-red-900/30 transition-colors"
                                    >
                                        <LogOut className="mr-4 h-6 w-6 text-red-400 group-hover:text-red-300 transition-colors" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </nav>
                    </div>
                )}

                {/* Main Content Area */}
                <main className="flex-1 p-6 sm:p-8 overflow-auto">
                    {children}
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setLogoutModalOpen(false)}
                    ></div>

                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 transform transition-all border border-gray-100">
                        <div className="flex flex-col items-center justify-center text-center mb-8">
                            <div className="mx-auto flex h-16 w-16 mb-5 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-inner ring-4 ring-red-50/50">
                                <LogOut className="h-7 w-7 pr-[2px]" aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-2">
                                    Sign Out
                                </h3>
                                <div>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        Are you sure you want to sign out of your admin session? You will need to log back in to access the dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex w-full justify-center items-center rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-600 focus:outline-none transition-colors duration-200"
                            >
                                Yes, sign me out
                            </button>
                            <button
                                type="button"
                                onClick={() => setLogoutModalOpen(false)}
                                className="inline-flex w-full justify-center items-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50 hover:text-gray-900 focus:outline-none transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
