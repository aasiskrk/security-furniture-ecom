import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/orders/admin/all');
            setOrders(data);
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/orders/admin/${orderId}/status`, {
                orderStatus: status
            });
            toast.success('Order status updated');
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    const updatePaymentStatus = async (orderId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/orders/admin/${orderId}/payment`, {
                paymentStatus: status
            });
            toast.success('Payment status updated');
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update payment status');
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.orderStatus.toLowerCase() === filter;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Manage Orders</h1>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border rounded-md p-2"
                >
                    <option value="all">All Orders</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Order Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Payment Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr key={order._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order._id.slice(-6)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {order.user.name}
                                        </div>
                                        <div className="text-sm text-gray-500">{order.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        ${order.totalAmount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={order.orderStatus}
                                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                            className="border rounded-md p-1"
                                        >
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={order.paymentStatus}
                                            onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                                            className="border rounded-md p-1"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Failed">Failed</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">
                                Order #{selectedOrder._id.slice(-6)}
                            </h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
                                <p>Name: {selectedOrder.user.name}</p>
                                <p>Email: {selectedOrder.user.email}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
                                <p>{selectedOrder.shippingAddress.address}</p>
                                <p>
                                    {selectedOrder.shippingAddress.city},{' '}
                                    {selectedOrder.shippingAddress.postalCode}
                                </p>
                                <p>{selectedOrder.shippingAddress.country}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2">Order Items</h3>
                                <div className="space-y-4">
                                    {selectedOrder.items.map((item) => (
                                        <div
                                            key={item._id}
                                            className="flex items-center border-b pb-4"
                                        >
                                            <img
                                                src={item.product.image}
                                                alt={item.product.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            <div className="ml-4 flex-1">
                                                <h4 className="font-medium">{item.product.name}</h4>
                                                <p className="text-gray-600">
                                                    {item.quantity} × ${item.price}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    ${item.quantity * item.price}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total Amount</span>
                                    <span>${selectedOrder.totalAmount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders; 