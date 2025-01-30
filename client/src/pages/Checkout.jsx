import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { addAddressApi, getAddressesApi, setDefaultAddressApi, createOrderApi, getProductByIdApi } from '../api/apis';
import { sanitizeFormData } from '../utils/sanitize';

const CART_COOKIE_KEY = 'furniture_cart';

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    const [loadingCart, setLoadingCart] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const location = useLocation();

    // Add the missing addressForm state
    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pinCode: ''
    });

    // Check for payment error message
    useEffect(() => {
        const paymentError = sessionStorage.getItem('paymentError');
        if (paymentError) {
            toast.error(paymentError);
            sessionStorage.removeItem('paymentError');
        }
    }, []);

    // Check URL parameters for error
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('error') === 'payment-failed') {
            toast.error('Payment failed. Please try again.');
            // Clean up the URL
            window.history.replaceState({}, '', '/checkout');
        }
    }, [location]);

    // Fetch cart items from cookie and get product details
    useEffect(() => {
        const loadCart = async () => {
            try {
                setLoadingCart(true);
                // Get cart items from cookie
                const cartData = JSON.parse(Cookies.get(CART_COOKIE_KEY) || '[]');

                if (cartData.length === 0) {
                    setCartItems([]);
                    setLoadingCart(false);
                    return;
                }

                // Fetch product details for each cart item
                const itemPromises = cartData.map(async (cartItem) => {
                    try {
                        const response = await getProductByIdApi(cartItem.productId);
                        const product = response.data;
                        return {
                            id: product._id,
                            name: product.name,
                            price: product.price,
                            color: cartItem.color || product.colors[0]?.name || 'N/A',
                            quantity: cartItem.quantity,
                            image: product.pictures[0],
                            countInStock: product.countInStock
                        };
                    } catch (error) {
                        console.error(`Error fetching product ${cartItem.productId}:`, error);
                        return null;
                    }
                });

                const items = (await Promise.all(itemPromises)).filter(item => item !== null);
                setCartItems(items);
            } catch (error) {
                console.error('Error loading cart:', error);
                toast.error('Failed to load cart items');
            } finally {
                setLoadingCart(false);
            }
        };

        loadCart();
    }, []);

    // Fetch addresses
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await getAddressesApi();
                setAddresses(response.data);
                // Set default address as selected if exists
                const defaultAddress = response.data.find(addr => addr.isDefault);
                if (defaultAddress) {
                    setSelectedAddress(defaultAddress);
                }
            } catch (error) {
                console.error('Error fetching addresses:', error);
                toast.error('Failed to load addresses');
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, []);

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddressForm(prev => ({
            ...prev,
            [name]: value
        }));
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

        // Validate phone number format (basic validation)
        const phoneRegex = /^\d{10,12}$/;
        if (!phoneRegex.test(addressForm.phone.replace(/[-\s]/g, ''))) {
            toast.error('Please enter a valid phone number (10-12 digits)');
            return;
        }

        // Validate PIN code (basic validation)
        const pinCodeRegex = /^\d{5,6}$/;
        if (!pinCodeRegex.test(addressForm.pinCode.replace(/\s/g, ''))) {
            toast.error('Please enter a valid PIN code (5-6 digits)');
            return;
        }

        try {
            const response = await addAddressApi(addressForm);
            setAddresses(response.data);
            setSelectedAddress(response.data[response.data.length - 1]);
            setShowAddressForm(false);
            setAddressForm({
                fullName: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                pinCode: ''
            });
            toast.success('Address added successfully');
        } catch (error) {
            console.error('Error adding address:', error);
            toast.error(error.response?.data?.message || 'Failed to add address');
        }
    };

    const handleSelectAddress = async (address) => {
        try {
            await setDefaultAddressApi(address._id);
            setSelectedAddress(address);
            // Update addresses list to reflect new default
            const updatedAddresses = addresses.map(addr => ({
                ...addr,
                isDefault: addr._id === address._id
            }));
            setAddresses(updatedAddresses);
        } catch (error) {
            console.error('Error setting default address:', error);
            toast.error('Failed to select address');
        }
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const subtotal = calculateSubtotal();
    const shipping = 0; // Set shipping cost to 0
    const total = subtotal + shipping;

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error('Please select a shipping address');
            return;
        }

        try {
            setIsProcessing(true);

            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    color: item.color
                })),
                totalPrice: total,
                paymentMethod: 'COD',
                shippingAddress: {
                    fullName: selectedAddress.fullName,
                    phone: selectedAddress.phone,
                    address: selectedAddress.address,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    pinCode: selectedAddress.pinCode
                }
            };

            const response = await createOrderApi(orderData);
            
            // Clear cart
            Cookies.remove(CART_COOKIE_KEY);
            // Dispatch event to update cart count in navbar
            window.dispatchEvent(new Event('cartUpdated'));
            // Redirect to orders page
            navigate(`/order/${response.data._id}`);
            toast.success('Order placed successfully!');

        } catch (error) {
            console.error('Error placing order:', error);
            toast.error(error.message || 'Failed to place order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading || loadingCart) {
        return (
            <div className="min-h-screen bg-[#F8F5F1]/30 py-8">
                <div className="max-w-[2000px] mx-auto px-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-64 bg-gray-200 rounded mb-4"></div>
                    </div>
                </div>
            </div>
        );
    }

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
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-serif font-bold text-gray-900">Shipping & Billing Address</h2>
                                {!showAddressForm && (
                                    <button
                                        onClick={() => {
                                            setShowAddressForm(true);
                                            setSelectedAddress(null);
                                        }}
                                        className="flex items-center space-x-2 text-[#C4A484] hover:text-[#8B5E34] transition-colors"
                                    >
                                        <FiPlus className="w-5 h-5" />
                                        <span>Add New Address</span>
                                    </button>
                                )}
                            </div>

                            {/* Address List */}
                            {!showAddressForm && addresses.length > 0 && (
                                <div className="grid grid-cols-1 gap-4 mb-6">
                                    {addresses.map(address => (
                                        <div
                                            key={address._id}
                                            className={`border rounded-xl p-4 cursor-pointer transition-all ${selectedAddress?._id === address._id
                                                ? 'border-[#C4A484] bg-[#F8F5F1] shadow-sm'
                                                : 'border-[#C4A484]/10 hover:border-[#C4A484]/30 hover:bg-[#F8F5F1]/50'
                                                }`}
                                            onClick={() => handleSelectAddress(address)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <p className="font-medium text-gray-900">{address.fullName}</p>
                                                        {address.isDefault && (
                                                            <span className="px-2 py-1 bg-[#C4A484]/10 text-[#8B5E34] text-xs rounded-full">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[#8B5E34] mt-1">{address.phone}</p>
                                                    <p className="text-[#8B5E34]">{address.address}</p>
                                                    <p className="text-[#8B5E34]">{address.city}, {address.state} {address.pinCode}</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {selectedAddress?._id === address._id ? (
                                                        <div className="w-6 h-6 rounded-full border-2 border-[#C4A484] flex items-center justify-center">
                                                            <div className="w-3 h-3 rounded-full bg-[#C4A484]"></div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* No Addresses Message */}
                            {!showAddressForm && addresses.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-[#8B5E34] mb-4">You haven't added any addresses yet</p>
                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#C4A484] hover:bg-[#B39374] transition-colors"
                                    >
                                        <FiPlus className="w-5 h-5 mr-2" />
                                        Add Your First Address
                                    </button>
                                </div>
                            )}

                            {/* Address Form */}
                            {showAddressForm && (
                                <div>
                                    <div className="flex items-center space-x-2 mb-6">
                                        <button
                                            onClick={() => {
                                                setShowAddressForm(false);
                                                if (addresses.length > 0) {
                                                    const defaultAddr = addresses.find(addr => addr.isDefault);
                                                    setSelectedAddress(defaultAddr || addresses[0]);
                                                }
                                            }}
                                            className="text-[#8B5E34] hover:text-[#C4A484] transition-colors"
                                        >
                                            ← Back to addresses
                                        </button>
                                    </div>
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
                                                    placeholder="10-12 digits"
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
                                                placeholder="Street address, apartment, etc."
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
                                                    placeholder="5-6 digits"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowAddressForm(false);
                                                    if (addresses.length > 0) {
                                                        const defaultAddr = addresses.find(addr => addr.isDefault);
                                                        setSelectedAddress(defaultAddr || addresses[0]);
                                                    }
                                                }}
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
                                </div>
                            )}
                        </div>

                        {/* Payment Section - Only show when address is selected */}
                        {selectedAddress && !showAddressForm && (
                            <div className="mt-8 bg-white p-6 rounded-xl border border-[#C4A484]/10">
                                <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Payment Method</h3>
                                <div className="space-y-4">
                                    <div
                                        className="border rounded-xl p-4 border-[#C4A484] bg-[#F8F5F1] shadow-sm"
                                    >
                                        <label className="flex items-center cursor-pointer">
                                            <div className="w-6 h-6 rounded-full border-2 border-[#C4A484] flex items-center justify-center mr-3">
                                                <div className="w-3 h-3 rounded-full bg-[#C4A484]"></div>
                                            </div>
                                            <span className="text-gray-900">Cash on Delivery (COD)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                        <p className="text-sm font-medium text-gray-900">Nrp {item.price.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t border-[#C4A484]/10">
                                <div className="flex justify-between">
                                    <dt className="text-sm text-[#8B5E34]">Subtotal</dt>
                                    <dd className="text-sm font-medium text-gray-900">Nrp {subtotal.toLocaleString()}</dd>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <dt className="text-sm text-[#8B5E34]">Shipping</dt>
                                    <dd className="text-sm font-medium text-gray-900">Free</dd>
                                </div>
                                <div className="flex justify-between mt-4 pt-4 border-t border-[#C4A484]/10">
                                    <dt className="text-base font-medium text-gray-900">Order total</dt>
                                    <dd className="text-base font-medium text-gray-900">Nrp {total.toLocaleString()}</dd>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={!selectedAddress || isProcessing || cartItems.length === 0}
                                    className={`w-full py-3 rounded-xl transition-colors ${selectedAddress && !isProcessing && cartItems.length > 0
                                        ? 'bg-[#C4A484] text-white hover:bg-[#B39374]'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {isProcessing
                                        ? 'Processing...'
                                        : cartItems.length === 0
                                            ? 'Your cart is empty'
                                            : !selectedAddress
                                                ? 'Select Address to Continue'
                                                : 'Place Order'}
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