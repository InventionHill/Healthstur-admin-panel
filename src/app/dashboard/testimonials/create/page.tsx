import TestimonialForm from '../components/TestimonialForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateTestimonial() {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link
                    href="/dashboard/testimonials"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add Story</h1>
                    <p className="text-sm text-gray-500 mt-1">Create a new community story for your website.</p>
                </div>
            </div>
            <TestimonialForm />
        </div>
    );
}
