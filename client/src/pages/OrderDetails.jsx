import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiClock, FiMapPin, FiPhone, FiCheck, FiX, FiCalendar, FiCreditCard, FiTruck, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getOrderByIdApi, cancelOrderApi } from '../api/apis';
import Cookies from 'js-cookie';
import DOMPurify from 'dompurify';

const CART_COOKIE_KEY = 'furniture_cart';

// Add sanitization function
const sanitizeContent = (content) => {
    if (typeof content === 'string') {
        return DOMPurify.sanitize(content);
    }
    return content;
};

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);

    // Check for payment success message
    useEffect(() => {
        const paymentSuccess = sessionStorage.getItem('paymentSuccess');
        if (paymentSuccess) {
            toast.success('Payment successful! Your order has been confirmed.');
            sessionStorage.removeItem('paymentSuccess');
        }
    }, []);

    // Check if coming from eSewa payment
    useEffect(() => {
        const isFromEsewa = location.search.includes('refId');
        if (isFromEsewa) {
            // Clear cart
            Cookies.remove(CART_COOKIE_KEY);
            // Update navbar cart count
            window.dispatchEvent(new Event('cartUpdated'));
            // Show success message
            toast.success('Payment successful! Order has been placed.');
        }
    }, [location]);

    // Add helper function to format order ID
    const formatOrderId = (orderId) => {
        return orderId.slice(0, 8).toUpperCase();
    };

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const response = await getOrderByIdApi(orderId);
                if (!response.data) {
                    throw new Error('No order data received');
                }
                setOrder(response.data);
            } catch (error) {
                console.error('Error fetching order:', error);
                toast.error(error.response?.data?.message || 'Failed to load order details');
                navigate('/orders');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId, navigate]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
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

    // Add function to handle order cancellation
    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            return;
        }

        try {
            setIsCancelling(true);
            await cancelOrderApi(orderId);
            toast.success('Order cancelled successfully');
            // Refresh order details
            const response = await getOrderByIdApi(orderId);
            setOrder(response.data);
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setIsCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-[2000px] mx-auto px-6 py-12">
                <div className="animate-pulse space-y-8">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-xl p-8 border border-[#C4A484]/10">
                                <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                                <div className="space-y-4">
                                    {[1, 2].map(i => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="h-48 bg-gray-200 rounded-xl"></div>
                            <div className="h-48 bg-gray-200 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="max-w-[2000px] mx-auto px-6 py-12">
            <div className="space-y-8">
                <div>
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center gap-2 text-[#8B5E34] hover:text-[#C4A484] transition-colors mb-6"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                        <span>Back to Orders</span>
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-gray-900">Order Details</h1>
                            <p className="mt-1 text-[#8B5E34]">Order #: {formatOrderId(order._id)}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
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
                            {/* Cancel Order Button */}
                            {(order.status === 'Pending' || order.status === 'Processing') && !order.isPaid && (
                                <button
                                    onClick={handleCancelOrder}
                                    disabled={isCancelling}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg border border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiAlertTriangle className="w-4 h-4" />
                                    {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Order Items */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-xl p-8 border border-[#C4A484]/10">
                            <h2 className="text-xl font-medium text-gray-900 mb-6">Order Items</h2>
                            <div className="space-y-6">
                                {order.orderItems.map((item, index) => (
                                    <div key={index} className="flex gap-6">
                                        <img
                                            src={`https://localhost:5000${item.product?.pictures[0]}`}
                                            alt={sanitizeContent(item.name)}
                                            className="w-24 h-24 object-cover rounded-xl border border-[#C4A484]/10"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/placeholder.png';
                                            }}
                                        />
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-gray-900">{sanitizeContent(item.name)}</h3>
                                            <div className="mt-1 space-y-1 text-sm text-[#8B5E34]">
                                                <p>Color: {item.color}</p>
                                                <p>Quantity: {item.quantity}</p>
                                                <p>Price: Nrp {item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">
                                                Nrp {(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-8 border border-[#C4A484]/10">
                            <h2 className="text-xl font-medium text-gray-900 mb-6">Delivery Information</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <FiMapPin className="w-5 h-5 text-[#8B5E34] mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">{sanitizeContent(order.shippingAddress.fullName)}</p>
                                        <p className="text-[#8B5E34]">{sanitizeContent(order.shippingAddress.address)}</p>
                                        <p className="text-[#8B5E34]">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pinCode}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiPhone className="w-5 h-5 text-[#8B5E34]" />
                                    <p className="text-[#8B5E34]">{sanitizeContent(order.shippingAddress.phone)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl p-8 border border-[#C4A484]/10">
                            <h2 className="text-xl font-medium text-gray-900 mb-6">Order Summary</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between text-[#8B5E34]">
                                    <span>Subtotal</span>
                                    <span>Nrp {order.totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[#8B5E34]">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="pt-4 border-t border-[#C4A484]/10">
                                    <div className="flex justify-between text-lg font-medium text-gray-900">
                                        <span>Total</span>
                                        <span>Nrp {order.totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-8 border border-[#C4A484]/10">
                            <h2 className="text-xl font-medium text-gray-900 mb-6">Payment Information</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-[#8B5E34]">
                                    <FiCreditCard className="w-5 h-5" />
                                    <span>{sanitizeContent(order.paymentMethod)}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[#8B5E34]">
                                    <FiCheck className="w-5 h-5" />
                                    <span>Payment Status: {order.isPaid ? 'Paid' : 'Pending'}</span>
                                </div>
                                {order.isPaid && (
                                    <div className="flex items-center gap-3 text-[#8B5E34]">
                                        <FiCalendar className="w-5 h-5" />
                                        <span>Paid on {new Date(order.paidAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-8 border border-[#C4A484]/10">
                            <h2 className="text-xl font-medium text-gray-900 mb-6">Order Timeline</h2>
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#C4A484] flex items-center justify-center">
                                        <FiClock className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Order Placed</p>
                                        <p className="text-sm text-[#8B5E34]">{new Date(order.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</p>
                                    </div>
                                </div>

                                {order.status === 'shipped' && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                            <FiTruck className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Order Shipped</p>
                                            <p className="text-sm text-[#8B5E34]">Your order is on its way</p>
                                        </div>
                                    </div>
                                )}

                                {order.isDelivered && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                            <FiPackage className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Order Delivered</p>
                                            <p className="text-sm text-[#8B5E34]">{new Date(order.deliveredAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails; 