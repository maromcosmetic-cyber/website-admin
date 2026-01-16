"use client";

import { useEffect, useState } from 'react';
import { Package, Search, RefreshCw, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';

interface Order {
    id: string;
    customer_id: string;
    status: 'pending' | 'paid' | 'shipped' | 'cancelled';
    total_amount: number;
    items: any[];
    stripe_session_id?: string;
    shipping_address?: any;
    created_at: string;
    customers?: {
        email: string;
        full_name?: string;
    };
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/orders');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch orders');
            }
            const data = await response.json();
            setOrders(data);
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            setError(err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const response = await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            // Refresh orders list
            await fetchOrders();
        } catch (err: any) {
            alert('Failed to update order status: ' + err.message);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatStatus = (status: string) => {
        const statusConfig = {
            pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
            paid: { label: 'Paid', icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
            shipped: { label: 'Shipped', icon: Truck, color: 'text-green-600 bg-green-50' },
            cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600 bg-red-50' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.color}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    const filteredOrders = orders.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        return (
            order.id.toLowerCase().includes(searchLower) ||
            order.customers?.email?.toLowerCase().includes(searchLower) ||
            order.customers?.full_name?.toLowerCase().includes(searchLower) ||
            order.status.toLowerCase().includes(searchLower)
        );
    });

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center min-h-screen text-[#015030]">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Loading orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full">
                <div className="bg-red-50 border border-red-200 rounded-3xl p-8 mb-6">
                    <h3 className="text-red-800 font-bold mb-2">Error Loading Orders</h3>
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                    {error.includes('table') || error.includes('schema') ? (
                        <div className="bg-red-100 p-4 rounded-xl">
                            <p className="text-red-800 text-sm font-semibold mb-2">To fix this issue:</p>
                            <ol className="text-red-700 text-sm list-decimal list-inside space-y-1">
                                <li>Open your Supabase SQL Editor</li>
                                <li>Run the SQL script: <code className="bg-red-200 px-2 py-1 rounded">marom-backend/fix_orders_permissions.sql</code></li>
                                <li>Refresh this page after running the script</li>
                            </ol>
                        </div>
                    ) : null}
                    <button
                        onClick={fetchOrders}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full text-[#015030]">
            <header className="mb-12 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-serif font-semibold">Orders</h1>
                    <p className="text-sm tracking-widest uppercase text-[#015030]/60 mt-2">
                        Manage customer orders ({filteredOrders.length} total)
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="px-6 py-3 bg-[#015030] text-[#FDFBF7] rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#015030]/90 transition-colors flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </header>

            {/* Search */}
            <div className="mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#015030]/40" />
                    <input
                        type="text"
                        placeholder="Search by order ID, email, or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-[#015030]/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FDB723] focus:border-transparent"
                    />
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 shadow-xl border border-[#015030]/5 text-center">
                    <Package className="w-16 h-16 text-[#015030]/20 mx-auto mb-4" />
                    <p className="text-[#015030]/60 text-lg">No orders found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-3xl p-8 shadow-lg border border-[#015030]/5 hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <h3 className="text-xl font-serif font-semibold">Order #{order.id.slice(0, 8)}</h3>
                                        {formatStatus(order.status)}
                                    </div>
                                    <div className="text-sm text-[#015030]/60 space-y-1">
                                        <p>
                                            <strong>Customer:</strong>{' '}
                                            {order.customers?.full_name || 'N/A'} ({order.customers?.email || 'N/A'})
                                        </p>
                                        <p>
                                            <strong>Date:</strong> {formatDate(order.created_at)}
                                        </p>
                                        {order.shipping_address && (
                                            <p>
                                                <strong>Ship to:</strong>{' '}
                                                {order.shipping_address.address_line1}, {order.shipping_address.city}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-serif font-bold text-[#015030] mb-2">
                                        ${parseFloat(order.total_amount.toString()).toFixed(2)}
                                    </div>
                                    {order.stripe_session_id && (
                                        <p className="text-xs text-[#015030]/40">Stripe: {order.stripe_session_id.slice(0, 20)}...</p>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-6 border-t border-[#015030]/10 pt-6">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-[#015030]/60 mb-3">Items</h4>
                                <div className="space-y-2">
                                    {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between text-sm">
                                            <span>{item.name || item.product_name || 'Product'} × {item.quantity || 1}</span>
                                            <span className="text-[#015030]/60">
                                                ${item.price ? (parseFloat(item.price) * (item.quantity || 1)).toFixed(2) : '0.00'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Status Update */}
                            <div className="flex items-center gap-3 pt-4 border-t border-[#015030]/10">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#015030]/60">Update Status:</span>
                                <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                    className="px-4 py-2 border border-[#015030]/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB723]"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
