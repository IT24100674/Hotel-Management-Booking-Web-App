import React, { useState, useEffect } from 'react';
import { DownloadCloud, TrendingUp, Calendar, DollarSign, Loader2, FileText, CreditCard } from 'lucide-react';

const FinanceDashboard = () => {
    const [reportType, setReportType] = useState('monthly'); // 'weekly', 'monthly', 'yearly'
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData(reportType);
    }, [reportType]);

    const fetchData = async (type) => {
        setLoading(true);
        setError(null);
        try {
            // Using absolute URL to reach the backend
            const response = await fetch(`http://localhost:5000/api/finance/${type}`);
            if (!response.ok) {
                throw new Error('Failed to fetch finance data');
            }
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCSV = () => {
        if (!data || !data.raw || data.raw.length === 0) return;

        // Create CSV Header for Detailed Report
        const headers = ['Date', 'Transaction ID', 'Method', 'Status', 'Amount ($)'];

        // Create CSV Rows
        const rows = data.raw.map(payment => [
            new Date(payment.created_at).toLocaleString().replace(/,/g, ''),
            payment.transaction_id || 'N/A',
            payment.payment_method || 'N/A',
            payment.payment_status || 'N/A',
            Number(payment.amount).toFixed(2)
        ]);

        // Combine Header and Rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create Blob and Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${reportType}_detailed_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-slate-900 mb-2 flex items-center gap-3">
                        <TrendingUp className="text-amber-500" size={32} />
                        Finance Overview
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Track and manage your revenue reports effectively.
                    </p>
                </div>
                {/* Download Button */}
                <button
                    onClick={handleDownloadCSV}
                    disabled={!data || loading || data.raw?.length === 0}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <DownloadCloud size={20} />
                    Download {reportType} Report
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white p-2 border border-slate-200 rounded-2xl inline-flex mb-8 shadow-sm">
                {['weekly', 'monthly', 'yearly'].map(type => (
                    <button
                        key={type}
                        onClick={() => setReportType(type)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-300 ${reportType === type
                            ? 'bg-slate-900 text-amber-400 shadow-md'
                            : 'text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-amber-500">
                    <Loader2 size={48} className="animate-spin mb-4" />
                    <p className="font-medium text-slate-500">Generating report...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-200">
                    <p className="font-bold">Error loading data</p>
                    <p className="text-sm">{error}</p>
                    <p className="text-sm mt-2 text-red-500">Make sure the backend server and database are running and accessible.</p>
                </div>
            ) : data ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                                <DollarSign size={32} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue ({reportType})</p>
                                <p className="text-4xl font-playfair font-bold text-slate-900">
                                    ${data.summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                <Calendar size={32} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Payments ({reportType})</p>
                                <p className="text-4xl font-playfair font-bold text-slate-900">
                                    {data.summary.totalPayments.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* All Payments Table (Raw Data) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <CreditCard size={20} className="text-slate-600" />
                                <h2 className="text-lg font-bold text-slate-800">All Payments ({reportType})</h2>
                            </div>
                            <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {data.summary.totalPayments} Records
                            </span>
                        </div>
                        {(!data.raw || data.raw.length === 0) ? (
                            <div className="p-12 text-center flex flex-col items-center">
                                <DollarSign size={40} className="text-slate-200 mb-3" />
                                <p className="text-slate-500 font-medium">No recorded payments found for this period.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Method</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.raw.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-8 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                                                    {new Date(item.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                                                    {item.transaction_id || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {item.payment_method || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.payment_status?.toLowerCase() === 'paid'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {item.payment_status || 'Unknown'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 text-right font-bold text-slate-900">
                                                    ${Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default FinanceDashboard;
