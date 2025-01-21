import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { addAddressApi, getAddressesApi, setDefaultAddressApi, createOrderApi, getProductByIdApi } from '../api/apis';

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
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const location = useLocation();

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
        try {
            const response = await addAddressApi(addressForm);
            setAddresses(response.data.addresses);
            setSelectedAddress(response.data.addresses[response.data.addresses.length - 1]);
            setShowAddressForm(false);
            toast.success('Address added successfully');
        } catch (error) {
            console.error('Error adding address:', error);
            toast.error('Failed to add address');
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

        if (!paymentMethod) {
            toast.error('Please select a payment method');
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
                shippingAddress: {
                    fullName: selectedAddress.fullName,
                    phone: selectedAddress.phone,
                    address: selectedAddress.address,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    pinCode: selectedAddress.pinCode
                },
                paymentMethod,
            };

            const response = await createOrderApi(orderData);

            // Handle COD orders
            if (paymentMethod === 'COD') {
                // Clear cart
                Cookies.remove(CART_COOKIE_KEY);
                // Dispatch event to update cart count in navbar
                window.dispatchEvent(new Event('cartUpdated'));
                // Redirect to orders page
                navigate(`/order/${response.data._id}`);
                toast.success('Order placed successfully!');
                return;
            }

            // Handle eSewa payment
            if (paymentMethod === 'eSewa') {
                const { esewaUrl, esewaData } = response.data;

                // Create form and submit to eSewa
                const form = document.createElement('form');
                form.setAttribute('method', 'POST');
                form.setAttribute('action', esewaUrl);

                // Add eSewa parameters
                Object.entries(esewaData).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'hidden');
                    input.setAttribute('name', key);
                    input.setAttribute('value', value);
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
                return;
            }
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order. Please try again.');
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
                            <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">Shipping & Billing Address</h2>

                            {addresses.length > 0 && !showAddressForm && !selectedAddress && (
                                <div className="mb-6 space-y-4">
                                    {addresses.map(address => (
                                        <div key={address._id} className="border border-[#C4A484]/10 rounded-xl p-4 hover:bg-[#F8F5F1]/50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900">{address.fullName}</p>
                                                    <p className="text-[#8B5E34] mt-1">{address.phone}</p>
                                                    <p className="text-[#8B5E34]">{address.address}</p>
                                                    <p className="text-[#8B5E34]">{address.city}, {address.state} {address.pinCode}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleSelectAddress(address)}
                                                    className="text-[#C4A484] hover:text-[#8B5E34] transition-colors text-sm font-medium"
                                                >
                                                    {address.isDefault ? 'Selected' : 'Select'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
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
                                                        value="COD"
                                                        checked={paymentMethod === 'COD'}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        className="h-4 w-4 text-[#C4A484] focus:ring-[#C4A484]"
                                                    />
                                                    <span className="ml-3 text-gray-900">Cash on Delivery (COD)</span>
                                                </label>
                                            </div>
                                            <div className="border border-[#C4A484]/10 rounded-xl p-4 hover:bg-[#F8F5F1]/50 transition-colors">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        value="eSewa"
                                                        checked={paymentMethod === 'eSewa'}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        className="h-4 w-4 text-[#C4A484] focus:ring-[#C4A484]"
                                                    />
                                                    <span className="ml-3 text-gray-900">eSewa</span>
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
                                    <dd className="text-sm font-medium text-gray-900">Free</dd>
                                </div>
                                <div className="flex justify-between mt-4 pt-4 border-t border-[#C4A484]/10">
                                    <dt className="text-base font-medium text-gray-900">Order total</dt>
                                    <dd className="text-base font-medium text-gray-900">Rp {total.toLocaleString()}</dd>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={!selectedAddress || !paymentMethod || isProcessing || cartItems.length === 0}
                                    className={`w-full py-3 rounded-xl transition-colors ${selectedAddress && paymentMethod && !isProcessing && cartItems.length > 0
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
                                                : !paymentMethod
                                                    ? 'Select Payment Method'
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