import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiClock, FiMapPin, FiPhone } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getOrderByIdApi } from '../api/apis';
import Cookies from 'js-cookie';

const CART_COOKIE_KEY = 'furniture_cart';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

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
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ring-1 ring-inset ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
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
                                            src={`http://localhost:5000${item.product?.pictures[0]}`}
                                            alt={item.name}
                                            className="w-24 h-24 object-cover rounded-xl border border-[#C4A484]/10"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/placeholder.png';
                                            }}
                                        />
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                            <div className="mt-1 space-y-1 text-sm text-[#8B5E34]">
                                                <p>Color: {item.color}</p>
                                                <p>Quantity: {item.quantity}</p>
                                                <p>Price: Rp {item.price.toLocaleString()}</p>
                                            </div>
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
                                        <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                                        <p className="text-[#8B5E34]">{order.shippingAddress.address}</p>
                                        <p className="text-[#8B5E34]">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pinCode}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiPhone className="w-5 h-5 text-[#8B5E34]" />
                                    <p className="text-[#8B5E34]">{order.shippingAddress.phone}</p>
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
                                    <span>Rp {order.totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[#8B5E34]">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="pt-4 border-t border-[#C4A484]/10">
                                    <div className="flex justify-between text-lg font-medium text-gray-900">
                                        <span>Total</span>
                                        <span>Rp {order.totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-8 border border-[#C4A484]/10">
                            <h2 className="text-xl font-medium text-gray-900 mb-6">Payment Information</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between text-[#8B5E34]">
                                    <span>Payment Method</span>
                                    <span>{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between text-[#8B5E34]">
                                    <span>Payment Status</span>
                                    <span>{order.isPaid ? 'Paid' : 'Pending'}</span>
                                </div>
                                {order.isPaid && (
                                    <div className="flex justify-between text-[#8B5E34]">
                                        <span>Paid At</span>
                                        <span>{new Date(order.paidAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-8 border border-[#C4A484]/10">
                            <h2 className="text-xl font-medium text-gray-900 mb-6">Order Timeline</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <FiClock className="w-5 h-5 text-[#8B5E34]" />
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
                                {order.isDelivered && (
                                    <div className="flex items-center gap-3">
                                        <FiPackage className="w-5 h-5 text-[#8B5E34]" />
                                        <div>
                                            <p className="font-medium text-gray-900">Delivered</p>
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