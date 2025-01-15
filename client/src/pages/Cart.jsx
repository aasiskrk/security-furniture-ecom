import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Cart = () => {
    const [cart, setCart] = useState({ items: [], totalAmount: 0 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/cart');
            setCart(data);
        } catch (error) {
            toast.error('Failed to fetch cart');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            const { data } = await axios.put('http://localhost:5000/api/cart', {
                productId,
                quantity: parseInt(quantity)
            });
            setCart(data);
            toast.success('Cart updated');
        } catch (error) {
            toast.error('Failed to update cart');
        }
    };

    const removeItem = async (productId) => {
        try {
            const { data } = await axios.delete(`http://localhost:5000/api/cart/item/${productId}`);
            setCart(data);
            toast.success('Item removed from cart');
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    const handleCheckout = async () => {
        try {
            // Navigate to checkout with cart data
            navigate('/checkout', { state: { cart } });
        } catch (error) {
            toast.error('Failed to proceed to checkout');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (cart.items.length === 0) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
                <button
                    onClick={() => navigate('/')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h2>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                {cart.items.map((item) => (
                    <div
                        key={item.product._id}
                        className="flex items-center py-4 border-b last:border-b-0"
                    >
                        <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-24 h-24 object-cover rounded"
                        />
                        <div className="flex-1 ml-4">
                            <h3 className="text-lg font-semibold text-gray-800">{item.product.name}</h3>
                            <p className="text-gray-600">${item.product.price}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <select
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.product._id, e.target.value)}
                                className="border rounded-md p-1"
                            >
                                {[...Array(10)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => removeItem(item.product._id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span>${cart.totalAmount}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart; 