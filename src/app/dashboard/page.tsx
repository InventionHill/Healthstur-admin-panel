'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Layers, BookOpen, Trophy, ClipboardList, MessageSquare, MessageCircle, ArrowRight, Activity, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
    stats: {
        programs: number;
        resources: number;
        successStories: number;
        applications: number;
        consultations: number;
        feedback: number;
    };
    performance: {
        uptime: number;
        latency: number;
    };
    visitorStats: {
        name: string;
        visitors: number;
    }[];
    recentActivity: {
        id: string;
        type: string;
        title: string;
        subtitle: string;
        timestamp: string;
    }[];
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/dashboard/stats');
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const statCards = [
        { name: 'Programs', value: data?.stats.programs || 0, icon: Layers, href: '/dashboard/programs', color: 'bg-blue-50 text-blue-600' },
        { name: 'Resources', value: data?.stats.resources || 0, icon: BookOpen, href: '/dashboard/resources', color: 'bg-indigo-50 text-indigo-600' },
        { name: 'Success Stories', value: data?.stats.successStories || 0, icon: Trophy, href: '/dashboard/success-stories', color: 'bg-amber-50 text-amber-600' },
        { name: 'Applications', value: data?.stats.applications || 0, icon: ClipboardList, href: '/dashboard/applications', color: 'bg-emerald-50 text-emerald-600' },
        { name: 'Consultations', value: data?.stats.consultations || 0, icon: MessageSquare, href: '/dashboard/consultations', color: 'bg-purple-50 text-purple-600' },
        { name: 'Feedback', value: data?.stats.feedback || 0, icon: MessageCircle, href: '/dashboard/feedback', color: 'bg-rose-50 text-rose-600' },
    ];

    return (
        <div className="max-w-7xl mx-auto  sm:px-4 lg:px-8  w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-sans tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1 text-sm">Welcome back! Here's what's happening with Healthstur today.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-600 italic">Live Status: System Healthy</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                {statCards.map((card) => (
                    <Link key={card.name} href={card.href} className="group transition-all hover:scale-[1.02]">
                        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 p-4 sm:p-6 flex items-center justify-between relative overflow-hidden h-full">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                <card.icon className="h-24 w-24" />
                            </div>
                            <div className="relative z-10 w-full flex items-center justify-between">
                                <div>
                                    <div className={`shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-xl ${card.color} flex items-center justify-center mb-3 sm:mb-4 shadow-sm ring-1 ring-black/5`}>
                                        <card.icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
                                    </div>
                                    <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1">{card.name}</h3>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{card.value}</p>
                                        <span className="text-[10px] sm:text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
                                    </div>
                                </div>
                                <div className="relative z-10 shrink-0 self-end mb-1">
                                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300 group-hover:text-primary transition-colors group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Traffic Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 sm:gap-0">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Activity className="h-4 w-4 text-primary" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">Website Traffic</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <div className="flex items-center gap-1.5 shrink-0">
                                <div className="h-2 w-2 rounded-full bg-primary/40"></div>
                                <span>Visitors</span>
                            </div>
                            <span className="bg-gray-50 px-2 sm:px-2.5 py-1 rounded-full text-gray-500 border border-gray-100 whitespace-nowrap shrink-0">Last 7 Days</span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.visitorStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#023051" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#023051" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="visitors"
                                    stroke="#023051"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVisitors)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Stats or Info */}
                <div className="space-y-6">
                    <div className="bg-primary rounded-2xl p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Activity className="h-36 w-36" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2">Get Started</h3>
                            <p className="text-sm text-white/80 leading-relaxed mb-6">
                                Use the sidebar to manage your content, services and track your business growth.
                            </p>
                            <Link href="/dashboard/settings" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm transition-all border border-white/10">
                                View Settings <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">System Performance</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                                    <span>Server Uptime</span>
                                    <span className="text-emerald-500">{data?.performance.uptime || '99.9'}%</span>
                                </div>
                                <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all duration-500"
                                        style={{ width: `${data?.performance.uptime || 99.9}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                                    <span>API Latency</span>
                                    <span className="text-emerald-500">{data?.performance.latency || '42'}ms</span>
                                </div>
                                <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all duration-500"
                                        style={{ width: `${Math.min(((data?.performance.latency || 42) / 200) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="mt-8 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden flex flex-col mb-8">
                <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                    <div className="flex items-center gap-2">
                        <div className="shrink-0 h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                            <ClipboardList className="h-4 w-4 text-gray-400" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Recent Applications</h2>
                    </div>
                    <Link href="/dashboard/applications" className="shrink-0 self-end sm:self-auto text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
                        View All <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="flex-1">
                    {data?.recentActivity && data.recentActivity.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {data.recentActivity.map((activity) => (
                                <div key={activity.id} className="p-4 sm:p-6 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group">
                                    <div className="flex items-center sm:items-start gap-3 sm:gap-4 w-full sm:w-auto">
                                        <div className="shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shadow-sm ring-1 ring-primary/5">
                                            {activity.title.split(' ').pop()?.[0] || 'A'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors truncate">{activity.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 font-medium truncate">{activity.subtitle}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center sm:flex-col justify-between sm:items-end gap-2 sm:gap-1 pl-[52px] sm:pl-0 sm:ml-auto w-full sm:w-auto">
                                        <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">{activity.type}</span>
                                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400 font-medium shrink-0">
                                            <Clock className="h-3 w-3 shrink-0" />
                                            <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="mx-auto h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                                <Activity className="h-6 w-6 text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium">No recent applications found</p>
                            <p className="text-xs text-gray-400 mt-1">Once you receive applications, they'll appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
