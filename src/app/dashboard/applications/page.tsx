'use client';

import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import axios from '@/lib/axios';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Application {
    id: string;
    fullName: string;
    mobileNumber: string;
    email?: string;
    height: string;
    weight: string;
    age: string;
    goal: string;
    selectedProgram?: string;
    paymentStatus?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpayRefundId?: string;
    refundDetails?: any;
    amount?: string;
    currency?: string;
    createdAt: string;
}

export default function ApplicationsList() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [itemToRefund, setItemToRefund] = useState<string | null>(null);
    const [refundDetailsToShow, setRefundDetailsToShow] = useState<Application | null>(null);
    const [paymentDetailsToShow, setPaymentDetailsToShow] = useState<Application | null>(null);
    const [isRefunding, setIsRefunding] = useState(false);

    const fetchApplications = async () => {
        try {
            const response = await axios.get('/applications');
            setApplications(response.data);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await axios.delete(`/applications/${itemToDelete}`);
            fetchApplications();
        } catch (error) {
            console.error('Failed to delete application:', error);
        } finally {
            setItemToDelete(null);
        }
    };

    const confirmRefund = async () => {
        if (!itemToRefund) return;
        setIsRefunding(true);
        try {
            const res = await axios.post(`/applications/${itemToRefund}/refund`);
            setItemToRefund(null);
            fetchApplications();
            // Automatically show the new refund details on a successful manual trigger
            if (res.data && res.data.application) {
                setRefundDetailsToShow(res.data.application);
            }
        } catch (error: any) {
            console.error('Failed to process refund:', error);
            alert(`Refund Failed: ${error.response?.data?.message || 'Please check Razorpay Dashboard.'}`);
            setItemToRefund(null);
        } finally {
            setIsRefunding(false);
        }
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
    };

    const handleRefund = (id: string) => {
        setItemToRefund(id);
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Applications</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage program applications from users.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats (H/W/A)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goal / Program</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 z-10 bg-gray-50 shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {applications.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="font-medium text-gray-900">{item.fullName}</div>
                                    <div className="text-gray-500 text-xs">{item.mobileNumber}</div>
                                    <div className="text-gray-500 text-xs">{item.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.height} / {item.weight} / {item.age}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="font-medium">{item.goal}</div>
                                    {item.selectedProgram && (
                                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mt-1">
                                            {item.selectedProgram}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${item.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                                        item.paymentStatus === 'REFUNDED' ? 'bg-orange-100 text-orange-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {item.paymentStatus || 'PENDING'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 z-10 bg-white group-hover:bg-gray-50 transition-colors shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)] space-x-2">
                                    {item.paymentStatus === 'SUCCESS' && (
                                        <>
                                            <button
                                                onClick={() => setPaymentDetailsToShow(item)}
                                                className="text-blue-600 hover:text-blue-900 px-3 py-1.5 rounded-md hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors text-xs font-semibold"
                                            >
                                                View Payment
                                            </button>
                                            <button
                                                onClick={() => handleRefund(item.id)}
                                                className="text-orange-600 hover:text-orange-900 px-3 py-1.5 rounded-md hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-colors text-xs font-semibold"
                                            >
                                                Refund
                                            </button>
                                        </>
                                    )}
                                    {item.paymentStatus === 'REFUNDED' && (
                                        <button
                                            onClick={() => setRefundDetailsToShow(item)}
                                            className="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-colors text-xs font-semibold"
                                        >
                                            View Refund
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {applications.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No applications found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmDialog
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Application"
                message="Are you sure you want to delete this application? This action cannot be undone."
                confirmText="Delete"
            />

            <ConfirmDialog
                isOpen={!!itemToRefund}
                onClose={() => setItemToRefund(null)}
                onConfirm={confirmRefund}
                title="Refund Payment"
                message="Are you sure you want to refund this application? The funds will be returned to the customer's original payment method via Razorpay within 5-7 business days. This action cannot be undone."
                confirmText="Process Refund"
                isLoading={isRefunding}
            />

            {/* Refund Details Modal */}
            {refundDetailsToShow && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900 text-lg">Refund Details</h3>
                            <button
                                onClick={() => setRefundDetailsToShow(null)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4 text-sm">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium text-gray-500">Applicant:</span>
                                <span className="text-gray-900 font-semibold">{refundDetailsToShow.fullName}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium text-gray-500">Refund ID:</span>
                                <span className="text-gray-900 font-mono text-xs">{refundDetailsToShow.razorpayRefundId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium text-gray-500">Refund Amount:</span>
                                <span className="text-gray-900 font-semibold cursor-help" title="Amounts shown in minimal currency units if extracted directly from the payload.">
                                    {refundDetailsToShow.refundDetails?.currency || ''} {refundDetailsToShow.refundDetails?.amount ? (refundDetailsToShow.refundDetails.amount / 100).toFixed(2) : '---'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium text-gray-500">Original Payment ID:</span>
                                <span className="text-gray-900 font-mono text-xs">{refundDetailsToShow.refundDetails?.payment_id || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium text-gray-500">Refund Status:</span>
                                <span className={`font-semibold capitalize ${refundDetailsToShow.refundDetails?.status === 'processed' ? 'text-green-600' : 'text-orange-600'}`}>
                                    {refundDetailsToShow.refundDetails?.status || 'Unknown'}
                                </span>
                            </div>
                            {refundDetailsToShow.refundDetails?.notes && (
                                <div className="pt-2 text-xs text-center text-gray-400">
                                    Funds will reflect in the customer's account based on the processing speed.
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setRefundDetailsToShow(null)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-semibold transition-colors"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Details Modal */}
            {paymentDetailsToShow && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900 text-lg">Payment Details</h3>
                            <button
                                onClick={() => setPaymentDetailsToShow(null)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4 text-sm">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium text-gray-500">Applicant:</span>
                                <span className="text-gray-900 font-semibold">{paymentDetailsToShow.fullName}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium text-gray-500">Amount Paid:</span>
                                <span className="text-gray-900 font-semibold">
                                    {paymentDetailsToShow.currency || ''} {paymentDetailsToShow.amount || '---'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium text-gray-500">Program Selected:</span>
                                <span className="text-gray-900 font-semibold">
                                    {paymentDetailsToShow.selectedProgram || 'General Consultation'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium text-gray-500">Order ID (Razorpay):</span>
                                <span className="text-gray-900 font-mono text-xs">{paymentDetailsToShow.razorpayOrderId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium text-gray-500">Payment ID (Razorpay):</span>
                                <span className="text-gray-900 font-mono text-xs">{paymentDetailsToShow.razorpayPaymentId || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setPaymentDetailsToShow(null)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-semibold transition-colors"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
