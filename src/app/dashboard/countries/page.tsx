'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import ConfirmDialog from '@/components/ConfirmDialog';
import Image from 'next/image';

interface Country {
    id: string;
    name: string;
    currencyCode: string;
    currencySymbol: string;
    flag: string;
    isActive: boolean;
}

export default function CountryList() {
    const router = useRouter();
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const fetchCountries = async () => {
        try {
            const response = await axios.get('/countries');
            setCountries(response.data);
        } catch (error) {
            console.error('Failed to fetch countries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCountries();
    }, []);

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await axios.delete(`/countries/${itemToDelete}`);
            fetchCountries();
        } catch (error) {
            console.error('Failed to delete country:', error);
        } finally {
            setItemToDelete(null);
        }
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
    };

    const handleToggleActive = async (country: Country) => {
        try {
            const newStatus = !country.isActive;
            // Optimistic update
            setCountries(current => current.map(c => c.id === country.id ? { ...c, isActive: newStatus } : c));
            await axios.put(`/countries/${country.id}`, { ...country, isActive: newStatus });
        } catch (error) {
            console.error('Failed to toggle country status:', error);
            fetchCountries(); // Refresh if failed
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manage Countries & Currencies</h1>
                    <p className="text-sm text-gray-500 mt-1">Add geographic options for pricing display and program filtering.</p>
                </div>
                <Link
                    href="/dashboard/countries/create"
                    className="flex items-center justify-center w-full sm:w-auto space-x-2 bg-[#023051] text-white px-4 py-2 rounded-lg hover:bg-[#023051]/90 shrink-0"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Country</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left w-10">Flag</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {countries.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No countries added yet.
                                </td>
                            </tr>
                        ) : (
                            countries.map((country) => (
                                <tr key={country.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 relative">
                                            {country.flag && (
                                                <Image
                                                    src={country.flag.startsWith('http') ? country.flag : (`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`.replace(/\/api$/, '') + country.flag)}
                                                    alt={country.name}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover w-full h-full"
                                                    unoptimized
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{country.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500 bg-gray-100 rounded px-2 py-1 inline-block">
                                            {country.currencyCode} ({country.currencySymbol})
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleActive(country)}
                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-[#023051] focus:ring-offset-2 ${country.isActive ? 'bg-[#023051]' : 'bg-gray-200'}`}
                                            role="switch"
                                            aria-checked={country.isActive}
                                        >
                                            <span className="sr-only">Use setting</span>
                                            <span aria-hidden="true" className={`pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${country.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </button>
                                        <span className="ml-3 text-sm text-gray-500">
                                            {country.isActive ? 'Active' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center gap-3">
                                            <Link
                                                href={`/dashboard/countries/${country.id}/edit`}
                                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 bg-blue-50/50 rounded transition-colors"
                                                title="Edit country"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(country.id)}
                                                className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 bg-red-50/50 rounded transition-colors"
                                                title="Delete country"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmDialog
                isOpen={itemToDelete !== null}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Country"
                message="Are you sure you want to delete this country? This action cannot be undone and may break pricing configurations mapped to this country ID."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
}
