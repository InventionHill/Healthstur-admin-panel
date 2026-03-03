'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { Save, Loader2, Upload, Plus, Trash2, GripVertical, AlertCircle } from 'lucide-react';

interface ResourceFormProps {
    id?: string;
}

interface Step {
    id: number;
    title: string;
    description: string;
    points: string[];
    footer: string;
    image: string;
}

export default function ResourceForm({ id }: ResourceFormProps) {
    const router = useRouter();
    const isEditing = !!id;
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditing);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Drag and Drop state
    const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);
    const [dragOverStepIndex, setDragOverStepIndex] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        heroTitle: '',
        heroDescription: '',
        heroImage: '',
        stepsTitle: '',
        steps: [] as Step[],
        isActive: true,
    });

    useEffect(() => {
        if (isEditing) {
            fetchResource();
        }
    }, [id]);

    const fetchResource = async () => {
        try {
            const response = await axios.get(`/resource/${id}`);
            setFormData({
                title: response.data.title,
                slug: response.data.slug,
                heroTitle: response.data.heroTitle,
                heroDescription: response.data.heroDescription,
                heroImage: response.data.heroImage || '',
                stepsTitle: response.data.stepsTitle || '',
                steps: (response.data.steps || []).map((s: any) => ({
                    ...s,
                    points: Array.isArray(s.points) ? s.points : [],
                })),
                isActive: response.data.isActive,
            });
        } catch (error) {
            console.error('Failed to fetch Resource:', error);
            setError('Failed to load Resource data');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleGenerateSlug = () => {
        if (!formData.title) return;
        const generated = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setFormData(prev => ({ ...prev, slug: generated }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setError(null);
            setIsUploadingImage(true);
            const data = new FormData();
            data.append('file', file);

            const res = await axios.post('/programs/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setter(res.data.url);
        } catch (error) {
            console.error('Error uploading file', error);
            setError('Error uploading file');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const addStep = () => {
        setFormData(prev => ({
            ...prev,
            steps: [
                ...prev.steps,
                {
                    id: Date.now(),
                    title: '',
                    description: '',
                    points: [''],
                    footer: '',
                    image: ''
                }
            ]
        }));
    };

    const removeStep = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const updateStep = (index: number, field: keyof Step, value: any) => {
        setFormData(prev => {
            const newSteps = [...prev.steps];
            newSteps[index] = { ...newSteps[index], [field]: value };
            return { ...prev, steps: newSteps };
        });
    };

    const updateStepPoint = (stepIndex: number, pointIndex: number, value: string) => {
        setFormData(prev => {
            const newSteps = [...prev.steps];
            const newPoints = [...(newSteps[stepIndex].points || [])];
            newPoints[pointIndex] = value;
            newSteps[stepIndex].points = newPoints;
            return { ...prev, steps: newSteps };
        });
    };

    const addStepPoint = (stepIndex: number) => {
        setFormData(prev => {
            const newSteps = [...prev.steps];
            if (!newSteps[stepIndex].points) newSteps[stepIndex].points = [];
            newSteps[stepIndex].points.push('');
            return { ...prev, steps: newSteps };
        });
    };

    const removeStepPoint = (stepIndex: number, pointIndex: number) => {
        setFormData(prev => {
            const newSteps = [...prev.steps];
            newSteps[stepIndex].points = newSteps[stepIndex].points.filter((_, pIdx) => pIdx !== pointIndex);
            return { ...prev, steps: newSteps };
        });
    };

    const moveStep = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === formData.steps.length - 1) return;

        setFormData(prev => {
            const newSteps = [...prev.steps];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            const temp = newSteps[index];
            newSteps[index] = newSteps[targetIndex];
            newSteps[targetIndex] = temp;
            return { ...prev, steps: newSteps };
        });
    };

    // --- Drag and Drop Handlers ---
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedStepIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // We need some data to make drag work in all browsers
        e.dataTransfer.setData('text/plain', index.toString());

        // Slightly delay the visual change so it doesn't affect the dragged ghost
        setTimeout(() => {
            if (e.target instanceof HTMLElement) {
                e.target.style.opacity = '0.5';
            }
        }, 0);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault(); // allow drop
        e.dataTransfer.dropEffect = 'move';
        if (index !== dragOverStepIndex) {
            setDragOverStepIndex(index);
        }
    };

    const handleDragLeave = () => {
        setDragOverStepIndex(null);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedStepIndex(null);
        setDragOverStepIndex(null);
        if (e.target instanceof HTMLElement) {
            e.target.style.opacity = '1';
        }
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        setDragOverStepIndex(null);

        if (draggedStepIndex === null || draggedStepIndex === targetIndex) return;

        setFormData(prev => {
            const newSteps = [...prev.steps];
            const [removedStep] = newSteps.splice(draggedStepIndex, 1);
            newSteps.splice(targetIndex, 0, removedStep);
            return { ...prev, steps: newSteps };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.heroImage) {
            setError('Hero Background Image is required');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (formData.steps.length === 0) {
            setError('At least one Dynamic Step is required');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        for (let i = 0; i < formData.steps.length; i++) {
            if (!formData.steps[i].image) {
                setError(`Image is required for Step ${i + 1}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
        }

        setLoading(true);

        try {
            const payload = {
                ...formData,
            };



            if (isEditing) {
                await axios.put(`/resource/${id}`, payload);
            } else {
                await axios.post('/resource', payload);
            }

            router.push('/dashboard/resources');
            router.refresh();
        } catch (err) {
            console.error('Failed to save Resource:', err);
            setError('Failed to save Resource. Please try again.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                {error && (
                    <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start shadow-sm">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-semibold text-red-800">Action Required</h3>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Basic Info Section */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Basic Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                    Resource Title *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    onBlur={!isEditing ? handleGenerateSlug : undefined}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                                    placeholder="e.g., Wellness Guide"
                                />
                            </div>

                            <div>
                                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                                    URL Slug *
                                </label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        /resources/
                                    </span>
                                    <input
                                        type="text"
                                        id="slug"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-r-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                                        placeholder="wellness"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#023051]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#023051]"></div>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    {formData.isActive ? 'Active and Visible' : 'Inactive'}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Hero Section */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Hero Section</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700 mb-2">
                                    Hero Title *
                                </label>
                                <input
                                    type="text"
                                    id="heroTitle"
                                    required
                                    value={formData.heroTitle}
                                    onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors"
                                    placeholder="Real Transformations. Real Results."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="heroDescription" className="block text-sm font-medium text-gray-700 mb-2">
                                    Hero Description *
                                </label>
                                <textarea
                                    id="heroDescription"
                                    required
                                    rows={3}
                                    value={formData.heroDescription}
                                    onChange={(e) => setFormData({ ...formData, heroDescription: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#023051] focus:border-[#023051] outline-none transition-colors resize-y"
                                    placeholder="Discover inspiring success stories from people who achieved their fitness goals..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Background Image *</label>
                                <div className="flex items-start gap-4 flex-col sm:flex-row">
                                    <label className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors border border-gray-300 shadow-sm text-sm font-medium w-fit">
                                        <Upload className="w-4 h-4 mr-2" />
                                        {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, (url) => setFormData(prev => ({ ...prev, heroImage: url })))}
                                            disabled={isUploadingImage}
                                        />
                                    </label>
                                    {formData.heroImage ? (
                                        <div className="w-48 aspect-video rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                                            {formData.heroImage.startsWith('http') ? (
                                                <img src={formData.heroImage} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}${formData.heroImage}`} alt="Preview" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 mt-2">No image uploaded. Will use default.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Steps Building Section */}
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-4 sm:pb-2 gap-4">
                            <h2 className="text-lg font-bold text-gray-900">Dynamic Steps Builder</h2>
                            <button
                                type="button"
                                onClick={addStep}
                                className="flex items-center space-x-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors w-full sm:w-auto justify-center sm:justify-start"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Step</span>
                            </button>
                        </div>

                        {/* Hidden Steps Section Title. For now we just use hardcoded title from component or leave empty */}


                        {formData.steps.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                                <p className="text-gray-500 mb-2">No steps added yet.</p>
                                <button type="button" onClick={addStep} className="text-[#023051] font-medium hover:underline">Click here to add the first step</button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {formData.steps.map((step, index) => (
                                    <div
                                        key={step.id || index}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`bg-gray-50 p-6 rounded-xl border relative group transition-colors ${dragOverStepIndex === index
                                            ? 'border-blue-500 border-t-2 bg-blue-50/50'
                                            : 'border-gray-200'
                                            }`}
                                    >

                                        <div className="absolute top-4 right-4 flex items-center space-x-2">
                                            <div className="cursor-grab active:cursor-grabbing p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                                                <GripVertical className="w-4 h-4" />
                                            </div>
                                            <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                            <button type="button" onClick={() => removeStep(index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>

                                        <h3 className="font-semibold text-gray-900 mb-4 pr-24">Step {index + 1}</h3>

                                        <div className="space-y-5">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                                                    <input
                                                        type="text" required
                                                        value={step.title || ''}
                                                        onChange={(e) => updateStep(index, 'title', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                                                        placeholder="Deep Goal & Lifestyle Assessment"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Description *</label>
                                                    <input
                                                        type="text" required
                                                        value={step.description || ''}
                                                        onChange={(e) => updateStep(index, 'description', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                                                        placeholder="Our experts conduct..."
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-2">Bullet Points *</label>
                                                <div className="space-y-2">
                                                    {(step.points || []).map((point, pIdx) => (
                                                        <div key={pIdx} className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 bg-black rounded-full flex-shrink-0"></div>
                                                            <input
                                                                type="text"
                                                                required
                                                                value={point}
                                                                onChange={(e) => updateStepPoint(index, pIdx, e.target.value)}
                                                                className="flex-1 min-w-0 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900"
                                                                placeholder="Body metrics..."
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeStepPoint(index, pIdx)}
                                                                className="text-gray-400 hover:text-red-500 shrink-0"
                                                                disabled={(step.points || []).length <= 1}
                                                            >
                                                                <XIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => addStepPoint(index)}
                                                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
                                                >
                                                    <Plus className="w-3 h-3 mr-1" /> Add Bullet Point
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-end">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Footer Text *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={step.footer || ''}
                                                        onChange={(e) => updateStep(index, 'footer', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                                                        placeholder="This ensures we create a plan..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Step Image *</label>
                                                    <div className="flex items-center gap-3">
                                                        <label className="flex items-center justify-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md cursor-pointer hover:bg-gray-50 text-xs font-medium">
                                                            <Upload className="w-3 h-3 mr-1.5" />
                                                            Upload
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => handleFileUpload(e, (url) => updateStep(index, 'image', url))}
                                                            />
                                                        </label>
                                                        {step.image && (
                                                            <div className="h-8 w-8 rounded bg-gray-200 overflow-hidden border border-gray-300">
                                                                {step.image.startsWith('http') ? (
                                                                    <img src={step.image} alt="Preview" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}${step.image}`} alt="Preview" className="w-full h-full object-cover" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                        <button
                            type="button"
                            onClick={() => router.push('/dashboard/resources')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto flex items-center justify-center shrink-0"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || isUploadingImage}
                            className="flex items-center justify-center space-x-2 bg-[#023051] text-white px-6 py-2 rounded-lg hover:bg-[#023051]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto shrink-0"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span className="whitespace-nowrap">{isEditing ? 'Update Resource' : 'Save Resource'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function XIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}
