import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FiEye, FiEdit2, FiSearch } from 'react-icons/fi';

const AdminOrders = () => {
    const [activeTab, setActiveTab] = useState('active');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Sample data for active orders
    const activeOrders = [
        {
            id: 'ORD-2501',
            customer: {
                name: 'John Doe',
                email: 'john@example.com',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1'
            },
            product: 'Modern Leather Sofa',
            price: 2499999,
            payment: 'Paid',
            status: 'Processing',
            date: '2024-02-20',
            address: '123 Main St, New York, NY 10001',
            items: [
                { name: 'Modern Leather Sofa', quantity: 1, price: 2499999 }
            ]
        },
        {
            id: 'ORD-2502',
            customer: {
                name: 'Jane Smith',
                email: 'jane@example.com',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1'
            },
            product: 'Dining Set + Chairs',
            price: 1899999,
            payment: 'COD',
            status: 'Shipped',
            date: '2024-02-19',
            address: '456 Oak Ave, Los Angeles, CA 90001',
            items: [
                { name: 'Dining Table', quantity: 1, price: 1499999 },
                { name: 'Dining Chairs (Set of 4)', quantity: 1, price: 399999 }
            ]
        }
    ];

    // Sample data for past orders
    const pastOrders = [
        {
            id: 'ORD-2498',
            customer: {
                name: 'Sarah Wilson',
                email: 'sarah@example.com',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1'
            },
            product: 'Bedroom Set',
            price: 3499999,
            payment: 'Paid',
            status: 'Delivered',
            date: '2024-02-15',
            address: '321 Maple Dr, Houston, TX 77001',
            items: [
                { name: 'Queen Size Bed', quantity: 1, price: 2499999 },
                { name: 'Bedside Tables', quantity: 2, price: 499999 }
            ]
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'Shipped':
                return 'bg-blue-100 text-blue-800';
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentColor = (payment) => {
        switch (payment) {
            case 'Paid':
                return 'bg-green-100 text-green-800';
            case 'COD':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const orders = activeTab === 'active' ? activeOrders : pastOrders;

    const [selectedOrder, setSelectedOrder] = useState(null);

    const OrderDetailsModal = ({ order, onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-serif font-bold text-gray-900">Order Details</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-medium">
                            ×
                        </button>
                    </div>
                    <div className="mt-6 space-y-6">
                        <div className="flex items-center space-x-4">
                            <img src={order.customer.avatar} alt={order.customer.name} className="w-12 h-12 rounded-full object-cover border border-[#C4A484]/10" />
                            <div>
                                <h3 className="font-medium text-gray-900">{order.customer.name}</h3>
                                <p className="text-sm text-gray-500">{order.customer.email}</p>
                            </div>
                        </div>
                        <div className="border-t border-[#C4A484]/10 pt-4">
                            <dl className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Order ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{order.id}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{order.date}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1">
                                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Payment</dt>
                                    <dd className="mt-1">
                                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getPaymentColor(order.payment)}`}>
                                            {order.payment}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                        <div className="border-t border-[#C4A484]/10 pt-4">
                            <h4 className="font-medium text-gray-900 mb-4">Order Items</h4>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">Rp {item.price.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-[#C4A484]/10">
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-900">Total</span>
                                    <span className="font-medium text-gray-900">Rp {order.price.toLocaleString()}</span>
                                </div>
                            </div>
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
                    <button className="px-4 py-2 bg-[#C4A484] text-white rounded-lg text-sm hover:bg-[#B39374] transition-colors">
                        Update Status
                    </button>
                </div>
            </div>
        </div>
    );

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
                <div className=" space-y-4 bg-white">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-md relative">
                            <FiSearch className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search orders..."
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
                                <option value="paid">Paid</option>
                                <option value="cod">COD</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
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
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-[#F8F5F1]/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        #{order.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img
                                                    className="h-10 w-10 rounded-full object-cover border border-[#C4A484]/10"
                                                    src={order.customer.avatar}
                                                    alt={order.customer.name}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                                                <div className="text-sm text-gray-500">{order.customer.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {order.items.length} item(s)
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        Rp {order.price.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getPaymentColor(order.payment)}`}>
                                            {order.payment}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-[#C4A484] hover:text-[#8B5E34] transition-colors"
                                            >
                                                <FiEye className="w-5 h-5" />
                                            </button>
                                            <button className="text-[#C4A484] hover:text-[#8B5E34] transition-colors">
                                                <FiEdit2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="bg-[#F8F5F1]/50 px-6 py-4 border-t border-[#C4A484]/10">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing 1 to {orders.length} of {orders.length} orders
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="px-4 py-2 border border-[#C4A484]/20 rounded-lg text-sm text-gray-600 hover:bg-[#C4A484]/10 transition-colors">
                                    Previous
                                </button>
                                <button className="px-4 py-2 bg-[#C4A484] text-white rounded-lg text-sm hover:bg-[#B39374] transition-colors">
                                    1
                                </button>
                                <button className="px-4 py-2 border border-[#C4A484]/20 rounded-lg text-sm text-gray-600 hover:bg-[#C4A484]/10 transition-colors">
                                    2
                                </button>
                                <button className="px-4 py-2 border border-[#C4A484]/20 rounded-lg text-sm text-gray-600 hover:bg-[#C4A484]/10 transition-colors">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
        </AdminLayout>
    );
};

export default AdminOrders; 