import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { getProductByIdApi, getAllProductsApi } from '../api/apis.js';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import DOMPurify from 'dompurify';

const WISHLIST_COOKIE_KEY = 'furniture_wishlist';
const CART_COOKIE_KEY = 'furniture_cart';

const getStockStatus = (countInStock) => {
    if (countInStock === 0) return { label: 'Out of Stock', className: 'text-red-500' };
    if (countInStock <= 10) return { label: `Only ${countInStock} left in stock`, className: 'text-yellow-500' };
    return { label: 'In Stock', className: 'text-green-500' };
};

// Add sanitization function
const sanitizeContent = (content) => {
    if (typeof content === 'string') {
        return DOMPurify.sanitize(content);
    }
    return content;
};

const ProductDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [moreProducts, setMoreProducts] = useState([]);
    const [loadingMore, setLoadingMore] = useState(true);

    // Check if product is in wishlist
    useEffect(() => {
        const wishlistIds = JSON.parse(Cookies.get(WISHLIST_COOKIE_KEY) || '[]');
        setIsWishlisted(wishlistIds.includes(id));
    }, [id]);

    const toggleWishlist = () => {
        try {
            const wishlistIds = JSON.parse(Cookies.get(WISHLIST_COOKIE_KEY) || '[]');
            let updatedIds;

            if (isWishlisted) {
                updatedIds = wishlistIds.filter(itemId => itemId !== id);
                toast.success('Removed from wishlist');
            } else {
                if (wishlistIds.includes(id)) {
                    toast.error('Item already in wishlist');
                    return;
                }
                updatedIds = [...wishlistIds, id];
                toast.success('Added to wishlist');
            }

            Cookies.set(WISHLIST_COOKIE_KEY, JSON.stringify(updatedIds), { expires: 30 });
            setIsWishlisted(!isWishlisted);

            // Dispatch custom event to update navbar badge
            window.dispatchEvent(new Event('wishlistUpdated'));
        } catch (error) {
            console.error('Error updating wishlist:', error);
            toast.error('Failed to update wishlist');
        }
    };

    const handleAddToCart = () => {
        try {
            if (!selectedColor) {
                toast.error('Please select a color');
                return;
            }

            // Check if product is out of stock
            if (product.countInStock === 0) {
                toast.error('This product is out of stock');
                return;
            }

            const cartData = JSON.parse(Cookies.get(CART_COOKIE_KEY) || '[]');

            // Check if product is already in cart with same color
            const existingItem = cartData.find(item =>
                item.productId === id && item.color === selectedColor
            );

            if (existingItem) {
                // Update quantity if not exceeding stock
                if (existingItem.quantity < product.countInStock) {
                    existingItem.quantity += 1;
                    Cookies.set(CART_COOKIE_KEY, JSON.stringify(cartData), { expires: 30 });
                    toast.success('Updated quantity in cart');
                } else {
                    toast.error('Maximum stock limit reached');
                    return;
                }
            } else {
                // Add new item
                cartData.push({
                    productId: id,
                    quantity: 1,
                    color: selectedColor
                });
                Cookies.set(CART_COOKIE_KEY, JSON.stringify(cartData), { expires: 30 });
                toast.success('Added to cart');
            }

            // Dispatch event to update cart count in navbar
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart');
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await getProductByIdApi(id);
                setProduct(response.data);
                // Set initial selected color
                if (response.data.colors && response.data.colors.length > 0) {
                    setSelectedColor(response.data.colors[0].name);
                }
            } catch (error) {
                toast.error('Failed to fetch product details');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Fetch more products
    useEffect(() => {
        const fetchMoreProducts = async () => {
            try {
                setLoadingMore(true);
                const response = await getAllProductsApi();
                const allProducts = response.data.products;

                // Filter out the current product and get random 4 products
                const otherProducts = allProducts
                    .filter(p => p._id !== id)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 4);

                setMoreProducts(otherProducts);
            } catch (error) {
                console.error('Error fetching more products:', error);
            } finally {
                setLoadingMore(false);
            }
        };

        if (product) {
            fetchMoreProducts();
        }
    }, [id, product]);

    // Hide category section when on product details page
    useEffect(() => {
        const body = document.body;
        body.classList.add('hide-categories');
        return () => body.classList.remove('hide-categories');
    }, []);

    if (loading) {
        return (
            <div className="max-w-[2000px] mx-auto px-6 py-8 bg-white">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-1/2 animate-pulse">
                        <div className="aspect-w-16 aspect-h-12 rounded-xl bg-gray-200 mb-4"></div>
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((_, index) => (
                                <div key={index} className="aspect-w-1 aspect-h-1 rounded-xl bg-gray-200"></div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:w-1/2 space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-[2000px] mx-auto px-6 py-8 bg-white">
                <div className="text-center text-gray-600">
                    Product not found
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[2000px] mx-auto px-6 py-8 bg-white">
            <div className="flex flex-col lg:flex-row gap-12">
                {/* Left Column - Images */}
                <div className="lg:w-1/2">
                    <div className="aspect-w-16 aspect-h-12 rounded-xl overflow-hidden mb-4">
                        <img
                            src={`https://localhost:5000${product.pictures[selectedImage]}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {product.pictures.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`aspect-w-1 aspect-h-1 rounded-xl overflow-hidden border-2 ${selectedImage === index ? 'border-[#C4A484]' : 'border-transparent'
                                    }`}
                            >
                                <img
                                    src={`https://localhost:5000${image}`}
                                    alt={`${product.name} ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Column - Product Info */}
                <div className="lg:w-1/2">
                    {/* Category and Subcategory Navigation */}
                    <nav className="flex items-center gap-2 text-sm mb-6">
                        <Link 
                            to="/shop" 
                            className="text-gray-500 hover:text-[#C4A484] transition-colors"
                        >
                            Shop
                        </Link>
                        <span className="text-gray-400">/</span>
                        <Link 
                            to={`/shop?category=${product.category}`}
                            className="text-gray-500 hover:text-[#C4A484] transition-colors"
                        >
                            {sanitizeContent(product.category)}
                        </Link>
                        {product.subCategory && (
                            <>
                                <span className="text-gray-400">/</span>
                                <Link 
                                    to={`/shop?category=${product.category}&subcategory=${product.subCategory}`}
                                    className="text-gray-500 hover:text-[#C4A484] transition-colors"
                                >
                                    {sanitizeContent(product.subCategory)}
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Category and Subcategory Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <Link
                            to={`/shop?category=${product.category}`}
                            className="px-3 py-1 bg-[#C4A484]/10 text-[#C4A484] rounded-full text-sm font-medium hover:bg-[#C4A484]/20 transition-colors"
                        >
                            {sanitizeContent(product.category)}
                        </Link>
                        {product.subCategory && (
                            <Link
                                to={`/shop?category=${product.category}&subcategory=${product.subCategory}`}
                                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                                {sanitizeContent(product.subCategory)}
                            </Link>
                        )}
                    </div>

                    {/* Status and Rating */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Availability</h3>
                            <p className={`text-sm ${getStockStatus(product.countInStock).className}`}>
                                {sanitizeContent(getStockStatus(product.countInStock).label)}
                            </p>
                        </div>
                    </div>

                    {/* Product Title and Description */}
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">{sanitizeContent(product.name)}</h1>
                    <p className="text-gray-600 mb-8">{sanitizeContent(product.description)}</p>

                    {/* Price */}
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-3xl font-bold text-[#8B5E34]">Nrp {product.price.toLocaleString()}</span>
                    </div>

                    {/* Key Specifications */}
                    <div className="bg-[#F8F5F1] rounded-xl p-6 mb-8">
                        <h3 className="text-lg font-serif font-semibold text-gray-900 mb-4">Product Details</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Dimensions</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>Length: {product.dimensions.length} {product.dimensions.unit}</p>
                                    <p>Width: {product.dimensions.width} {product.dimensions.unit}</p>
                                    <p>Height: {product.dimensions.height} {product.dimensions.unit}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Material & Weight</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>Material: {sanitizeContent(product.material)}</p>
                                    <p>Weight: {product.weight.value} {product.weight.unit}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mb-8">
                        <h3 className="text-lg font-serif font-semibold text-gray-900 mb-4">Key Features</h3>
                        <ul className="space-y-2">
                            {product.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-gray-600">
                                    <svg className="w-5 h-5 text-[#C4A484]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {sanitizeContent(feature)}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Color Selection */}
                    <div className="mb-8">
                        <h3 className="text-lg font-serif font-semibold text-gray-900 mb-4">Color</h3>
                        <div className="flex gap-4">
                            {product.colors.map(color => (
                                <button
                                    key={color.name}
                                    onClick={() => setSelectedColor(color.name)}
                                    className={`group relative w-12 h-12 rounded-full ${selectedColor === color.name ? 'ring-2 ring-[#C4A484] ring-offset-2' : ''
                                        }`}
                                >
                                    <div
                                        className="w-full h-full rounded-full"
                                        style={{ backgroundColor: color.code }}
                                    />
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {sanitizeContent(color.name)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Add to Cart and Wishlist */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleAddToCart}
                            className={`flex-1 px-8 py-3 rounded-xl transition-colors ${product.countInStock > 0
                                ? 'bg-[#C4A484] text-white hover:bg-[#B39374]'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            disabled={product.countInStock === 0}
                        >
                            {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button
                            onClick={toggleWishlist}
                            className="p-3 rounded-xl border border-[#C4A484]/20 hover:border-[#C4A484] transition-colors"
                        >
                            {isWishlisted ? (
                                <FaHeart className="w-6 h-6 text-[#C4A484]" />
                            ) : (
                                <FaRegHeart className="w-6 h-6 text-gray-400 hover:text-[#C4A484]" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* More Products Section */}
            <div className="max-w-[2000px] mx-auto px-6 mt-24 mb-12">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">More Products You May Like</h2>

                {loadingMore ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {moreProducts.map((product) => (
                            <Link
                                key={product._id}
                                to={`/product/${product._id}`}
                                className="group"
                            >
                                <div className="bg-white rounded-lg overflow-hidden border-2 border-[#C4A484]/10 shadow-sm hover:shadow-lg transition-all duration-150">
                                    <div className="aspect-square overflow-hidden">
                                        <img
                                            src={`https://localhost:5000${product.pictures[0]}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-[#C4A484] transition-colors">
                                            {sanitizeContent(product.name)}
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">{sanitizeContent(product.category)}</span>
                                            <span className="font-medium text-[#8B5E34]">
                                                Nrp {product.price.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails; 