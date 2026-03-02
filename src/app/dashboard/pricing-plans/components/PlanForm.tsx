'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Upload, ChevronDown, Check, GripVertical } from 'lucide-react';
import axios from '@/lib/axios';
import { DynamicIcon } from '@/components/DynamicIcon';
import * as LucideIcons from 'lucide-react';
import { COMMON_ICONS } from '@/lib/constants';

interface PlanFormProps {
    id?: string;
}

const ArrayInputSection = ({
    title,
    items,
    onAdd,
    onRemove,
    onChange,
    error
}: {
    title: string,
    items: string[],
    onAdd: () => void,
    onRemove: (index: number) => void,
    onChange: (index: number, value: string) => void,
    error?: string
}) => (
    <div className={`bg-white rounded-xl border ${error ? 'border-red-500' : 'border-gray-200'} shadow-sm flex flex-col h-[380px]`}>
        <div className={`px-4 py-3 border-b ${error ? 'border-red-100 bg-red-50/30' : 'border-gray-100 bg-gray-50/30'} flex justify-between items-center rounded-t-xl`}>
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-red-500' : 'bg-[#023051]'}`}></div>
                <h4 className={`font-bold ${error ? 'text-red-600' : 'text-[#023051]'} text-xs uppercase tracking-wider`}>{title}</h4>
            </div>
            <button
                type="button"
                onClick={onAdd}
                className="text-[10px] flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[#023051] font-bold hover:bg-[#023051] hover:text-white hover:border-[#023051] transition-all shadow-sm active:scale-95 uppercase tracking-tight"
            >
                <Plus className="w-3 h-3" strokeWidth={3} /> Add Item
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
            {items.length === 0 ? (
                <div className={`h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed ${error ? 'border-red-200 bg-red-50/30' : 'border-gray-100'} rounded-lg`}>
                    <p className={`text-xs ${error ? 'text-red-500 font-bold' : 'text-gray-400 italic'}`}>
                        {error || 'No items added'}
                    </p>
                </div>
            ) : (
                items.map((item, index) => (
                    <div key={index} className="group flex items-start gap-2 bg-gray-50/50 p-2 rounded-lg border border-transparent hover:border-gray-200 hover:bg-white transition-all shadow-none hover:shadow-sm">
                        <div className="mt-1.5 w-5 h-5 flex items-center justify-center rounded bg-gray-100 text-[10px] font-bold text-gray-400 group-hover:bg-[#023051]/5 group-hover:text-[#023051] transition-colors shrink-0">
                            {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <textarea
                                value={item}
                                onChange={(e) => onChange(index, e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border-0 focus:ring-0 outline-none bg-transparent text-gray-900 placeholder:text-gray-300 resize-none min-h-[38px] leading-relaxed"
                                placeholder={`Enter ${title.toLowerCase()}...`}
                                rows={1}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = target.scrollHeight + 'px';
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                            {items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => onRemove(index)}
                                    className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all active:scale-90"
                                    title="Remove item"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
            <div className="h-2"></div>
        </div>
    </div>
);

export default function PlanForm({ id }: PlanFormProps) {
    const router = useRouter();
    const [durationId, setDurationId] = useState('');
    const [durations, setDurations] = useState<{ id: string; name: string }[]>([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [priceIndia, setPriceIndia] = useState('');
    const [priceUsa, setPriceUsa] = useState('');
    const [priceEurope, setPriceEurope] = useState('');
    const [icon, setIcon] = useState('Star');
    const [buttonText, setButtonText] = useState('BUY NOW');
    const [image, setImage] = useState('');
    const [highlighted, setHighlighted] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [features, setFeatures] = useState<string[]>(['']);
    const [support, setSupport] = useState<string[]>(['']);
    const [positioning, setPositioning] = useState<string[]>(['']);
    const [errors, setErrors] = useState<{ price?: string; priceIndia?: string; priceUsa?: string; priceEurope?: string; image?: string;[key: string]: string | undefined }>({});

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
    const [iconSearchQuery, setIconSearchQuery] = useState('');

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Fetch durations first
                const durationsRes = await axios.get('/pricing/durations');
                const durationsDesc = durationsRes.data;
                setDurations(durationsDesc);

                if (!id && durationsDesc.length > 0) {
                    setDurationId(durationsDesc[0].id);
                }

                // If editing, fetch the plan
                if (id) {
                    const planRes = await axios.get(`/pricing/plans/${id}`);
                    const data = planRes.data;
                    setDurationId(data.durationId);
                    setName(data.name);
                    setDescription(data.description);
                    setPrice(data.price);
                    setPriceIndia(data.priceIndia || '');
                    setPriceUsa(data.priceUsa || '');
                    setPriceEurope(data.priceEurope || '');
                    setIcon(data.icon);
                    setButtonText(data.buttonText);
                    setImage(data.image);
                    setHighlighted(data.highlighted);
                    setIsActive(data.isActive);
                    setFeatures(data.features?.length ? data.features : ['']);
                    setSupport(data.support?.length ? data.support : ['']);
                    setPositioning(data.positioning?.length ? data.positioning : ['']);
                }
            } catch (error) {
                console.error('Failed to load initial data:', error);
            } finally {
                setInitialLoading(false);
            }
        };

        loadInitialData();
    }, [id]);

    const handleArrayChange = (setter: any, index: number, value: string) => {
        setter((prev: string[]) => {
            const newArr = [...prev];
            newArr[index] = value;
            return newArr;
        });
    };

    const addArrayItem = (setter: any) => {
        setter((prev: string[]) => [...prev, '']);
    };

    const removeArrayItem = (setter: any, index: number) => {
        setter((prev: string[]) => prev.filter((_: any, i: number) => i !== index));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploadingImage(true);
            const data = new FormData();
            data.append('file', file);

            const res = await axios.post('/programs/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setImage(res.data.url);
        } catch (error) {
            console.error('Error uploading file', error);
            alert('Error uploading file');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const validate = () => {
        const newErrors: any = {};

        if (!price || isNaN(Number(price))) {
            newErrors.price = 'Price must be a valid number';
        }
        if (!priceIndia || isNaN(Number(priceIndia))) {
            newErrors.priceIndia = 'Price (India) must be a valid number';
        }
        if (!priceUsa || isNaN(Number(priceUsa))) {
            newErrors.priceUsa = 'Price (USA) must be a valid number';
        }
        if (!priceEurope || isNaN(Number(priceEurope))) {
            newErrors.priceEurope = 'Price (Europe) must be a valid number';
        }

        if (!image) {
            newErrors.image = 'Background image is required';
        }

        const validFeatures = features.filter(f => f.trim() !== '');
        if (validFeatures.length === 0) {
            newErrors.features = 'At least one Included Feature is required';
        }

        const validSupport = support.filter(s => s.trim() !== '');
        if (validSupport.length === 0) {
            newErrors.support = 'At least one Support Level is required';
        }

        const validPositioning = positioning.filter(p => p.trim() !== '');
        if (validPositioning.length === 0) {
            newErrors.positioning = 'At least one Positioning (Benefit) is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);
        setErrors({});

        const payload = {
            durationId,
            name,
            description,
            price,
            priceIndia,
            priceUsa,
            priceEurope,
            icon,
            buttonText,
            image,
            highlighted,
            isActive,
            features: features.filter(f => f.trim() !== ''),
            support: support.filter(s => s.trim() !== ''),
            positioning: positioning.filter(p => p.trim() !== '')
        };

        try {
            if (id) {
                await axios.put(`/pricing/plans/${id}`, payload);
            } else {
                await axios.post('/pricing/plans', payload);
            }
            router.push('/dashboard/pricing-plans');
            router.refresh();
        } catch (error: any) {
            console.error('Failed to save plan:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save plan. Please try again.';

            if (Array.isArray(errorMessage)) {
                setErrors({ submit: errorMessage.join(', ') });
            } else {
                setErrors({ submit: errorMessage });
            }

            alert(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
        } finally {
            setLoading(false);
        }
    };


    if (initialLoading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="w-full">
            <div className="flex items-center space-x-4 mb-6">
                <Link
                    href={`/dashboard/pricing-plans`}
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        {id ? 'Edit Plan' : 'Create Plan'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure pricing plan details and features.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {errors.submit && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">
                        {errors.submit}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration
                            </label>
                            <select
                                value={durationId}
                                onChange={(e) => setDurationId(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#023051] focus:border-transparent outline-none transition-all bg-white text-gray-900"
                            >
                                <option value="" disabled>Select a duration...</option>
                                {durations.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Plan Name
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#023051] focus:border-transparent outline-none transition-all text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (Monthly, Fallback)
                            </label>
                            <input
                                type="text"
                                required
                                value={price}
                                onChange={(e) => {
                                    setPrice(e.target.value);
                                    if (errors.price) setErrors(prev => ({ ...prev, price: undefined }));
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#023051] focus:border-transparent outline-none transition-all text-gray-900 ${errors.price ? 'border-red-500 bg-red-50/30' : 'border-gray-300'}`}
                                placeholder="e.g. 79"
                            />
                            {errors.price && <p className="mt-1 text-xs text-red-500 font-medium">{errors.price}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (India)
                            </label>
                            <input
                                type="text"
                                required
                                value={priceIndia}
                                onChange={(e) => {
                                    setPriceIndia(e.target.value);
                                    if (errors.priceIndia) setErrors(prev => ({ ...prev, priceIndia: undefined }));
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#023051] focus:border-transparent outline-none transition-all text-gray-900 ${errors.priceIndia ? 'border-red-500 bg-red-50/30' : 'border-gray-300'}`}
                                placeholder="e.g. 800"
                            />
                            {errors.priceIndia && <p className="mt-1 text-xs text-red-500 font-medium">{errors.priceIndia}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (USA)
                            </label>
                            <input
                                type="text"
                                required
                                value={priceUsa}
                                onChange={(e) => {
                                    setPriceUsa(e.target.value);
                                    if (errors.priceUsa) setErrors(prev => ({ ...prev, priceUsa: undefined }));
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#023051] focus:border-transparent outline-none transition-all text-gray-900 ${errors.priceUsa ? 'border-red-500 bg-red-50/30' : 'border-gray-300'}`}
                                placeholder="e.g. 10"
                            />
                            {errors.priceUsa && <p className="mt-1 text-xs text-red-500 font-medium">{errors.priceUsa}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (Europe)
                            </label>
                            <input
                                type="text"
                                required
                                value={priceEurope}
                                onChange={(e) => {
                                    setPriceEurope(e.target.value);
                                    if (errors.priceEurope) setErrors(prev => ({ ...prev, priceEurope: undefined }));
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#023051] focus:border-transparent outline-none transition-all text-gray-900 ${errors.priceEurope ? 'border-red-500 bg-red-50/30' : 'border-gray-300'}`}
                                placeholder="e.g. 10"
                            />
                            {errors.priceEurope && <p className="mt-1 text-xs text-red-500 font-medium">{errors.priceEurope}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#023051] focus:border-transparent outline-none transition-all text-gray-900"
                            placeholder="e.g. Disciplined individuals who just need a structured roadmap."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Plan Icon
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023051] focus:border-transparent bg-white text-gray-900 text-left flex items-center justify-between h-10 transition-all font-medium text-sm"
                                >
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#023051]">
                                        <DynamicIcon name={icon || 'Activity'} className="w-5 h-5" />
                                    </div>
                                    <span className="block truncate">{icon || 'Select an Icon'}</span>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                        <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                    </span>
                                </button>

                                {isIconDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsIconDropdownOpen(false)}></div>
                                        <div className="absolute z-20 mt-1 w-full bg-white shadow-xl max-h-60 rounded-xl py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm border border-gray-100">
                                            <div className="px-3 pb-2 pt-1 sticky top-0 bg-white z-30 border-b border-gray-50 mb-1">
                                                <input
                                                    type="text"
                                                    className="w-full border border-gray-200 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#023051]/10 focus:border-[#023051] text-gray-900 bg-gray-50 placeholder-gray-400"
                                                    placeholder="Search icons..."
                                                    value={iconSearchQuery}
                                                    onChange={(e) => setIconSearchQuery(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    autoFocus
                                                />
                                            </div>
                                            <ul className="relative z-20">
                                                {COMMON_ICONS.filter(iconName => iconName.toLowerCase().includes(iconSearchQuery.toLowerCase())).map((iconName) => {
                                                    const isSelected = icon === iconName;
                                                    return (
                                                        <li
                                                            key={iconName}
                                                            className={`cursor-pointer select-none relative py-2.5 pl-3 pr-9 border-b border-gray-50/50 last:border-0 hover:bg-gray-50 group flex items-center gap-3 ${isSelected ? 'bg-primary/5 text-[#023051]' : 'text-gray-700'}`}
                                                            onClick={() => {
                                                                setIcon(iconName);
                                                                setIsIconDropdownOpen(false);
                                                                setIconSearchQuery('');
                                                            }}
                                                        >
                                                            <div className={`p-1 rounded-md ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-100 group-hover:bg-white'} transition-colors`}>
                                                                <DynamicIcon name={iconName} className={`w-4 h-4 ${isSelected ? 'text-[#023051]' : 'text-gray-400 group-hover:text-[#023051]'}`} />
                                                            </div>
                                                            <span className={`block truncate ${isSelected ? 'font-bold' : 'font-medium'}`}>
                                                                {iconName}
                                                            </span>
                                                            {isSelected && (
                                                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#023051]">
                                                                    <Check className="h-4 w-4" aria-hidden="true" strokeWidth={3} />
                                                                </span>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                                {COMMON_ICONS.filter(iconName => iconName.toLowerCase().includes(iconSearchQuery.toLowerCase())).length === 0 && (
                                                    <li className="text-gray-500 text-xs text-center py-6 italic">No icons matching "{iconSearchQuery}"</li>
                                                )}
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Button Text
                            </label>
                            <input
                                type="text"
                                value={buttonText}
                                onChange={(e) => setButtonText(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#023051] focus:border-transparent outline-none transition-all text-gray-900 h-10 font-medium text-sm"
                                placeholder="e.g. BUY NOW"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Background Image (Card Image)
                            </label>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center justify-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-[#023051] rounded-lg cursor-pointer transition-all border border-gray-200 shadow-sm text-sm font-bold h-10 shrink-0">
                                    <Upload className="w-4 h-4 mr-2" strokeWidth={2.5} />
                                    {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                        handleImageUpload(e);
                                        if (errors.image) setErrors(prev => ({ ...prev, image: undefined }));
                                    }} disabled={isUploadingImage} />
                                </label>
                                {image && (
                                    <div className="h-10 w-14 rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50 shrink-0">
                                        <img
                                            src={image.startsWith('http')
                                                ? image
                                                : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}${image.startsWith('/') ? '' : '/'}${image}`
                                            }
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                            {errors.image && <p className="mt-1 text-xs text-red-500 font-medium">{errors.image}</p>}
                        </div>
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900">Plan Visibility & Highlighting</h4>
                            <p className="text-xs text-gray-500 mt-1">Control how this plan appears to users.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
                            <label className="flex items-center justify-between sm:justify-start space-x-3 cursor-pointer bg-white px-4 py-3 sm:py-2 rounded-lg border border-gray-200 shadow-sm w-full sm:w-auto">
                                <span className="text-sm font-medium text-gray-700">Active</span>
                                <div className="relative shrink-0">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#023051]"></div>
                                </div>
                            </label>
                            <label className="flex items-center justify-between sm:justify-start space-x-3 cursor-pointer bg-white px-4 py-3 sm:py-2 rounded-lg border border-gray-200 shadow-sm w-full sm:w-auto">
                                <span className="text-sm font-medium text-gray-700">MOST POPULAR Badge</span>
                                <div className="relative shrink-0">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={highlighted}
                                        onChange={(e) => setHighlighted(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Plan Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ArrayInputSection
                                title="Included Features"
                                items={features}
                                onAdd={() => addArrayItem(setFeatures)}
                                onRemove={(index) => removeArrayItem(setFeatures, index)}
                                onChange={(index, value) => {
                                    handleArrayChange(setFeatures, index, value);
                                    if (errors.features) setErrors(prev => ({ ...prev, features: undefined }));
                                }}
                                error={errors.features}
                            />
                            <ArrayInputSection
                                title="Support Level"
                                items={support}
                                onAdd={() => addArrayItem(setSupport)}
                                onRemove={(index) => removeArrayItem(setSupport, index)}
                                onChange={(index, value) => {
                                    handleArrayChange(setSupport, index, value);
                                    if (errors.support) setErrors(prev => ({ ...prev, support: undefined }));
                                }}
                                error={errors.support}
                            />
                            <ArrayInputSection
                                title="Positioning (Benefits)"
                                items={positioning}
                                onAdd={() => addArrayItem(setPositioning)}
                                onRemove={(index) => removeArrayItem(setPositioning, index)}
                                onChange={(index, value) => {
                                    handleArrayChange(setPositioning, index, value);
                                    if (errors.positioning) setErrors(prev => ({ ...prev, positioning: undefined }));
                                }}
                                error={errors.positioning}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-end space-x-3">
                            <Link
                                href={`/dashboard/pricing-plans`}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center space-x-2 bg-[#023051] text-white px-6 py-2 rounded-lg hover:bg-[#023051]/90 focus:ring-4 focus:ring-[#023051]/20 transition-all disabled:opacity-50 font-medium text-sm"
                            >
                                {loading ? (
                                    <span>Saving...</span>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Save Plan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
