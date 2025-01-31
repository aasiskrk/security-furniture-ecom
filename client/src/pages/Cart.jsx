import { useState, useEffect } from 'react';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { getAllProductsApi } from '../api/apis.js';

const CART_COOKIE_KEY = 'furniture_cart';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const loadCartAndProducts = async () => {
            try {
                setLoading(true);
                // Load cart data from cookie
                const cartData = Cookies.get(CART_COOKIE_KEY);
                const cartItems = cartData ? JSON.parse(cartData) : [];
                
                if (cartItems.length > 0) {
                    // Fetch all products
                    const response = await getAllProductsApi();
                    const productsData = response.data.products;
                    
                    // Create a map of products by ID
                    const productsMap = {};
                    productsData.forEach(product => {
                        productsMap[product._id] = product;
                    });
                    
                    // Combine cart items with product details
                    const enrichedCartItems = cartItems.map(item => ({
                        ...item,
                        product: productsMap[item.productId]
                    })).filter(item => item.product); // Remove items whose products don't exist
                    
                    setProducts(productsMap);
                    setCartItems(enrichedCartItems);
                } else {
                    setCartItems([]);
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                toast.error('Failed to load cart items');
            } finally {
                setLoading(false);
            }
        };

        loadCartAndProducts();
    }, []);

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        const updatedItems = cartItems.map(item => {
            if (item.productId === itemId) {
                const product = products[itemId];
                if (newQuantity > product.countInStock) {
                    toast.error(`Only ${product.countInStock} items available in stock`);
                    return item;
                }
                return { ...item, quantity: newQuantity };
            }
            return item;
        });

        // Update cookie with basic cart data
        const cookieData = updatedItems.map(({ productId, quantity, color }) => ({
            productId, quantity, color
        }));
        
        setCartItems(updatedItems);
        Cookies.set(CART_COOKIE_KEY, JSON.stringify(cookieData), { expires: 30 });
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const removeItem = (itemId) => {
        const updatedItems = cartItems.filter(item => item.productId !== itemId);
        
        // Update cookie with basic cart data
        const cookieData = updatedItems.map(({ productId, quantity, color }) => ({
            productId, quantity, color
        }));

        if (updatedItems.length === 0) {
            Cookies.remove(CART_COOKIE_KEY);
        } else {
            Cookies.set(CART_COOKIE_KEY, JSON.stringify(cookieData), { expires: 30 });
        }

        setCartItems(updatedItems);
        window.dispatchEvent(new Event('cartUpdated'));
        toast.success('Item removed from cart');
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const product = products[item.productId];
            return total + (product?.price * item.quantity || 0);
        }, 0);
    };

    if (loading) {
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

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-[#F8F5F1]/30 flex items-center justify-center">
                <div className="text-center px-6 py-16 max-w-md mx-auto">
                    <div className="bg-white rounded-xl p-8 border border-[#C4A484]/10 shadow-sm">
                        <FiShoppingBag className="mx-auto h-16 w-16 text-[#C4A484]" />
                        <h2 className="mt-6 text-2xl font-serif font-bold text-gray-900">Your Cart is Empty</h2>
                        <p className="mt-3 text-[#8B5E34]">Looks like you haven't added anything to your cart yet.</p>
                        <button
                            onClick={() => navigate('/shop')}
                            className="mt-6 w-full px-6 py-3 rounded-lg bg-[#C4A484] text-white hover:bg-[#B39374] transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                            <FiShoppingBag className="w-5 h-5" />
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F5F1]/30 py-8">
            <div className="max-w-[2000px] mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Shopping Cart</h1>
                        <div className="bg-white rounded-xl border border-[#C4A484]/10 divide-y divide-[#C4A484]/10">
                            {cartItems.map((item) => {
                                const product = products[item.productId];
                                if (!product) return null;
                                
                                return (
                                    <div key={item.productId} className="p-6">
                                        <div className="flex gap-6">
                                            <img
                                                src={`https://localhost:5000${product.pictures[0]}`}
                                                alt={product.name}
                                                className="w-32 h-32 object-cover rounded-xl border border-[#C4A484]/10"
                                            />
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                                                        <p className="mt-1 text-[#8B5E34]">Color: {item.color}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.productId)}
                                                        className="text-[#8B5E34] hover:text-red-600 transition-colors"
                                                    >
                                                        <FiTrash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                            className="w-8 h-8 rounded-lg border border-[#C4A484]/20 flex items-center justify-center text-[#8B5E34] hover:bg-[#F8F5F1] transition-colors"
                                                        >
                                                            <FiMinus className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-12 text-center font-medium text-gray-900">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                            className="w-8 h-8 rounded-lg border border-[#C4A484]/20 flex items-center justify-center text-[#8B5E34] hover:bg-[#F8F5F1] transition-colors"
                                                        >
                                                            <FiPlus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <p className="font-medium text-gray-900">
                                                        Nrp {(product.price * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                                {item.quantity >= product.countInStock && (
                                                    <p className="mt-2 text-sm text-amber-600">
                                                        Maximum stock reached
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:sticky lg:top-8 h-fit">
                        <div className="bg-white rounded-xl border border-[#C4A484]/10 p-6">
                            <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">Order Summary</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between text-[#8B5E34]">
                                    <span>Subtotal</span>
                                    <span>Nrp {calculateTotal().toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[#8B5E34]">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="pt-4 border-t border-[#C4A484]/10">
                                    <div className="flex justify-between text-lg font-medium text-gray-900">
                                        <span>Total</span>
                                        <span>Nrp {calculateTotal().toLocaleString()}</span>
                                    </div>
                                    <p className="mt-1 text-sm text-green-600">Free shipping on all orders!</p>
                                </div>
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full mt-2 px-6 py-3 rounded-lg bg-[#C4A484] text-white hover:bg-[#B39374] transition-colors text-sm font-medium"
                                >
                                    Proceed to Checkout
                                </button>
                                <button
                                    onClick={() => navigate('/shop')}
                                    className="w-full px-6 py-3 rounded-lg border border-[#C4A484]/20 text-[#8B5E34] hover:bg-[#F8F5F1] transition-colors text-sm font-medium"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart; 