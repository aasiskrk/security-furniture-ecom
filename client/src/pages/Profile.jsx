import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiShoppingBag, FiHeart, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isEditing, setIsEditing] = useState(false);

    // Dummy orders data - replace with actual API call
    const [orders] = useState([
        {
            id: 'ORD-2501',
            product: 'MacBook Pro M2',
            price: 1299.99,
            date: '2024-02-20',
            status: 'In Progress',
            image: '/images/macbook.jpg'
        },
        {
            id: 'ORD-2502',
            product: 'Dell XPS 13',
            price: 999.99,
            date: '2024-02-19',
            status: 'Shipped',
            image: '/images/dell.jpg'
        }
    ]);

    // Dummy wishlist data - replace with actual API call
    const [wishlist] = useState([
        {
            id: 1,
            name: 'MacBook Pro M2',
            price: 1299.99,
            image: '/images/macbook.jpg'
        },
        {
            id: 2,
            name: 'Dell XPS 13',
            price: 999.99,
            image: '/images/dell.jpg'
        }
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'Shipped':
                return 'bg-blue-100 text-blue-800';
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const renderAdminProfile = () => (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <img
                            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                            alt={user?.name}
                            className="w-20 h-20 rounded-full"
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                            <p className="text-gray-500">{user?.email}</p>
                            <span className="mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                Administrator
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                        <FiEdit2 className="w-5 h-5" />
                        <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                    </button>
                </div>

                {isEditing ? (
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                defaultValue={user?.name}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                defaultValue={user?.email}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                            <input
                                type="password"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Save Changes
                        </button>
                    </form>
                ) : (
                    <div className="mt-6 border-t border-gray-200 pt-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Name</dt>
                                <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Role</dt>
                                <dd className="mt-1 text-sm text-gray-900">Administrator</dd>
                            </div>
                        </dl>
                    </div>
                )}
            </div>
        </div>
    );

    const renderUserDashboard = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center space-x-4">
                    <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                        alt={user?.name}
                        className="w-20 h-20 rounded-full"
                    />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                        <p className="text-gray-500">{user?.email}</p>
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Contact Information</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <p className="mt-1">{user?.phone}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <p className="mt-1">{user?.address}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Account Actions</h3>
                        <div className="space-y-3">
                            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                                <FiEdit2 className="w-5 h-5" />
                                <span>Edit Profile</span>
                            </button>
                            <button className="flex items-center space-x-2 text-red-600 hover:text-red-800">
                                <FiTrash2 className="w-5 h-5" />
                                <span>Delete Account</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderOrders = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
                    <p className="text-sm text-gray-500">Track and manage your orders</p>
                </div>
                <div className="border-t border-gray-200">
                    {orders.map((order) => (
                        <div key={order.id} className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <img src={order.image} alt={order.product} className="w-16 h-16 object-cover rounded" />
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">{order.product}</h3>
                                        <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                                        <p className="text-sm text-gray-500">Date: {order.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-medium text-gray-900">${order.price}</p>
                                    <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderWishlist = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900">My Wishlist</h2>
                    <p className="text-sm text-gray-500">Your favorite items</p>
                </div>
                <div className="border-t border-gray-200">
                    {wishlist.map((item) => (
                        <div key={item.id} className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                        <p className="text-lg font-medium text-gray-900">${item.price}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        Add to Cart
                                    </button>
                                    <button className="text-red-600 hover:text-red-800">
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // If user is admin, show only admin profile
    if (user?.role === 'admin') {
        return renderAdminProfile();
    }

    // For regular users, show full profile with tabs
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-white rounded-lg shadow-sm p-4">
                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <FiHome className="w-5 h-5" />
                                <span>Account Dashboard</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg ${activeTab === 'orders' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <FiShoppingBag className="w-5 h-5" />
                                <span>My Orders</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('wishlist')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg ${activeTab === 'wishlist' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <FiHeart className="w-5 h-5" />
                                <span>My Wishlist</span>
                            </button>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {activeTab === 'dashboard' && renderUserDashboard()}
                        {activeTab === 'orders' && renderOrders()}
                        {activeTab === 'wishlist' && renderWishlist()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 