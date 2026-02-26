'use client';

import { useEffect, useState, use } from 'react';
import ProgramForm from '../../ProgramForm';
import axios from '@/lib/axios';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
    solutions?: any[];
}

export default function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const [program, setProgram] = useState<Program | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                // Fetch all programs for now to find the one matching the ID
                const res = await axios.get('/programs');
                const found = res.data.find((p: Program) => p.id === unwrappedParams.id);
                if (found) {
                    setProgram(found);
                }
            } catch (error) {
                console.error('Failed to fetch program:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProgram();
    }, [unwrappedParams.id]);

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading program data...</div>;
    }

    if (!program) {
        return <div className="p-8 text-center text-red-500">Program not found!</div>;
    }

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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Program</h1>
                    <p className="text-sm text-gray-500 mt-1">Update details for {program.name}.</p>
                </div>
            </div>

            <ProgramForm initialData={program} />
        </div>
    );
}
