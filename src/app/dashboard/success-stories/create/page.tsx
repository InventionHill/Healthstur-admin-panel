import StoryForm from '../components/StoryForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateStoryPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link
                    href="/dashboard/success-stories"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create Success Story</h1>
                    <p className="text-sm text-gray-500 mt-1">Add a new success story to showcase client transformations</p>
                </div>
            </div>

            <StoryForm />
        </div>
    );
}
