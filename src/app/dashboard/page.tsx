export default function DashboardPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <h1 className="text-xl font-bold text-gray-900 mb-6 font-sans tracking-tight">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-7">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Total Users</h3>
                    <p className="text-4xl font-bold text-gray-900 tracking-tight">1,234</p>
                    <div className="mt-8 flex items-center text-xs font-semibold text-emerald-500">
                        <span>+12% from last month</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-7">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Active Settings</h3>
                    <p className="text-4xl font-bold text-gray-900 tracking-tight">42</p>
                    <div className="mt-8 flex items-center text-xs font-semibold text-emerald-500">
                        <span>All systems operational</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-7">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">System Status</h3>
                    <p className="text-4xl font-bold text-[#023051] tracking-tight">Healthy</p>
                    <div className="mt-8 flex items-center text-xs font-medium text-gray-400">
                        <span>Last checked 2 mins ago</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-7">
                <h2 className="text-sm font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                    <div className="flex items-center p-4 bg-[#f8f9fa] rounded-xl border border-gray-50">
                        <div className="h-10 w-10 rounded-full bg-[#e2e8f0] flex items-center justify-center text-xs font-medium text-gray-600 mr-4 shadow-sm">
                            A
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">System logged in</p>
                            <p className="text-xs text-gray-500 mt-0.5">Just now</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
