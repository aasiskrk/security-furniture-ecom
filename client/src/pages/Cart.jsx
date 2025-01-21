import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { getProductByIdApi } from '../api/apis.js';

const CART_COOKIE_KEY = 'furniture_cart';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load cart from cookie and fetch product details
    useEffect(() => {
        const loadCart = async () => {
            try {
                setLoading(true);
                // Get cart items from cookie
                const cartData = JSON.parse(Cookies.get(CART_COOKIE_KEY) || '[]');

                if (cartData.length === 0) {
                    setCartItems([]);
                    setLoading(false);
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
                setLoading(false);
            }
        };

        loadCart();
    }, []);

    const updateQuantity = (id, change) => {
        try {
            const updatedItems = cartItems.map(item => {
                if (item.id === id) {
                    const newQuantity = Math.max(1, Math.min(item.countInStock, item.quantity + change));
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });

            setCartItems(updatedItems);

            // Update cookie
            const cookieData = updatedItems.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                color: item.color
            }));
            Cookies.set(CART_COOKIE_KEY, JSON.stringify(cookieData), { expires: 30 });

            // Dispatch event to update cart count in navbar
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Failed to update quantity');
        }
    };

    const removeItem = (id) => {
        try {
            const updatedItems = cartItems.filter(item => item.id !== id);
            setCartItems(updatedItems);

            // Update cookie
            const cookieData = updatedItems.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                color: item.color
            }));
            Cookies.set(CART_COOKIE_KEY, JSON.stringify(cookieData), { expires: 30 });

            toast.success('Item removed from cart');

            // Dispatch event to update cart count in navbar
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Failed to remove item');
        }
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = cartItems.length > 0 ? 50000 : 0; // Fixed shipping cost
    const total = subtotal + shipping;

    if (loading) {
        return (
            <div className="max-w-[2000px] mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-2/3">
                        <div className="h-8 w-48 bg-gray-200 rounded mb-8 animate-pulse"></div>
                        <div className="space-y-6">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="bg-white rounded-xl border border-[#C4A484]/10 p-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                                        <div className="flex-1 space-y-3">
                                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                                            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                                            <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-xl border border-[#C4A484]/10 p-6 animate-pulse">
                            <div className="h-6 w-32 bg-gray-200 rounded mb-6"></div>
                            <div className="space-y-4">
                                <div className="h-4 w-full bg-gray-200 rounded"></div>
                                <div className="h-4 w-full bg-gray-200 rounded"></div>
                                <div className="h-4 w-full bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[2000px] mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row gap-12">
                {/* Left Column - Cart Items */}
                <div className="lg:w-2/3">
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Shopping Cart</h1>

                    {cartItems.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-[#C4A484]/10">
                            <p className="text-gray-600 mb-6">Your cart is empty</p>
                            <Link
                                to="/shop"
                                className="inline-block bg-[#C4A484] text-white px-6 py-3 rounded-xl hover:bg-[#B39374] transition-colors"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-[#C4A484]/10 overflow-hidden">
                            {cartItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`p-6 flex items-center gap-6 ${index !== cartItems.length - 1 ? 'border-b border-[#C4A484]/10' : ''
                                        }`}
                                >
                                    {/* Product Image */}
                                    <div className="w-24 h-24 flex-shrink-0">
                                        <img
                                            src={`http://localhost:5000${item.image}`}
                                            alt={item.name}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">{item.name}</h3>
                                        <p className="text-sm text-gray-600 mb-2">Color: {item.color}</p>
                                        <p className="text-lg font-medium text-[#8B5E34]">
                                            Rp {item.price.toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="p-1 rounded-lg hover:bg-[#F8F5F1] text-gray-600 transition-colors"
                                            disabled={item.quantity <= 1}
                                        >
                                            <FiMinus className="w-5 h-5" />
                                        </button>
                                        <span className="w-12 text-center font-medium text-gray-900">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="p-1 rounded-lg hover:bg-[#F8F5F1] text-gray-600 transition-colors"
                                            disabled={item.quantity >= item.countInStock}
                                        >
                                            <FiPlus className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column - Order Summary */}
                {cartItems.length > 0 && (
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-xl border border-[#C4A484]/10 p-6">
                            <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>Rp {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>Rp {shipping.toLocaleString()}</span>
                                </div>
                                <div className="border-t border-[#C4A484]/10 pt-4">
                                    <div className="flex justify-between text-lg font-medium text-gray-900">
                                        <span>Total</span>
                                        <span>Rp {total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                to="/checkout"
                                className="block w-full bg-[#C4A484] text-white text-center py-3 rounded-xl hover:bg-[#B39374] transition-colors mb-4"
                            >
                                Proceed to Checkout
                            </Link>

                            <Link
                                to="/shop"
                                className="block w-full text-center text-[#8B5E34] hover:text-[#C4A484] transition-colors"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart; 