import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';

const Users = () => {
    // Sample data - replace with actual API call
    const [users] = useState([
        {
            _id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Customer',
            status: 'Active',
            orders: 12,
            lastLogin: '2024-02-20',
            createdAt: '2024-01-15',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1'
        },
        {
            _id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'Admin',
            status: 'Active',
            orders: 5,
            lastLogin: '2024-02-19',
            createdAt: '2024-01-10',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1'
        }
    ]);

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900">Users</h1>
                        <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
                    </div>
                    <button className="flex items-center space-x-2 bg-[#C4A484] text-white px-6 py-3 rounded-lg hover:bg-[#B39374] transition-all duration-200">
                        <FiPlus className="w-5 h-5" />
                        <span>Add User</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="border-t border-[#C4A484]/50 p-6 space-y-4 bg-white">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-md relative">
                            <FiSearch className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none bg-white"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <select className="px-4 py-3 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none bg-white">
                                <option value="">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="customer">Customer</option>
                            </select>
                            <select className="px-4 py-3 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none bg-white">
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl border border-[#C4A484]/10 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#F8F5F1]">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">User</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Role</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Orders</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Last Login</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#C4A484]/10">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-[#F8F5F1]/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img
                                                    className="h-10 w-10 rounded-full object-cover border border-[#C4A484]/10"
                                                    src={user.avatar}
                                                    alt={user.name}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${user.role === 'Admin'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {user.orders} orders
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {new Date(user.lastLogin).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(user.lastLogin).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${user.status === 'Active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <button className="text-[#C4A484] hover:text-[#8B5E34] transition-colors">
                                                <FiEdit2 className="w-5 h-5" />
                                            </button>
                                            <button className="text-red-400 hover:text-red-600 transition-colors">
                                                <FiTrash2 className="w-5 h-5" />
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
                                Showing 1 to {users.length} of {users.length} users
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
        </AdminLayout>
    );
};

export default Users; 