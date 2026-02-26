import ProgramForm from '../ProgramForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CreateProgramPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link
                    href="/dashboard/programs"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add New Program</h1>
                    <p className="text-sm text-gray-500 mt-1">Create a new program and design its landing page details.</p>
                </div>
            </div>

            <ProgramForm />
        </div>
    );
}
