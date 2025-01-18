import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

const Cart = () => {
    // Sample cart data
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: 'Modern Leather Sofa',
            price: 2499999,
            color: 'Brown',
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3'
        },
        {
            id: 2,
            name: 'Dining Table Set',
            price: 1899999,
            color: 'Natural Wood',
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3'
        }
    ]);

    const updateQuantity = (id, change) => {
        setCartItems(items =>
            items.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + change) }
                    : item
            )
        );
    };

    const removeItem = (id) => {
        setCartItems(items => items.filter(item => item.id !== id));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 50000; // Fixed shipping cost
    const total = subtotal + shipping;

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
                                            src={item.image}
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
                                        >
                                            <FiMinus className="w-5 h-5" />
                                        </button>
                                        <span className="w-12 text-center font-medium text-gray-900">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="p-1 rounded-lg hover:bg-[#F8F5F1] text-gray-600 transition-colors"
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

                            <button className="w-full bg-[#C4A484] text-white py-3 rounded-xl hover:bg-[#B39374] transition-colors mb-4">
                                Proceed to Checkout
                            </button>

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