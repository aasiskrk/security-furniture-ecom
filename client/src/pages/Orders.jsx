import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/orders/my');
            setOrders(data);
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">No Orders Found</h2>
                <p className="text-gray-600">You haven't placed any orders yet.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h2>
            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-gray-600">Order ID: {order._id}</p>
                                <p className="text-sm text-gray-600">
                                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold text-blue-600">
                                    Total: ${order.totalAmount}
                                </p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm ${order.orderStatus === 'Delivered'
                                        ? 'bg-green-100 text-green-800'
                                        : order.orderStatus === 'Processing'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : order.orderStatus === 'Cancelled'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {order.orderStatus}
                                </span>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-gray-800 mb-2">Items:</h3>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item._id} className="flex items-center">
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div className="ml-4">
                                            <p className="font-medium text-gray-800">{item.product.name}</p>
                                            <p className="text-sm text-gray-600">
                                                Quantity: {item.quantity} × ${item.price}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t mt-4 pt-4">
                            <h3 className="font-semibold text-gray-800 mb-2">Shipping Address:</h3>
                            <p className="text-gray-600">
                                {order.shippingAddress.address}, {order.shippingAddress.city}
                                <br />
                                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                            </p>
                        </div>

                        <div className="border-t mt-4 pt-4 flex justify-between text-sm text-gray-600">
                            <div>
                                <p>Payment Method: {order.paymentMethod}</p>
                                <p>Payment Status: {order.paymentStatus}</p>
                            </div>
                            <div className="text-right">
                                <p>Order Status: {order.orderStatus}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders; 