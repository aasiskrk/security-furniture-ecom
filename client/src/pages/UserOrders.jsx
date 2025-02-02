import { useState, useEffect } from 'react';
import { FiPackage, FiClock, FiCalendar, FiCreditCard, FiMapPin, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getMyOrdersApi, cancelOrderApi } from '../api/apis';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';

const UserOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingOrders, setCancellingOrders] = useState(new Set());
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getMyOrdersApi();
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
                toast.error('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'processing':
                return 'bg-amber-50 text-amber-700 ring-amber-600/20';
            case 'shipped':
                return 'bg-blue-50 text-blue-700 ring-blue-600/20';
            case 'delivered':
                return 'bg-green-50 text-green-700 ring-green-600/20';
            case 'cancelled':
                return 'bg-red-50 text-red-700 ring-red-600/20';
            default:
                return 'bg-gray-50 text-gray-700 ring-gray-600/20';
        }
    };

    const getPaymentStatusColor = (isPaid) => {
        return isPaid
            ? 'bg-green-50 text-green-700 ring-green-600/20'
            : 'bg-amber-50 text-amber-700 ring-amber-600/20';
    };

    const formatOrderId = (orderId) => {
        return orderId.slice(0, 8).toUpperCase();
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            return;
        }

        try {
            setCancellingOrders(prev => new Set([...prev, orderId]));
            await cancelOrderApi(orderId);
            toast.success('Order cancelled successfully');
            const response = await getMyOrdersApi();
            setOrders(response.data);
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancellingOrders(prev => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    };

    // Add sanitization function
    const sanitizeContent = (content) => {
        if (typeof content === 'string') {
            return DOMPurify.sanitize(content);
        }
        return content;
    };

    if (loading) {
        return (
            <div className="max-w-[2000px] mx-auto px-6 py-12">
                <div className="space-y-8">
                    <div className="animate-pulse">
                        <div className="h-10 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#C4A484]/10 p-8">
                        <div className="space-y-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="flex items-start gap-6">
                                        <div className="w-32 h-32 bg-gray-200 rounded-xl"></div>
                                        <div className="flex-1">
                                            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[2000px] mx-auto px-6 py-12">
            <div className="space-y-10">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">My Orders</h1>
                    <p className="text-lg text-[#8B5E34]">Track and manage your furniture orders</p>
                </div>

                <div className="bg-white rounded-xl border border-[#C4A484]/10 overflow-hidden">
                    {orders.length > 0 ? (
                        <div className="divide-y divide-[#C4A484]/10">
                            {orders.map((order) => (
                                <div key={order._id} className="p-8 hover:bg-[#F8F5F1]/50 transition-colors">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex gap-4">
                                                {order.orderItems.slice(0, 3).map((item, index) => (
                                                    <div key={item._id || index} className="relative">
                                                        <img
                                                            src={`https://localhost:5000${item.product?.pictures[0]}`}
                                                            alt={item.name}
                                                            className="w-32 h-32 object-cover rounded-xl border border-[#C4A484]/10"
                                                        />
                                                        <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded-lg text-sm font-medium text-gray-900">
                                                            x{item.quantity}
                                                        </div>
                                                    </div>
                                                ))}
                                                {order.orderItems.length > 3 && (
                                                    <div className="w-32 h-32 rounded-xl border border-[#C4A484]/10 flex items-center justify-center bg-[#F8F5F1]/50">
                                                        <span className="text-[#8B5E34] font-medium">
                                                            +{order.orderItems.length - 3} more
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-medium text-gray-900">
                                                        {order.orderItems.map(item => item.name).join(', ')}
                                                    </h3>
                                                    <p className="text-[#8B5E34] font-medium">
                                                        Order #: {formatOrderId(order._id)}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-sm text-[#8B5E34]">
                                                    <div className="flex items-center gap-1.5">
                                                        <FiCalendar className="w-4 h-4" />
                                                        <span>Ordered on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <FiCreditCard className="w-4 h-4" />
                                                        <span>{sanitizeContent(order.paymentMethod)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <FiMapPin className="w-4 h-4" />
                                                        <span>{sanitizeContent(order.shippingAddress.city)}, {sanitizeContent(order.shippingAddress.state)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ring-1 ring-inset ${getStatusColor(order.status)}`}>
                                                        <FiPackage className="w-4 h-4" />
                                                        {sanitizeContent(order.status)}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ring-1 ring-inset ${getPaymentStatusColor(order.isPaid)}`}>
                                                        {order.isPaid ? (
                                                            <>
                                                                <FiCheck className="w-4 h-4" />
                                                                Paid
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiX className="w-4 h-4" />
                                                                Payment Pending
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-4">
                                            <div className="text-right">
                                                <p className="text-2xl font-medium text-gray-900 mb-2">
                                                    Nrp {order.totalPrice.toLocaleString()}
                                                </p>
                                                {order.isPaid && (
                                                    <p className="text-sm text-[#8B5E34]">
                                                        Paid on {new Date(order.paidAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    onClick={() => navigate(`/order/${order._id}`)}
                                                    className="px-4 py-2 rounded-lg bg-[#C4A484] text-white hover:bg-[#B39374] transition-colors text-sm font-medium"
                                                >
                                                    View Details
                                                </button>
                                                {(order.status === 'Pending' || order.status === 'Processing') && !order.isPaid && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order._id)}
                                                        disabled={cancellingOrders.has(order._id)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg border border-red-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FiAlertTriangle className="w-4 h-4" />
                                                        {cancellingOrders.has(order._id) ? 'Cancelling...' : 'Cancel Order'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-16 text-center">
                            <FiPackage className="mx-auto h-16 w-16 text-[#C4A484]" />
                            <h3 className="mt-4 text-xl font-medium text-gray-900">No Orders Found</h3>
                            <p className="mt-2 text-[#8B5E34]">You haven't placed any orders yet.</p>
                            <button
                                onClick={() => navigate('/shop')}
                                className="mt-6 px-6 py-3 rounded-lg bg-[#C4A484] text-white hover:bg-[#B39374] transition-colors text-sm font-medium"
                            >
                                Start Shopping
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserOrders; 