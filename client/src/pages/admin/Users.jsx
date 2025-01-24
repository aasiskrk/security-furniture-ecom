import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getAdminUsersApi, updateUserStatusApi, updateUserRoleApi, deleteUserApi } from '../../api/apis';
import { sanitizeFormData, sanitizeSearchQuery } from '../../utils/sanitize';
import axios from 'axios';

const isPasswordExpiringSoon = (passwordLastChanged) => {
    if (!passwordLastChanged) return false;
    const expiryDate = new Date(passwordLastChanged);
    expiryDate.setDate(expiryDate.getDate() + 90); // 90 days from last change
    const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 14; // Return true if password expires in 14 days or less
};

const formatPasswordExpiryDate = (passwordLastChanged) => {
    if (!passwordLastChanged) return 'Not set';
    const expiryDate = new Date(passwordLastChanged);
    expiryDate.setDate(expiryDate.getDate() + 90); // 90 days from last change
    const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
        return 'Expired';
    } else if (daysUntilExpiry === 0) {
        return 'Today';
    } else if (daysUntilExpiry === 1) {
        return 'Tomorrow';
    } else {
        return `in ${daysUntilExpiry} days`;
    }
};

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await getAdminUsersApi();
            setUsers(response.data);
        } catch (error) {
            toast.error('Failed to fetch users');
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (userId, newStatus) => {
        try {
            await updateUserStatusApi(userId, { status: newStatus });
            // Update the user's status in the local state
            setUsers(users.map(user => 
                user._id === userId ? { ...user, status: newStatus } : user
            ));
            toast.success('User status updated successfully');
        } catch (error) {
            console.error('Error updating user status:', error);
            toast.error(error.response?.data?.message || 'Failed to update user status');
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await updateUserRoleApi(userId, newRole);
            toast.success('User role updated successfully');
            fetchUsers(); // Refresh the list
        } catch (error) {
            toast.error('Failed to update user role');
            console.error('Error updating user role:', error);
        }
    };

    const handleDelete = async (userId) => {
        try {
            await deleteUserApi(userId);
            toast.success('User deleted successfully');
            setIsDeleteModalOpen(false);
            fetchUsers(); // Refresh the list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
            console.error('Error deleting user:', error);
        }
    };

    const handleSearch = (e) => {
        const sanitizedQuery = sanitizeSearchQuery(e.target.value);
        setSearchTerm(sanitizedQuery);
    };

    const handleUpdateUser = async (userId, updates) => {
        try {
            const sanitizedData = sanitizeFormData(updates);
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/admin/users/${userId}`,
                sanitizedData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            
            setUsers(users.map(user => 
                user._id === userId ? response.data : user
            ));
            toast.success('User updated successfully');
        } catch (error) {
            console.error('Update user error:', error);
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    // Filter users based on search term and filters
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesStatus = !statusFilter || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900">Users</h1>
                        <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="border-t border-[#C4A484]/50 p-6 space-y-4 bg-white">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-md relative">
                            <FiSearch className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none bg-white"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-4 py-3 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none bg-white"
                            >
                                <option value="">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="user">Customer</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none bg-white"
                            >
                                <option value="">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
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
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Security Info</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Orders</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Last Login</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#C4A484]/10">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-[#F8F5F1]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                                                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                    }`}
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="user">Customer</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="text-sm">
                                                    <span className="font-medium">Password Expires:</span>
                                                    <span className={`ml-1 ${isPasswordExpiringSoon(user.passwordLastChanged) ? 'text-amber-600' : 'text-gray-600'}`}>
                                                        {formatPasswordExpiryDate(user.passwordLastChanged)}
                                                    </span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="font-medium">Failed Attempts:</span>
                                                    <span className={`ml-1 ${user.failedLoginAttempts > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                                        {user.failedLoginAttempts}/5
                                                    </span>
                                                </div>
                                                {user.accountLockUntil && new Date(user.accountLockUntil) > new Date() && (
                                                    <div className="text-sm text-red-600">
                                                        Locked until {new Date(user.accountLockUntil).toLocaleTimeString()}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {user.orders} orders
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {new Date(user.lastLogin).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(user.lastLogin).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.status}
                                                onChange={(e) => handleUpdateStatus(user._id, e.target.value)}
                                                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${user.status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    <FiTrash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full">
                            <h2 className="text-2xl font-serif font-bold mb-4">Delete User</h2>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedUser?._id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Users; 