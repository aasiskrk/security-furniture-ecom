import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { updateProfileApi, changePasswordApi, getAddressesApi, addAddressApi, updateAddressApi, deleteAddressApi, setDefaultAddressApi } from '../api/apis';
import ActivityLogs from '../components/ActivityLogs';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import zxcvbn from 'zxcvbn';
import { sanitizeFormData } from '../utils/sanitize';
import axios from 'axios';
import DOMPurify from 'dompurify';

const Profile = () => {
    const { user, logout, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pinCode: ''
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await getAddressesApi();
            setAddresses(response.data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            toast.error('Failed to load addresses');
        }
    };

    const handleProfileChange = (e) => {
        setProfileForm({
            ...profileForm,
            [e.target.name]: e.target.value
        });
    };

    const handleAddressChange = (e) => {
        setAddressForm({
            ...addressForm,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const sanitizedData = sanitizeFormData(profileForm);
            const response = await updateProfileApi(sanitizedData);
            
            updateUser(response.data);
            setProfileForm({
                name: response.data.name,
                email: response.data.email
            });
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check if passwords match
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                toast.error('New passwords do not match');
                setLoading(false);
                return;
            }

            // Check password strength
            const result = zxcvbn(passwordForm.newPassword);
            if (result.score < 3) {
                toast.error('New password is too weak. Please use a stronger password.');
                setLoading(false);
                return;
            }

            // Only send required fields
            const passwordData = {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            };
            const sanitizedData = sanitizeFormData(passwordData);
            await changePasswordApi(sanitizedData);
            
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            toast.success('Password changed successfully');
        } catch (error) {
            console.error('Password change error:', error);
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields are filled
        const requiredFields = ['fullName', 'phone', 'address', 'city', 'state', 'pinCode'];
        const emptyFields = requiredFields.filter(field => !addressForm[field].trim());

        if (emptyFields.length > 0) {
            toast.error(`Please fill in all required fields: ${emptyFields.join(', ')}`);
            return;
        }

        // Validate phone number format
        const phoneRegex = /^\d{10,12}$/;
        if (!phoneRegex.test(addressForm.phone.replace(/[-\s]/g, ''))) {
            toast.error('Please enter a valid phone number (10-12 digits)');
            return;
        }

        // Validate PIN code
        const pinCodeRegex = /^\d{5,6}$/;
        if (!pinCodeRegex.test(addressForm.pinCode.replace(/\s/g, ''))) {
            toast.error('Please enter a valid PIN code (5-6 digits)');
            return;
        }

        try {
            if (editingAddress) {
                await updateAddressApi(editingAddress._id, addressForm);
                toast.success('Address updated successfully');
            } else {
                await addAddressApi(addressForm);
                toast.success('Address added successfully');
            }

            fetchAddresses();
            setShowAddressForm(false);
            setEditingAddress(null);
            setAddressForm({
                fullName: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                pinCode: ''
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save address');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        try {
            await deleteAddressApi(addressId);
            toast.success('Address deleted successfully');
            fetchAddresses();
        } catch (error) {
            toast.error('Failed to delete address');
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        try {
            await setDefaultAddressApi(addressId);
            toast.success('Default address updated');
            fetchAddresses();
        } catch (error) {
            toast.error('Failed to set default address');
        }
    };

    const handleEditAddress = (address) => {
        setAddressForm({
            fullName: address.fullName,
            phone: address.phone,
            address: address.address,
            city: address.city,
            state: address.state,
            pinCode: address.pinCode
        });
        setEditingAddress(address);
        setShowAddressForm(true);
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteUserApi(user._id);
            toast.success('Account deleted successfully');
            logout();
            navigate('/login');
        } catch (error) {
            toast.error('Failed to delete account');
        }
    };

    // Add sanitization function
    const sanitizeContent = (content) => {
        if (typeof content === 'string') {
            return DOMPurify.sanitize(content);
        }
        return content;
    };

    const renderProfile = () => (
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
                            <h2 className="text-2xl font-bold text-gray-900">{sanitizeContent(user?.name)}</h2>
                            <p className="text-gray-500">{sanitizeContent(user?.email)}</p>
                            <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user?.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                }`}>
                                {user?.role === 'admin' ? 'Administrator' : 'User'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                        >
                            <FiEdit2 className="w-5 h-5" />
                            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                        </button>
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Go to Admin Dashboard
                            </button>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={profileForm.name}
                                onChange={handleProfileChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={profileForm.email}
                                onChange={handleProfileChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                ) : (
                    <div className="mt-6 border-t border-gray-200 pt-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Name</dt>
                                <dd className="mt-1 text-sm text-gray-900">{sanitizeContent(user?.name)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="mt-1 text-sm text-gray-900">{sanitizeContent(user?.email)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Role</dt>
                                <dd className="mt-1 text-sm text-gray-900">{user?.role === 'admin' ? 'Administrator' : 'User'}</dd>
                            </div>
                        </dl>
                    </div>
                )}

                {/* Password Change Section */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                            <div className="relative mt-1">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    name="currentPassword"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                                >
                                    {showCurrentPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <div className="relative mt-1">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    name="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                                >
                                    {showNewPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <div className="mt-2">
                                <PasswordStrengthMeter password={passwordForm.newPassword} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <div className="relative mt-1">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                                >
                                    {showConfirmPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Changing Password...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Addresses Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium text-gray-900">Addresses</h3>
                    <button
                        onClick={() => {
                            setShowAddressForm(true);
                            setEditingAddress(null);
                            setAddressForm({
                                fullName: '',
                                phone: '',
                                address: '',
                                city: '',
                                state: '',
                                pinCode: ''
                            });
                        }}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                        <FiPlus className="w-5 h-5" />
                        <span>Add New Address</span>
                    </button>
                </div>

                {showAddressForm ? (
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={addressForm.fullName}
                                    onChange={handleAddressChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={addressForm.phone}
                                    onChange={handleAddressChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={addressForm.address}
                                onChange={handleAddressChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={addressForm.city}
                                    onChange={handleAddressChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={addressForm.state}
                                    onChange={handleAddressChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">PIN Code</label>
                                <input
                                    type="text"
                                    name="pinCode"
                                    value={addressForm.pinCode}
                                    onChange={handleAddressChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddressForm(false);
                                    setEditingAddress(null);
                                    setAddressForm({
                                        fullName: '',
                                        phone: '',
                                        address: '',
                                        city: '',
                                        state: '',
                                        pinCode: ''
                                    });
                                }}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {editingAddress ? 'Update Address' : 'Save Address'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        {addresses.map(address => (
                            <div key={address._id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-900">{sanitizeContent(address.fullName)}</p>
                                        <p className="text-gray-600 mt-1">{sanitizeContent(address.phone)}</p>
                                        <p className="text-gray-600">{sanitizeContent(address.address)}</p>
                                        <p className="text-gray-600">{sanitizeContent(address.city)}, {sanitizeContent(address.state)} {sanitizeContent(address.pinCode)}</p>
                                        {address.isDefault && (
                                            <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Default Address
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => handleEditAddress(address)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <FiEdit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAddress(address._id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                        {!address.isDefault && (
                                            <button
                                                onClick={() => handleSetDefaultAddress(address._id)}
                                                className="text-sm text-gray-600 hover:text-gray-800"
                                            >
                                                Set as Default
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Account Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
                <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-medium text-red-600">Delete Account</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Activity Logs Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Logs</h3>
                <ActivityLogs />
            </div>

            {/* Delete Account Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Account</h3>
                        <p className="text-gray-500 mb-4">
                            Are you sure you want to delete your account? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {renderProfile()}
            </div>
        </div>
    );
};

export default Profile; 