import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiPlus } from 'react-icons/fi';

const Checkout = () => {
    const { user } = useAuth();
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);

    // Dummy cart data - replace with actual cart data
    const cartItems = [
        {
            id: 1,
            name: 'Modern Leather Sofa',
            price: 2499999,
            color: 'Brown',
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3'
        }
    ];

    // Dummy address - replace with user's saved address from backend
    const savedAddress = {
        fullName: 'John Doe',
        phone: '+1234567890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        pinCode: '10001'
    };

    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pinCode: ''
    });

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddressForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddressSubmit = (e) => {
        e.preventDefault();
        // Here you would typically save the address to the backend
        setSelectedAddress(addressForm);
        setShowAddressForm(false);
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const subtotal = calculateSubtotal();
    const shipping = 50000; // Fixed shipping cost
    const total = subtotal + shipping;

    return (
        <div className="min-h-screen bg-[#F8F5F1]/30 py-8">
            <div className="max-w-[2000px] mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column - Address and Payment */}
                    <div className="space-y-8">
                        {/* Progress Indicator */}
                        <div className="relative">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-[#C4A484] flex items-center justify-center">
                                        <span className="text-white text-sm">1</span>
                                    </div>
                                    <span className="ml-4 text-sm font-medium text-gray-900">Address</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-[#DCC8AC] flex items-center justify-center">
                                        <span className="text-white text-sm">2</span>
                                    </div>
                                    <span className="ml-4 text-sm font-medium text-[#8B5E34]">Payment</span>
                                </div>
                            </div>
                            <div className="mt-4 h-1 w-full bg-[#DCC8AC]">
                                <div className="h-full bg-[#C4A484] w-1/2"></div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="bg-white p-6 rounded-xl border border-[#C4A484]/10">
                            <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">Shipping & Billing Address</h2>

                            {savedAddress && !showAddressForm && !selectedAddress && (
                                <div className="mb-6">
                                    <div className="border border-[#C4A484]/10 rounded-xl p-4 hover:bg-[#F8F5F1]/50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900">{savedAddress.fullName}</p>
                                                <p className="text-[#8B5E34] mt-1">{savedAddress.phone}</p>
                                                <p className="text-[#8B5E34]">{savedAddress.address}</p>
                                                <p className="text-[#8B5E34]">{savedAddress.city}, {savedAddress.state} {savedAddress.pinCode}</p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedAddress(savedAddress)}
                                                className="text-[#C4A484] hover:text-[#8B5E34] transition-colors text-sm font-medium"
                                            >
                                                Use this address
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!showAddressForm && !selectedAddress && (
                                <button
                                    onClick={() => setShowAddressForm(true)}
                                    className="flex items-center space-x-2 text-[#C4A484] hover:text-[#8B5E34] transition-colors"
                                >
                                    <FiPlus className="w-5 h-5" />
                                    <span>Add new address</span>
                                </button>
                            )}

                            {showAddressForm && (
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
                                                className="mt-1 block w-full border border-[#C4A484]/20 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C4A484] focus:border-[#C4A484]"
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
                                                className="mt-1 block w-full border border-[#C4A484]/20 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C4A484] focus:border-[#C4A484]"
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
                                            className="mt-1 block w-full border border-[#C4A484]/20 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C4A484] focus:border-[#C4A484]"
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
                                                className="mt-1 block w-full border border-[#C4A484]/20 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C4A484] focus:border-[#C4A484]"
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
                                                className="mt-1 block w-full border border-[#C4A484]/20 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C4A484] focus:border-[#C4A484]"
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
                                                className="mt-1 block w-full border border-[#C4A484]/20 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C4A484] focus:border-[#C4A484]"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddressForm(false)}
                                            className="px-4 py-2 border border-[#C4A484]/20 rounded-lg text-sm font-medium text-[#8B5E34] hover:bg-[#F8F5F1] transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#C4A484] hover:bg-[#B39374] transition-colors"
                                        >
                                            Save Address
                                        </button>
                                    </div>
                                </form>
                            )}

                            {selectedAddress && (
                                <div>
                                    <div className="border border-[#C4A484]/10 rounded-xl p-4 mb-4 hover:bg-[#F8F5F1]/50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900">{selectedAddress.fullName}</p>
                                                <p className="text-[#8B5E34] mt-1">{selectedAddress.phone}</p>
                                                <p className="text-[#8B5E34]">{selectedAddress.address}</p>
                                                <p className="text-[#8B5E34]">{selectedAddress.city}, {selectedAddress.state} {selectedAddress.pinCode}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedAddress(null);
                                                    setShowAddressForm(true);
                                                }}
                                                className="text-[#C4A484] hover:text-[#8B5E34] transition-colors text-sm font-medium"
                                            >
                                                Change
                                            </button>
                                        </div>
                                    </div>

                                    {/* Payment Section */}
                                    <div className="mt-8">
                                        <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Payment Method</h3>
                                        <div className="space-y-4">
                                            <div className="border border-[#C4A484]/10 rounded-xl p-4 hover:bg-[#F8F5F1]/50 transition-colors">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        value="card"
                                                        className="h-4 w-4 text-[#C4A484] focus:ring-[#C4A484]"
                                                    />
                                                    <span className="ml-3 text-gray-900">Credit/Debit Card</span>
                                                </label>
                                            </div>
                                            <div className="border border-[#C4A484]/10 rounded-xl p-4 hover:bg-[#F8F5F1]/50 transition-colors">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        value="cod"
                                                        className="h-4 w-4 text-[#C4A484] focus:ring-[#C4A484]"
                                                    />
                                                    <span className="ml-3 text-gray-900">Cash on Delivery (COD)</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="bg-white p-6 rounded-xl border border-[#C4A484]/10 h-fit">
                        <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">Order Summary</h2>
                        <div className="flow-root">
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-[#8B5E34]">Color: {item.color}</p>
                                            <p className="text-sm text-[#8B5E34]">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">Rp {item.price.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t border-[#C4A484]/10">
                                <div className="flex justify-between">
                                    <dt className="text-sm text-[#8B5E34]">Subtotal</dt>
                                    <dd className="text-sm font-medium text-gray-900">Rp {subtotal.toLocaleString()}</dd>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <dt className="text-sm text-[#8B5E34]">Shipping</dt>
                                    <dd className="text-sm font-medium text-gray-900">Rp {shipping.toLocaleString()}</dd>
                                </div>
                                <div className="flex justify-between mt-4 pt-4 border-t border-[#C4A484]/10">
                                    <dt className="text-base font-medium text-gray-900">Order total</dt>
                                    <dd className="text-base font-medium text-gray-900">Rp {total.toLocaleString()}</dd>
                                </div>
                            </div>
                            <div className="mt-6">
                                <input
                                    type="text"
                                    placeholder="Enter discount code"
                                    className="block w-full border border-[#C4A484]/20 rounded-lg shadow-sm py-2 px-3 mb-4 focus:outline-none focus:ring-[#C4A484] focus:border-[#C4A484]"
                                />
                                <button className="w-full bg-[#C4A484] text-white py-3 rounded-xl hover:bg-[#B39374] transition-colors">
                                    Apply Discount
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout; 