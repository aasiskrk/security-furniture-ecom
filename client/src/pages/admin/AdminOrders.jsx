import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FiEye, FiEdit2, FiSearch, FiDollarSign, FiPhone, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getAllOrdersApi, updateOrderStatusApi, updatePaymentStatusApi } from '../../api/apis';
import DOMPurify from 'dompurify';

const AdminOrders = () => {
    const [activeTab, setActiveTab] = useState('active');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Fetch orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await getAllOrdersApi();
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

    // Separate unpaid delivered orders
    const unpaidDeliveredOrders = orders.filter(order => {
        // Apply search filter if exists
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                order._id.toLowerCase().includes(searchLower) ||
                (order.user?.name?.toLowerCase().includes(searchLower) || false) ||
                (order.user?.email?.toLowerCase().includes(searchLower) || false) ||
                order.orderItems.some(item => item.name.toLowerCase().includes(searchLower));
            if (!matchesSearch) return false;
        }

        // Apply payment method filter if selected
        if (paymentFilter !== 'all') {
            const paymentMethod = paymentFilter === 'cod' ? 'COD' : 'eSewa';
            if (order.paymentMethod !== paymentMethod) return false;
        }

        // Only show delivered but unpaid orders
        return order.status === 'Delivered' && !order.isPaid;
    });

    // Filter orders based on active tab and filters
    const filteredOrders = orders.filter(order => {
        // Apply search filter
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                order._id.toLowerCase().includes(searchLower) ||
                (order.user?.name?.toLowerCase().includes(searchLower) || false) ||
                (order.user?.email?.toLowerCase().includes(searchLower) || false) ||
                order.orderItems.some(item => item.name.toLowerCase().includes(searchLower));
            if (!matchesSearch) return false;
        }

        // Apply payment method filter
        if (paymentFilter !== 'all') {
            const paymentMethod = paymentFilter === 'cod' ? 'COD' : 'eSewa';
            if (order.paymentMethod !== paymentMethod) return false;
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            if (order.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
        }

        // Filter based on active/past tab
        if (activeTab === 'active') {
            // For active tab:
            // 1. Exclude cancelled orders
            // 2. Exclude delivered orders that are paid
            // 3. Show orders that are in progress (not delivered)
            if (order.status === 'Cancelled') return false;
            if (order.status === 'Delivered' && order.isPaid) return false;
            return true;
        } else {
            // For past tab:
            // Include orders that are either:
            // 1. Cancelled
            // 2. Delivered AND Paid
            return order.status === 'Cancelled' || (order.status === 'Delivered' && order.isPaid);
        }
    });

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'processing':
                return 'bg-amber-50 text-amber-700';
            case 'shipped':
                return 'bg-blue-50 text-blue-700';
            case 'delivered':
                return 'bg-green-50 text-green-700';
            case 'cancelled':
                return 'bg-red-50 text-red-700';
            default:
                return 'bg-gray-50 text-gray-700';
        }
    };

    const getPaymentStatusColor = (isPaid) => {
        return isPaid ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700';
    };

    const formatOrderId = (orderId) => {
        return orderId.slice(0, 8).toUpperCase();
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await updateOrderStatusApi(orderId, newStatus);
            // Update orders list
            setOrders(orders.map(order =>
                order._id === orderId
                    ? { ...order, status: newStatus, isDelivered: newStatus === 'Delivered' }
                    : order
            ));
            toast.success('Order status updated successfully');
            setSelectedOrder(null);
            setIsEditMode(false);
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
        }
    };

    const handleUpdatePayment = async (orderId) => {
        try {
            const orderToUpdate = orders.find(o => o._id === orderId);
            if (!orderToUpdate) return;

            // Only allow payment update if order is delivered
            if (orderToUpdate.status !== 'Delivered') {
                toast.error('Order must be delivered before marking as paid');
                return;
            }

            // Toggle payment status
            const updatedOrder = {
                ...orderToUpdate,
                isPaid: !orderToUpdate.isPaid,
                paidAt: !orderToUpdate.isPaid ? new Date().toISOString() : null
            };

            // Update in the backend
            await updatePaymentStatusApi(orderId, { isPaid: !orderToUpdate.isPaid });

            // Update local state
            setOrders(orders.map(order =>
                order._id === orderId ? updatedOrder : order
            ));
            toast.success('Payment status updated successfully');

            // Close the modal if it's open
            setSelectedOrder(null);
            setIsEditMode(false);
        } catch (error) {
            console.error('Error updating payment status:', error);
            toast.error('Failed to update payment status');
        }
    };

    // Add sanitization for order details, customer info, etc.
    const sanitizeContent = (content) => {
        if (typeof content === 'string') {
            return DOMPurify.sanitize(content);
        }
        return content;
    };

    const OrderDetailsModal = ({ order, onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-[#C4A484]/10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900">Order #{formatOrderId(order._id)}</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-medium">
                            ×
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Order Items */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Items */}
                            <div className="bg-white rounded-xl border border-[#C4A484]/10 p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
                                <div className="space-y-4">
                                    {order.orderItems.map((item, index) => (
                                        <div key={index} className="flex gap-4 p-4 rounded-lg bg-[#F8F5F1]/50">
                                            <img
                                                src={`https://localhost:5000${item.product?.pictures[0]}`}
                                                alt={item.name}
                                                className="w-24 h-24 object-cover rounded-lg border border-[#C4A484]/10"
                                            />
                                            <div className="flex-1">
                                                <h4 className="text-base font-medium text-gray-900">{item.name}</h4>
                                                <div className="mt-1 space-y-1 text-sm text-gray-600">
                                                    <p>Color: <span className="text-gray-900">{item.color}</span></p>
                                                    <p>Quantity: <span className="text-gray-900">{item.quantity}</span></p>
                                                    <p>Price: <span className="text-gray-900">Nrp {item.price.toLocaleString()}</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-6 border-t border-[#C4A484]/10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-medium text-gray-900">Total</span>
                                        <span className="text-lg font-medium text-gray-900">Nrp {order.totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Order Info */}
                        <div className="space-y-6">
                            {/* Customer Info */}
                            <div className="bg-white rounded-xl border border-[#C4A484]/10 p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer</h3>
                                <div className="space-y-2">
                                    <p className="text-base font-medium text-gray-900">{sanitizeContent(order.user?.name || 'Deleted User')}</p>
                                    <p className="text-sm text-gray-600">{sanitizeContent(order.user?.email || 'N/A')}</p>
                                </div>
                            </div>

                            {/* Order Status */}
                            <div className="bg-white rounded-xl border border-[#C4A484]/10 p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Status</p>
                                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                                            {sanitizeContent(order.status)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Payment</p>
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(order.isPaid)}`}>
                                                {sanitizeContent(order.isPaid ? 'Paid' : 'Pending')}
                                            </span>
                                            <span className="text-sm text-gray-600">Method: {sanitizeContent(order.paymentMethod)}</span>
                                            {order.isPaid && (
                                                <span className="text-sm text-gray-600">
                                                    Paid on {new Date(order.paidAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-xl border border-[#C4A484]/10 p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p className="font-medium text-gray-900">{sanitizeContent(order.shippingAddress.fullName)}</p>
                                    <p className="flex items-center gap-2">
                                        <FiPhone className="w-4 h-4" />
                                        {sanitizeContent(order.shippingAddress.phone)}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <FiMapPin className="w-4 h-4" />
                                        {sanitizeContent(order.shippingAddress.address)}
                                    </p>
                                    <p className="ml-6">{sanitizeContent(order.shippingAddress.city)}, {sanitizeContent(order.shippingAddress.state)} {sanitizeContent(order.shippingAddress.pinCode)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-[#F8F5F1]/50 px-6 py-4 flex justify-end border-t border-[#C4A484]/10">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-[#C4A484]/20 rounded-lg text-sm text-gray-600 hover:bg-[#C4A484]/10 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    const EditOrderModal = ({ order, onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full">
                <div className="p-6 border-b border-[#C4A484]/10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900">Edit Order</h2>
                            <p className="mt-1 text-sm text-gray-500">#{formatOrderId(order._id)}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-medium">
                            ×
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                        <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none"
                        >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <p className="mt-2 text-sm text-gray-500">Current status: <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{sanitizeContent(order.status)}</span></p>
                    </div>

                    {/* Payment Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-[#F8F5F1]/50">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Current Status: <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.isPaid)}`}>
                                    {sanitizeContent(order.isPaid ? 'Paid' : 'Pending')}
                                </span></p>
                                <p className="text-sm text-gray-500 mt-1">Method: {sanitizeContent(order.paymentMethod)}</p>
                            </div>
                            <button
                                onClick={() => handleUpdatePayment(order._id)}
                                className="px-4 py-2 bg-[#C4A484] text-white rounded-lg text-sm hover:bg-[#B39374] transition-colors"
                            >
                                {order.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-[#F8F5F1]/50 px-6 py-4 flex justify-end space-x-4 border-t border-[#C4A484]/10">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-[#C4A484]/20 rounded-lg text-sm text-gray-600 hover:bg-[#C4A484]/10 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <AdminLayout>
                <div className="space-y-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    {/* Add more loading skeleton UI here */}
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 border-b border-[#C4A484]/10">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`pb-4 px-4 text-sm font-medium ${activeTab === 'active'
                            ? 'border-b-2 border-[#C4A484] text-[#8B5E34]'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Active Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`pb-4 px-4 text-sm font-medium ${activeTab === 'past'
                            ? 'border-b-2 border-[#C4A484] text-[#8B5E34]'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Past Orders
                    </button>
                </div>

                {/* Filters */}
                <div className="space-y-4 bg-white">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-md relative">
                            <FiSearch className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none bg-white"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="px-4 py-3 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none bg-white"
                            >
                                <option value="all">All Payment Types</option>
                                <option value="cod">COD</option>
                                <option value="esewa">eSewa</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Unpaid Delivered Orders Section (only in active tab) */}
                {activeTab === 'active' && unpaidDeliveredOrders.length > 0 && (
                    <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 mb-6">
                        <h2 className="text-lg font-medium text-amber-800 mb-4">Delivered Orders Pending Payment</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-amber-100/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-amber-800">Order ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-amber-800">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-amber-800">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-amber-800">Payment Method</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-amber-800">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-amber-200/30">
                                    {unpaidDeliveredOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-amber-100/30 transition-colors">
                                            <td className="px-6 py-4 text-sm text-amber-900">
                                                #{formatOrderId(order._id)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-amber-900">{sanitizeContent(order.user?.name || 'Deleted User')}</div>
                                                <div className="text-xs text-amber-700">{sanitizeContent(order.user?.email || 'N/A')}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-amber-900">
                                                Nrp {order.totalPrice.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-amber-900">
                                                {sanitizeContent(order.paymentMethod)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setIsEditMode(false);
                                                        }}
                                                        className="text-amber-700 hover:text-amber-900 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <FiEye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setIsEditMode(true);
                                                        }}
                                                        className="text-amber-700 hover:text-amber-900 transition-colors"
                                                        title="Edit Order"
                                                    >
                                                        <FiEdit2 className="w-5 h-5" />
                                                    </button>
                                                    {order.status === 'Delivered' && !order.isPaid && (
                                                        <button
                                                            onClick={() => handleUpdatePayment(order._id)}
                                                            className={`text-[#C4A484] hover:text-[#8B5E34] transition-colors`}
                                                            title="Mark as Paid"
                                                        >
                                                            <FiDollarSign className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Main Orders Table */}
                <div className="bg-white rounded-xl border border-[#C4A484]/10 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#F8F5F1]">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Order ID</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Customer</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Items</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Total</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Payment</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#C4A484]/10">
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-[#F8F5F1]/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        #{formatOrderId(order._id)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{sanitizeContent(order.user?.name || 'Deleted User')}</div>
                                                <div className="text-sm text-gray-500">{sanitizeContent(order.user?.email || 'N/A')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {order.orderItems.length} item(s)
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        Nrp {order.totalPrice.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.isPaid)}`}>
                                            {sanitizeContent(order.isPaid ? 'Paid' : 'Pending')} ({sanitizeContent(order.paymentMethod)})
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                            {sanitizeContent(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setIsEditMode(false);
                                                }}
                                                className="text-[#C4A484] hover:text-[#8B5E34] transition-colors"
                                                title="View Details"
                                            >
                                                <FiEye className="w-5 h-5" />
                                            </button>
                                            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setIsEditMode(true);
                                                    }}
                                                    className="text-[#C4A484] hover:text-[#8B5E34] transition-colors"
                                                    title="Edit Order"
                                                >
                                                    <FiEdit2 className="w-5 h-5" />
                                                </button>
                                            )}
                                            {order.status === 'Delivered' && !order.isPaid && (
                                                <button
                                                    onClick={() => handleUpdatePayment(order._id)}
                                                    className="text-[#C4A484] hover:text-[#8B5E34] transition-colors"
                                                    title="Mark as Paid"
                                                >
                                                    <FiDollarSign className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {selectedOrder && !isEditMode && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => {
                        setSelectedOrder(null);
                        setIsEditMode(false);
                    }}
                />
            )}
            {selectedOrder && isEditMode && (
                <EditOrderModal
                    order={selectedOrder}
                    onClose={() => {
                        setSelectedOrder(null);
                        setIsEditMode(false);
                    }}
                />
            )}
        </AdminLayout>
    );
};

export default AdminOrders; 