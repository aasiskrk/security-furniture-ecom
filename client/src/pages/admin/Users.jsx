import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getAdminUsersApi, updateUserStatusApi, updateUserRoleApi, deleteUserApi, createUserApi } from '../../api/apis';

const AddUserModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        status: 'Active'
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onAdd(formData);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'user',
                status: 'Active'
            });
            onClose();
        } catch (error) {
            console.error('Error in form submission:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-serif font-bold mb-6">Add New User</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="w-full px-4 py-2 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none"
                        >
                            <option value="user">Customer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#C4A484] text-white rounded-lg hover:bg-[#B39374]"
                        >
                            Add User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
            await updateUserStatusApi(userId, newStatus);
            toast.success('User status updated successfully');
            fetchUsers(); // Refresh the list
        } catch (error) {
            toast.error('Failed to update user status');
            console.error('Error updating user status:', error);
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

    const handleAddUser = async (userData) => {
        try {
            await createUserApi(userData);
            toast.success('User created successfully');
            fetchUsers(); // Refresh the list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
            throw error; // Re-throw to handle in the form
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
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center space-x-2 bg-[#C4A484] text-white px-6 py-3 rounded-lg hover:bg-[#B39374] transition-all duration-200"
                    >
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
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Orders</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Last Login</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#C4A484]/10">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
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

                {/* Add User Modal */}
                <AddUserModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={handleAddUser}
                />

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