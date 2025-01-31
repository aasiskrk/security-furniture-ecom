import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { getProductByIdApi } from '../api/apis.js';

const WISHLIST_COOKIE_KEY = 'furniture_wishlist';
const CART_COOKIE_KEY = 'furniture_cart';

const getStockStatus = (countInStock) => {
    if (countInStock === 0) return { label: 'Out of Stock', className: 'bg-red-100 text-red-800' };
    if (countInStock <= 10) return { label: `Only ${countInStock} left`, className: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', className: 'bg-green-100 text-green-800' };
};

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load wishlist from cookie and fetch product details
    useEffect(() => {
        const loadWishlist = async () => {
            try {
                setLoading(true);
                // Get product IDs from cookie
                const wishlistIds = JSON.parse(Cookies.get(WISHLIST_COOKIE_KEY) || '[]');

                if (wishlistIds.length === 0) {
                    setWishlistItems([]);
                    return;
                }

                // Fetch product details for each ID
                const productPromises = wishlistIds.map(id => getProductByIdApi(id));
                const products = await Promise.all(productPromises);

                // Map the responses to our wishlist format
                const items = products.map(response => {
                    const product = response.data;
                    return {
                        id: product._id,
                        name: product.name,
                        price: product.price,
                        color: product.colors[0]?.name || 'N/A',
                        category: product.category,
                        image: product.pictures?.[0] || '', // Safely access first picture
                        inStock: product.countInStock > 0,
                        countInStock: product.countInStock
                    };
                });

                setWishlistItems(items);
            } catch (error) {
                console.error('Error loading wishlist:', error);
                toast.error('Failed to load wishlist items');
            } finally {
                setLoading(false);
            }
        };

        loadWishlist();
    }, []);

    const removeFromWishlist = (id) => {
        try {
            // Remove from state
            setWishlistItems(items => items.filter(item => item.id !== id));

            // Remove from cookie
            const wishlistIds = JSON.parse(Cookies.get(WISHLIST_COOKIE_KEY) || '[]');
            const updatedIds = wishlistIds.filter(itemId => itemId !== id);
            Cookies.set(WISHLIST_COOKIE_KEY, JSON.stringify(updatedIds), { expires: 30 }); // Expires in 30 days

            // Dispatch event to update wishlist badge
            window.dispatchEvent(new Event('wishlistUpdated'));

            toast.success('Removed from wishlist');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error('Failed to remove item from wishlist');
        }
    };

    const addToCart = (item) => {
        try {
            // Check if product is out of stock
            if (item.countInStock === 0) {
                toast.error('This product is out of stock');
                return;
            }

            // Get current cart items
            const currentCart = JSON.parse(Cookies.get(CART_COOKIE_KEY) || '[]');

            // Check if item already exists in cart
            const existingItemIndex = currentCart.findIndex(
                cartItem => cartItem.productId === item.id
            );

            if (existingItemIndex !== -1) {
                // Update quantity if item exists
                if (currentCart[existingItemIndex].quantity >= item.countInStock) {
                    toast.error('Cannot add more items than available in stock');
                    return;
                }
                currentCart[existingItemIndex].quantity += 1;
            } else {
                // Add new item if it doesn't exist
                currentCart.push({
                    productId: item.id,
                    quantity: 1,
                    color: item.color || 'N/A'
                });
            }

            // Save updated cart to cookie
            Cookies.set(CART_COOKIE_KEY, JSON.stringify(currentCart), { expires: 30 });

            // Dispatch event to update cart badge
            window.dispatchEvent(new Event('cartUpdated'));

            toast.success('Added to cart');

            // Remove from wishlist and update wishlist badge
            removeFromWishlist(item.id);
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add item to cart');
        }
    };

    if (loading) {
        return (
            <div className="max-w-[2000px] mx-auto px-6 py-8">
                <div className="space-y-8">
                    <div className="animate-pulse">
                        <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#C4A484]/10 overflow-hidden">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="p-6 border-b border-[#C4A484]/10">
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
            </div>
        );
    }

    return (
        <div className="max-w-[2000px] mx-auto px-6 py-8">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">My Wishlist</h1>
                    <p className="mt-2 text-[#8B5E34]">Save your favorite items for later</p>
                </div>

                <div className="bg-white rounded-xl border border-[#C4A484]/10 overflow-hidden">
                    {wishlistItems.length > 0 ? (
                        <div className="divide-y divide-[#C4A484]/10">
                            {wishlistItems.map((item) => (
                                <div key={item.id} className="p-6 hover:bg-[#F8F5F1]/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={`https://localhost:5000${item.image}`}
                                                    alt={item.name}
                                                    className="w-24 h-24 object-cover rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {item.name}
                                                </h3>
                                                <div className="mt-1 space-y-1">
                                                    <p className="text-[#8B5E34]">Category: {item.category}</p>
                                                    <p className="text-[#8B5E34]">Color: {item.color}</p>
                                                    <p className="text-lg font-medium text-gray-900 mt-2">
                                                        Nrp {item.price.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-4">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => removeFromWishlist(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Remove from wishlist"
                                                >
                                                    <FiTrash2 className="w-5 h-5" />
                                                </button>
                                                {item.countInStock > 0 ? (
                                                    <button
                                                        onClick={() => addToCart(item)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-[#C4A484] text-white rounded-lg hover:bg-[#B39374] transition-colors"
                                                    >
                                                        <FiShoppingCart className="w-4 h-4" />
                                                        <span>Add to Cart</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-sm text-red-500 font-medium">Out of Stock</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <FiHeart className="mx-auto h-12 w-12 text-[#C4A484]" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Your Wishlist is Empty</h3>
                            <p className="mt-1 text-[#8B5E34]">Start saving your favorite items</p>
                            <Link
                                to="/shop"
                                className="inline-block mt-6 px-6 py-3 bg-[#C4A484] text-white rounded-xl hover:bg-[#B39374] transition-colors"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Wishlist; 