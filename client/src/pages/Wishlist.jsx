import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';

const Wishlist = () => {
    // Sample wishlist data
    const [wishlistItems, setWishlistItems] = useState([
        {
            id: 1,
            name: 'Modern Leather Sofa',
            price: 2499999,
            color: 'Brown',
            category: 'Living Room',
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3',
            inStock: true
        },
        {
            id: 2,
            name: 'Dining Table Set',
            price: 1899999,
            color: 'Natural Wood',
            category: 'Dining Room',
            image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3',
            inStock: true
        },
        {
            id: 3,
            name: 'Queen Size Bed Frame',
            price: 1299999,
            color: 'White Oak',
            category: 'Bedroom',
            image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-4.0.3',
            inStock: false
        }
    ]);

    const removeFromWishlist = (id) => {
        setWishlistItems(items => items.filter(item => item.id !== id));
    };

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
                                                    src={item.image}
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
                                                        Rp {item.price.toLocaleString()}
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
                                                {item.inStock ? (
                                                    <button
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