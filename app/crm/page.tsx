"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Mail, MessageSquare, Search, Download, Trash2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function CRMPage() {
    const [activeTab, setActiveTab] = useState<'newsletter' | 'contact'>('newsletter');
    const [newsletterLeads, setNewsletterLeads] = useState<any[]>([]);
    const [contactMessages, setContactMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (activeTab === 'newsletter') {
                const { data, error } = await supabase
                    .from('leads')
                    .select('*')
                    .eq('source', 'newsletter')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setNewsletterLeads(data || []);
            } else {
                const { data, error } = await supabase
                    .from('contact_messages')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    // Gracefully handle missing table if user hasn't run SQL yet
                    if (error.code === '42P01') { // undefined_table
                        setError("The 'contact_messages' table does not exist. Please run the SQL script provided.");
                    } else {
                        throw error;
                    }
                } else {
                    setContactMessages(data || []);
                }
            }
        } catch (err: any) {
            console.error("Error fetching data:", err);
            setError(err.message || "Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto text-marom-dark">
            <header className="mb-8">
                <h1 className="text-3xl font-serif mb-2">CRM Management</h1>
                <p className="text-gray-500">Manage your newsletter subscribers and contact form messages.</p>
            </header>

            {/* --- TABS --- */}
            <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit mb-8">
                <button
                    onClick={() => setActiveTab('newsletter')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'newsletter'
                            ? "bg-marom-dark text-white shadow-md"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                >
                    <Mail className="w-4 h-4" />
                    <span>Newsletter Subscribers</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs ml-1">
                        {newsletterLeads.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('contact')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'contact'
                            ? "bg-marom-dark text-white shadow-md"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                >
                    <MessageSquare className="w-4 h-4" />
                    <span>Contact Messages</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs ml-1">
                        {contactMessages.length}
                    </span>
                </button>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marom-gold/20 focus:border-marom-gold transition-all w-64"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchData}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors tooltip"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Data</h3>
                        <p className="text-gray-500 max-w-md">{error}</p>
                        <button
                            onClick={fetchData}
                            className="mt-6 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && !error && (
                    <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                        <RefreshCw className="w-8 h-8 animate-spin mb-4 text-marom-gold" />
                        <p>Loading records...</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && ((activeTab === 'newsletter' && newsletterLeads.length === 0) || (activeTab === 'contact' && contactMessages.length === 0)) && (
                    <div className="p-16 flex flex-col items-center justify-center text-center text-gray-400">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            {activeTab === 'newsletter' ? <Mail className="w-8 h-8 opacity-50" /> : <MessageSquare className="w-8 h-8 opacity-50" />}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
                        <p className="max-w-sm">
                            {activeTab === 'newsletter'
                                ? "No one has subscribed to the newsletter yet."
                                : "You haven't received any contact messages yet."}
                        </p>
                    </div>
                )}

                {/* --- NEWSLETTER TABLE --- */}
                {!isLoading && !error && activeTab === 'newsletter' && newsletterLeads.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Email Address</th>
                                    <th className="px-6 py-4">Subscribed On</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {newsletterLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                Subscribed
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {lead.email}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {formatDate(lead.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- CONTACT MESSAGES TABLE --- */}
                {!isLoading && !error && activeTab === 'contact' && contactMessages.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Name / Email</th>
                                    <th className="px-6 py-4">Message</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {contactMessages.map((msg) => (
                                    <tr key={msg.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 align-top">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${msg.status === 'replied'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                    : msg.status === 'read'
                                                        ? 'bg-gray-100 text-gray-600 border-gray-200'
                                                        : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${msg.status === 'replied' ? 'bg-blue-500' : msg.status === 'read' ? 'bg-gray-400' : 'bg-yellow-500'
                                                    }`}></div>
                                                {msg.status || 'New'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="font-medium text-gray-900">{msg.name || 'Unknown'}</div>
                                            <div className="text-sm text-gray-500">{msg.email}</div>
                                        </td>
                                        <td className="px-6 py-4 max-w-sm align-top">
                                            <p className="text-gray-600 text-sm line-clamp-2">{msg.message}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm align-top whitespace-nowrap">
                                            {formatDate(msg.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-right align-top">
                                            <button className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
