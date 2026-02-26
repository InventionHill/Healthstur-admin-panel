import ServiceForm from '../components/ServiceForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { use } from 'react';

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link
                    href="/dashboard/services"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Service</h1>
                    <p className="text-sm text-gray-500 mt-1">Update details for this service.</p>
                </div>
            </div>

            <ServiceForm id={resolvedParams.id} />
        </div>
    );
}
