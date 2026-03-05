'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { Upload, X, ArrowLeft, Search, Check } from 'lucide-react';
import Image from 'next/image';
import { COUNTRIES, type CountryData } from '@/lib/countries';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, Transition } from '@headlessui/react';

interface CountryFormProps {
    countryId?: string; // If provided, we're in edit mode
}

const COMMON_CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
];

export default function CountryForm({ countryId }: CountryFormProps) {
    const router = useRouter();
    const isEditMode = !!countryId;

    const [loading, setLoading] = useState(isEditMode);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        currencyCode: '',
        currencySymbol: '',
        flag: '',
        isActive: true,
    });
    const [query, setQuery] = useState('');

    const filteredCountries = query === ''
        ? COUNTRIES
        : COUNTRIES.filter((country) =>
            country.name.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, ''))
        );

    const handleCountrySelect = (country: CountryData | null) => {
        if (!country) return;
        setFormData(prev => ({
            ...prev,
            name: country.name,
            currencyCode: country.currencyCode,
            currencySymbol: country.currencySymbol,
            flag: `https://flagcdn.com/w160/${country.code}.png`
        }));
    };

    useEffect(() => {
        if (isEditMode) {
            fetchCountry();
        }
    }, [countryId]);

    const fetchCountry = async () => {
        try {
            const response = await axios.get(`/countries/${countryId}`);
            setFormData({
                name: response.data.name,
                currencyCode: response.data.currencyCode,
                currencySymbol: response.data.currencySymbol,
                flag: response.data.flag,
                isActive: response.data.isActive,
            });
        } catch (err) {
            console.error('Failed to fetch country', err);
            setError('Failed to fetch country details');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        const uploadData = new FormData();
        uploadData.append('file', file);

        setIsUploadingImage(true);
        setError('');

        try {
            // Reusing existing upload endpoint
            const res = await axios.post('/programs/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFormData(prev => ({ ...prev, flag: res.data.url }));
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload image. Please try again.');
        } finally {
            setIsUploadingImage(false);
            if (e.target) e.target.value = ''; // Reset input
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, flag: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name.trim()) return setError('Name is required');
        if (!formData.currencyCode.trim()) return setError('Currency Code is required');
        if (!formData.currencySymbol.trim()) return setError('Currency Symbol is required');
        if (!formData.flag) return setError('Flag image is required');

        setIsSaving(true);

        try {
            if (isEditMode) {
                await axios.put(`/countries/${countryId}`, formData);
            } else {
                await axios.post('/countries', formData);
            }
            router.push('/dashboard/countries');
        } catch (err: any) {
            console.error('Failed to save country', err);
            setError(err.response?.data?.message || 'Failed to save country. Ensure the name is unique.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8">Loading country data...</div>;
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        {isEditMode ? 'Edit Country' : 'Add New Country'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure country locations and their associated currencies.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search & Select Country
                        </label>
                        <Combobox value={null as CountryData | null} onChange={handleCountrySelect}>
                            <div className="relative mt-1">
                                <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left border border-gray-300 focus-within:ring-2 focus-within:ring-[#023051] focus-within:border-transparent">
                                    <ComboboxInput
                                        className="w-full border-none py-2 pl-10 pr-4 text-sm leading-5 text-gray-900 focus:ring-0 outline-none"
                                        displayValue={() => ''}
                                        onChange={(event) => setQuery(event.target.value)}
                                        placeholder="Type to search countries..."
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                    </div>
                                </div>
                                <Transition
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                    afterLeave={() => setQuery('')}
                                >
                                    <ComboboxOptions className="absolute mt-1 max-height-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50 max-h-60">
                                        {filteredCountries.length === 0 && query !== '' ? (
                                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                                Nothing found.
                                            </div>
                                        ) : (
                                            filteredCountries.slice(0, 50).map((country) => (
                                                <ComboboxOption
                                                    key={country.code}
                                                    className={({ active }) =>
                                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-[#023051] text-white' : 'text-gray-900'
                                                        }`
                                                    }
                                                    value={country}
                                                >
                                                    {({ selected, active }) => (
                                                        <>
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={`https://flagcdn.com/w40/${country.code}.png`}
                                                                    alt={country.name}
                                                                    className="w-6 h-4 object-cover rounded-sm"
                                                                />
                                                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                                    {country.name}
                                                                </span>
                                                            </div>
                                                            {selected ? (
                                                                <span
                                                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-[#023051]'
                                                                        }`}
                                                                >
                                                                    <Check className="h-4 w-4" aria-hidden="true" />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </ComboboxOption>
                                            ))
                                        )}
                                    </ComboboxOptions>
                                </Transition>
                            </div>
                        </Combobox>
                        <p className="mt-1 text-xs text-gray-500">
                            Selecting a country will automatically fill the name, currency, and flag.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#023051] focus:border-transparent text-gray-900"
                            placeholder="e.g. Australia"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Currency Code
                        </label>
                        <select
                            value={formData.currencyCode}
                            onChange={(e) => {
                                const selectedCurrency = COMMON_CURRENCIES.find(c => c.code === e.target.value);
                                setFormData(prev => ({
                                    ...prev,
                                    currencyCode: e.target.value,
                                    // Optionally auto-update the symbol if it's empty or matches a known one
                                    ...(selectedCurrency && !prev.currencySymbol ? { currencySymbol: selectedCurrency.symbol } : {})
                                }));
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#023051] focus:border-transparent text-gray-900 bg-white"
                        >
                            <option value="">Select a currency...</option>
                            {COMMON_CURRENCIES.map(currency => (
                                <option key={currency.code} value={currency.code}>
                                    {currency.code} - {currency.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Currency Symbol
                        </label>
                        <input
                            type="text"
                            value={formData.currencySymbol}
                            onChange={(e) => setFormData(prev => ({ ...prev, currencySymbol: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#023051] focus:border-transparent text-gray-900"
                            placeholder="e.g. $"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={formData.isActive.toString()}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#023051] focus:border-transparent text-gray-900"
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Flag Image (SVG or PNG)
                    </label>
                    {formData.flag ? (
                        <div className="relative inline-block border rounded-lg p-2 bg-gray-50">
                            <Image
                                src={formData.flag.startsWith('http') ? formData.flag : (`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`.replace(/\/api$/, '') + formData.flag)}
                                alt="Flag Preview"
                                width={80}
                                height={80}
                                className="object-cover rounded shadow-sm w-20 h-20"
                                unoptimized
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600 justify-center">
                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#023051] hover:text-[#023051]/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#023051]">
                                        <span>Upload a file</span>
                                        <input
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={isUploadingImage}
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {isUploadingImage ? 'Uploading...' : 'PNG, JPG, SVG up to 5MB'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={isSaving || isUploadingImage}
                        className="px-6 py-2 bg-[#023051] text-white rounded-lg hover:bg-[#023051]/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                        {isSaving ? 'Saving...' : (isEditMode ? 'Update Country' : 'Create Country')}
                    </button>
                </div>
            </form>
        </div>
    );
}
