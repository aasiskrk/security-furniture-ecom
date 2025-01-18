import { useState } from 'react';
import { FiPackage } from 'react-icons/fi';

const UserOrders = () => {
    // Dummy orders data
    const [orders] = useState([
        {
            id: 'ORD-2501',
            product: {
                name: 'Modern Leather Sofa',
                image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3'
            },
            price: 2499999,
            date: '2024-02-20',
            status: 'In Progress',
        },
        {
            id: 'ORD-2502',
            product: {
                name: 'Dining Table Set',
                image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3'
            },
            price: 1899999,
            date: '2024-02-19',
            status: 'Shipped',
        },
        {
            id: 'ORD-2503',
            product: {
                name: 'Bedroom Set',
                image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-4.0.3'
            },
            price: 3299999,
            date: '2024-02-18',
            status: 'Delivered',
        }
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress':
                return 'bg-[#F8F5F1] text-[#8B5E34]';
            case 'Shipped':
                return 'bg-[#DCC8AC] text-[#4A3F35]';
            case 'Delivered':
                return 'bg-[#C4A484] text-white';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-[2000px] mx-auto px-6 py-8">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">My Orders</h1>
                    <p className="mt-2 text-[#8B5E34]">Track and manage your orders</p>
                </div>

                <div className="bg-white rounded-xl border border-[#C4A484]/10 overflow-hidden">
                    {orders.length > 0 ? (
                        <div className="divide-y divide-[#C4A484]/10">
                            {orders.map((order) => (
                                <div key={order.id} className="p-6 hover:bg-[#F8F5F1]/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={order.product.image}
                                                    alt={order.product.name}
                                                    className="w-24 h-24 object-cover rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {order.product.name}
                                                </h3>
                                                <div className="mt-1 space-y-1">
                                                    <p className="text-[#8B5E34]">Order ID: {order.id}</p>
                                                    <p className="text-[#8B5E34]">Ordered on {order.date}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-medium text-gray-900 mb-2">
                                                Rp {order.price.toLocaleString()}
                                            </p>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button className="text-[#C4A484] hover:text-[#8B5E34] transition-colors text-sm font-medium">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <FiPackage className="mx-auto h-12 w-12 text-[#C4A484]" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No Orders Found</h3>
                            <p className="mt-1 text-[#8B5E34]">You haven't placed any orders yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserOrders; 