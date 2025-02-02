import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown, FiGrid, FiList, FiShoppingCart, FiShoppingBag } from 'react-icons/fi';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { getAllProductsApi, getProductCategoriesApi } from '../api/apis.js';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import DOMPurify from 'dompurify';

// Image cache for faster loading
const imageCache = new Map();

const preloadImage = (src) => {
    if (imageCache.has(src)) {
        return imageCache.get(src);
    }

    const promise = new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(src);
        img.onerror = reject;
    });

    imageCache.set(src, promise);
    return promise;
};

const WISHLIST_COOKIE_KEY = 'furniture_wishlist';
const CART_COOKIE_KEY = 'furniture_cart';

const getStockStatus = (countInStock) => {
    if (countInStock === 0) return { label: 'Out of Stock', className: 'bg-red-100 text-red-800' };
    if (countInStock <= 10) return { label: `Only ${countInStock} left`, className: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', className: 'bg-green-100 text-green-800' };
};

// Add sanitization function
const sanitizeContent = (content) => {
    if (typeof content === 'string') {
        return DOMPurify.sanitize(content);
    }
    return content;
};

const ProductCard = ({ product, view }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [loadedImages, setLoadedImages] = useState(new Set());
    const autoScrollTimeout = useRef(null);
    const isHovered = useRef(false);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Preload all product images
    useEffect(() => {
        const preloadImages = async () => {
            try {
                const imagePaths = product.pictures.map(pic => `https://localhost:5000${pic}`);
                await Promise.all(imagePaths.map(preloadImage));
                setLoadedImages(new Set(imagePaths));
            } catch (error) {
                console.error('Error preloading images:', error);
            }
        };
        preloadImages();
    }, [product.pictures]);

    // Optimized auto-scroll with pause on hover
    useEffect(() => {
        if (product.pictures.length > 1 && !isHovered.current) {
            autoScrollTimeout.current = setTimeout(() => {
                setSelectedImageIndex((prev) => (prev + 1) % product.pictures.length);
            }, 3000);
        }
        return () => {
            if (autoScrollTimeout.current) {
                clearTimeout(autoScrollTimeout.current);
            }
        };
    }, [selectedImageIndex, product.pictures.length]);

    const handleMouseEnter = useCallback(() => {
        isHovered.current = true;
        if (autoScrollTimeout.current) {
            clearTimeout(autoScrollTimeout.current);
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        isHovered.current = false;
        if (product.pictures.length > 1) {
            autoScrollTimeout.current = setTimeout(() => {
                setSelectedImageIndex((prev) => (prev + 1) % product.pictures.length);
            }, 3000);
        }
    }, [product.pictures.length]);

    const handleImageLoad = useCallback(() => {
        setIsImageLoaded(true);
    }, []);

    const currentImageUrl = `https://localhost:5000${product.pictures[selectedImageIndex]}`;

    const handleAddToCart = (e) => {
        e.preventDefault(); // Prevent navigation
        try {
            // Check if product is out of stock
            if (product.countInStock === 0) {
                toast.error('This product is out of stock');
                return;
            }

            const cartData = JSON.parse(Cookies.get(CART_COOKIE_KEY) || '[]');

            // Check if product is already in cart
            const existingItem = cartData.find(item => item.productId === product._id);

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
                    productId: product._id,
                    quantity: 1,
                    color: product.colors[0]?.name || 'N/A'
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

    // Check if product is in wishlist
    useEffect(() => {
        const wishlistIds = JSON.parse(Cookies.get(WISHLIST_COOKIE_KEY) || '[]');
        setIsWishlisted(wishlistIds.includes(product._id));
    }, [product._id]);

    const handleAddToWishlist = (e) => {
        e.preventDefault(); // Prevent navigation
        try {
            const wishlistIds = JSON.parse(Cookies.get(WISHLIST_COOKIE_KEY) || '[]');
            let updatedIds;

            if (isWishlisted) {
                updatedIds = wishlistIds.filter(itemId => itemId !== product._id);
                toast.success('Removed from wishlist');
            } else {
                if (wishlistIds.includes(product._id)) {
                    toast.error('Item already in wishlist');
                    return;
                }
                updatedIds = [...wishlistIds, product._id];
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

    // Update the wishlist button in both list and grid views
    const WishlistButton = ({ size = "w-5 h-5" }) => (
        <button
            onClick={handleAddToWishlist}
            className="p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 backdrop-blur-sm transition-all duration-150"
        >
            {isWishlisted ? (
                <FaHeart className={size + " text-red-500"} />
            ) : (
                <FaRegHeart className={size} />
            )}
        </button>
    );

    if (view === 'list') {
        return (
            <Link
                to={`/product/${product._id}`}
                className="block"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="flex gap-6 bg-white rounded-lg border-2 border-[#C4A484]/20 shadow-sm hover:shadow-lg transition-all duration-150">
                    <div className="flex-shrink-0 w-80">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-l-lg m-[1px]">
                            {/* Loading placeholder */}
                            {!isImageLoaded && (
                                <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                            )}
                            {/* Main Image with fade-in effect */}
                            <img
                                src={currentImageUrl}
                                alt={product.name}
                                className={`w-full h-full object-cover will-change-transform transition-all duration-150 group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'
                                    }`}
                                onLoad={handleImageLoad}
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-150"></div>

                            {/* Stock Status Badge */}
                            <div className="absolute top-3 left-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatus(product.countInStock).className}`}>
                                    {getStockStatus(product.countInStock).label}
                                </span>
                            </div>

                            {/* Thumbnail Images Overlay */}
                            {product.pictures.length > 1 && (
                                <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-2 bg-black/30 backdrop-blur-sm">
                                    {product.pictures.map((pic, index) => (
                                        <button
                                            key={index}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSelectedImageIndex(index);
                                            }}
                                            className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-transform hover:scale-105 ${selectedImageIndex === index ? 'border-white' : 'border-transparent'
                                                }`}
                                        >
                                            <img
                                                src={`https://localhost:5000${pic}`}
                                                alt={`${product.name} view ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="absolute top-3 right-3 flex gap-2">
                                <WishlistButton />
                                <button
                                    onClick={handleAddToCart}
                                    className={`p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm transition-all duration-150 ${product.countInStock === 0
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:text-[#C4A484]'
                                        }`}
                                    disabled={product.countInStock === 0}
                                >
                                    <FiShoppingCart className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-[#C4A484]">{sanitizeContent(product.category)}</span>
                                {product.subCategory && (
                                    <span className="text-xs text-gray-500">{sanitizeContent(product.subCategory)}</span>
                                )}
                            </div>
                            <div className="flex -space-x-1.5">
                                {product.colors.map((color, index) => (
                                    <div
                                        key={index}
                                        className="w-5 h-5 rounded-full border-2 border-white ring-1 ring-[#C4A484]/10"
                                        style={{ backgroundColor: color.code }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 group-hover:text-[#C4A484] transition-colors">
                            {sanitizeContent(product.name)}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{sanitizeContent(product.description)}</p>
                        <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">Material:</span>
                                <span className="font-medium text-gray-900">{sanitizeContent(product.material)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">Stock:</span>
                                <span className="font-medium text-gray-900">{product.countInStock} units</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <p className="font-medium text-xl text-gray-900">
                                Nrp {product.price.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // Grid View
    return (
        <div
            className="relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link to={`/product/${product._id}`} className="block w-full">
                <div className="bg-white rounded-lg overflow-hidden border-2 border-[#C4A484]/20 shadow-sm hover:shadow-lg transition-all duration-150 h-full flex flex-col">
                    <div className="relative aspect-square overflow-hidden m-[1px]">
                        {/* Loading placeholder */}
                        {!isImageLoaded && (
                            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                        )}
                        {/* Main Image with fade-in effect */}
                        <img
                            src={currentImageUrl}
                            alt={product.name}
                            className={`w-full h-full object-cover will-change-transform transition-all duration-150 group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'
                                }`}
                            onLoad={handleImageLoad}
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-150"></div>

                        {/* Stock Status Badge */}
                        <div className="absolute top-3 left-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatus(product.countInStock).className}`}>
                                {getStockStatus(product.countInStock).label}
                            </span>
                        </div>

                        {/* Thumbnail Images Overlay */}
                        {product.pictures.length > 1 && (
                            <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-2 bg-black/30 backdrop-blur-sm">
                                {product.pictures.map((pic, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedImageIndex(index);
                                        }}
                                        className={`w-10 h-10 rounded-md overflow-hidden border-2 transition-transform hover:scale-105 ${selectedImageIndex === index ? 'border-white' : 'border-transparent'
                                            }`}
                                    >
                                        <img
                                            src={`https://localhost:5000${pic}`}
                                            alt={`${product.name} view ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="absolute top-3 right-3 flex gap-2">
                            <WishlistButton size="w-4 h-4" />
                            <button
                                onClick={handleAddToCart}
                                className={`p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm transition-all duration-150 ${product.countInStock === 0
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-600 hover:text-[#C4A484]'
                                    }`}
                                disabled={product.countInStock === 0}
                            >
                                <FiShoppingCart className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-[#C4A484]">{sanitizeContent(product.category)}</span>
                                {product.subCategory && (
                                    <span className="text-xs text-gray-500">{sanitizeContent(product.subCategory)}</span>
                                )}
                            </div>
                            <div className="flex -space-x-1.5">
                                {product.colors.map((color, index) => (
                                    <div
                                        key={index}
                                        className="w-4 h-4 rounded-full border-2 border-white ring-1 ring-[#C4A484]/10"
                                        style={{ backgroundColor: color.code }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                        <h3 className="text-lg font-serif font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#C4A484] transition-colors">
                            {sanitizeContent(product.name)}
                        </h3>
                        <div className="flex items-center justify-between mt-auto">
                            <p className="text-gray-600 text-sm line-clamp-1">{sanitizeContent(product.material)}</p>
                            <p className="font-medium text-gray-900 whitespace-nowrap">
                                Nrp {product.price.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

const Shop = () => {
    const [searchParams] = useSearchParams();
    const categoryFromUrl = searchParams.get('category');
    const subcategoryFromUrl = searchParams.get('subcategory');
    const searchFromUrl = searchParams.get('search');
    
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // Store all products for filter options
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        categories: categoryFromUrl ? [categoryFromUrl] : [],
        subcategories: subcategoryFromUrl ? [subcategoryFromUrl] : [],
        priceRange: [0, 10000000],
        materials: [],
        colors: [],
        sortBy: 'newest',
        search: searchFromUrl || ''
    });

    // State for filter options from backend
    const [filterOptions, setFilterOptions] = useState({
        categories: [],
        subcategories: [],
        materials: [],
        colors: [],
        sortOptions: [
            { value: 'newest', label: 'Newest First' },
            { value: 'price_asc', label: 'Price: Low to High' },
            { value: 'price_desc', label: 'Price: High to Low' }
        ]
    });

    // Fetch products based on filters
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {
                sortBy: selectedFilters.sortBy,
                minPrice: selectedFilters.priceRange[0],
                maxPrice: selectedFilters.priceRange[1]
            };

            if (selectedFilters.search) {
                params.search = selectedFilters.search;
            }

            if (selectedFilters.categories.length > 0) {
                params.categories = selectedFilters.categories;
            }

            if (selectedFilters.subcategories.length > 0) {
                params.subcategories = selectedFilters.subcategories;
            }

            if (selectedFilters.materials.length > 0) {
                params.materials = selectedFilters.materials;
            }

            if (selectedFilters.colors.length > 0) {
                params.colors = selectedFilters.colors;
            }

            const response = await getAllProductsApi(params);
            
            // Store all products on first load
            if (!allProducts.length) {
                setAllProducts(response.data.products || []);
            }
            
            // Client-side filtering as fallback
            let filteredProducts = response.data.products || [];

            // Apply search filter if backend filtering didn't work
            if (selectedFilters.search) {
                const searchLower = selectedFilters.search.toLowerCase();
                filteredProducts = filteredProducts.filter(product => 
                    product.name.toLowerCase().includes(searchLower) ||
                    product.description.toLowerCase().includes(searchLower) ||
                    product.category.toLowerCase().includes(searchLower) ||
                    (product.subCategory && product.subCategory.toLowerCase().includes(searchLower))
                );
            }

            // Apply category and subcategory filters if backend filtering didn't work
            if (selectedFilters.categories.length > 0 || selectedFilters.subcategories.length > 0) {
                filteredProducts = filteredProducts.filter(product => {
                    const categoryMatch = selectedFilters.categories.length === 0 || 
                        selectedFilters.categories.includes(product.category);
                    const subcategoryMatch = selectedFilters.subcategories.length === 0 || 
                        selectedFilters.subcategories.includes(product.subCategory);
                    return categoryMatch && subcategoryMatch;
                });
            }

            // Apply material filter if backend filtering didn't work
            if (selectedFilters.materials.length > 0) {
                filteredProducts = filteredProducts.filter(product => 
                    selectedFilters.materials.includes(product.material)
                );
            }

            // Apply color filter if backend filtering didn't work
            if (selectedFilters.colors.length > 0) {
                filteredProducts = filteredProducts.filter(product => 
                    product.colors.some(color => 
                        selectedFilters.colors.includes(color.name)
                    )
                );
            }

            setProducts(filteredProducts);
        } catch (error) {
            toast.error('Failed to fetch products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Update filter options using all products
    useEffect(() => {
        const updateFilterOptions = () => {
            // Get unique materials and colors from all products
            const uniqueMaterials = new Set();
            const uniqueColors = new Set();
            const colorMap = new Map();
            const uniqueCategories = new Map();
            const uniqueSubcategories = new Map();

            allProducts.forEach(product => {
                if (product.material) {
                    uniqueMaterials.add(product.material);
                }
                if (product.colors) {
                    product.colors.forEach(color => {
                        uniqueColors.add(color.name);
                        colorMap.set(color.name, color.code);
                    });
                }
                if (product.category) {
                    if (!uniqueCategories.has(product.category)) {
                        uniqueCategories.set(product.category, new Set());
                    }
                    if (product.subCategory) {
                        const categorySet = uniqueCategories.get(product.category);
                        if (categorySet) {
                            categorySet.add(product.subCategory);
                            uniqueSubcategories.set(product.subCategory, product.category);
                        }
                    }
                }
            });

            // Get all categories from the navbar
            const navbarCategories = [
                "Living Room", "Bedroom", "Dining Room", "Kitchen", 
                "Office", "Outdoor", "Kids", "Storage", "Other"
            ];

            // Combine navbar categories with existing categories
            navbarCategories.forEach(cat => {
                if (!uniqueCategories.has(cat)) {
                    uniqueCategories.set(cat, new Set());
                }
            });

            // Convert categories and their subcategories
            const categories = Array.from(uniqueCategories.entries()).map(([category, subcategories]) => ({
                name: category,
                subcategories: Array.from(subcategories || []),
                count: products.filter(p => p.category === category).length
            })).sort((a, b) => b.count - a.count);

            // Convert subcategories with their counts
            const subcategories = Array.from(uniqueSubcategories.entries()).map(([subcategory, parentCategory]) => ({
                name: subcategory,
                parentCategory: parentCategory,
                count: products.filter(p => p.subCategory === subcategory).length
            })).sort((a, b) => b.count - a.count);

            setFilterOptions(prev => ({
                ...prev,
                categories,
                subcategories,
                materials: Array.from(uniqueMaterials).map(material => ({
                    name: material,
                    count: products.filter(p => p.material === material).length
                })).sort((a, b) => b.count - a.count),
                colors: Array.from(uniqueColors).map(colorName => ({
                    name: colorName,
                    code: colorMap.get(colorName),
                    count: products.filter(p => 
                        p.colors?.some(c => c.name === colorName)
                    ).length
                })).sort((a, b) => b.count - a.count)
            }));
        };

        if (allProducts.length > 0) {
            updateFilterOptions();
        }
    }, [allProducts, products]);

    // Initial fetch and filter setup
    useEffect(() => {
        fetchProducts();
    }, [selectedFilters]);

    // Fetch categories separately
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getProductCategoriesApi();
                const backendCategories = response.data;

                // Get predefined categories and subcategories
                const predefinedCategories = {
                    "Living Room": [
                        "Sofas", "Coffee Tables", "TV Stands", "Armchairs", 
                        "Side Tables", "Bookcases"
                    ],
                    "Bedroom": [
                        "Beds", "Wardrobes", "Dressers", "Nightstands", 
                        "Bedroom Sets", "Mattresses"
                    ],
                    "Dining Room": [
                        "Dining Tables", "Dining Chairs", "Dining Sets", 
                        "Buffets & Sideboards", "Bar Furniture"
                    ],
                    "Kitchen": [
                        "Kitchen Islands", "Bar Stools", "Kitchen Storage", 
                        "Kitchen Tables", "Kitchen Chairs"
                    ],
                    "Office": [
                        "Desks", "Office Chairs", "Filing Cabinets", "Office Sets"
                    ],
                    "Outdoor": [
                        "Outdoor Sets", "Outdoor Tables", "Outdoor Chairs", 
                        "Outdoor Sofas", "Garden Furniture"
                    ],
                    "Kids": [
                        "Kids Beds", "Study Tables", "Storage Units", 
                        "Play Furniture", "Kids Chairs"
                    ],
                    "Storage": [
                        "Cabinets", "Shelving Units", "Storage Boxes", 
                        "Wall Storage", "Shoe Storage", "Coat Racks"
                    ],
                    "Other": [
                        "Mirrors", "Room Dividers", "Bean Bags", 
                        "Accent Furniture", "Decorative Items", "Miscellaneous"
                    ]
                };

                // Combine backend categories with predefined categories
                const combinedCategories = Object.keys(predefinedCategories).map(categoryName => {
                    const backendCategory = backendCategories.find(cat => cat._id === categoryName) || { subcategories: [] };
                    const productCount = products.filter(p => p.category === categoryName).length;

                    return {
                        name: categoryName,
                        subcategories: predefinedCategories[categoryName].map(subName => {
                            const hasSubInBackend = backendCategory.subcategories.includes(subName);
                            const subProductCount = products.filter(p => 
                                p.category === categoryName && p.subCategory === subName
                            ).length;
                            return {
                                name: subName,
                                count: subProductCount,
                                exists: hasSubInBackend
                            };
                        }),
                        count: productCount,
                        exists: backendCategory.subcategories.length > 0
                    };
                });

                // Sort categories: first those with products, then alphabetically
                const sortedCategories = combinedCategories.sort((a, b) => {
                    if (a.exists !== b.exists) return b.exists - a.exists;
                    if (a.count !== b.count) return b.count - a.count;
                    return a.name.localeCompare(b.name);
                });

                setFilterOptions(prev => ({
                    ...prev,
                    categories: sortedCategories
                }));
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        fetchCategories();
    }, [products]);

    // Preload images for visible products
    useEffect(() => {
        if (!loading && products.length > 0) {
            const visibleProducts = products.slice(0, 6); // Preload first 6 products
            visibleProducts.forEach(product => {
                product.pictures.forEach(pic => {
                    const src = `https://localhost:5000${pic}`;
                    preloadImage(src);
                });
            });
        }
    }, [loading, products]);

    const toggleFilter = (type, value) => {
        setSelectedFilters(prev => ({
            ...prev,
            [type]: prev[type].includes(value)
                ? prev[type].filter(item => item !== value)
                : [...prev[type], value]
        }));
    };

    return (
        <div className="bg-white relative z-0">
            <div className="container mx-auto px-6 py-12 mt-16">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters - Desktop */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-32 space-y-8">
                            {/* Categories */}
                            <div>
                                <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">Categories</h3>
                                <div className="space-y-4">
                                    {filterOptions.categories
                                        .filter(category => category.count > 0) // Only show categories with products
                                        .map((category) => (
                                        <div key={category.name} className="space-y-2">
                                            <label className="flex items-center space-x-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFilters.categories.includes(category.name)}
                                                    onChange={() => toggleFilter('categories', category.name)}
                                                    className="w-4 h-4 rounded border-gray-300 text-[#C4A484] focus:ring-[#C4A484]"
                                                />
                                                <span className="font-medium text-gray-900 group-hover:text-[#C4A484] transition-colors">
                                                    {category.name}
                                                </span>
                                                <span className="text-gray-400 text-sm">
                                                    ({category.count})
                                                </span>
                                            </label>
                                            
                                            {/* Subcategories - only show those with products */}
                                            {category.subcategories && category.subcategories.some(sub => sub.count > 0) && (
                                                <div className="ml-6 space-y-2">
                                                    {category.subcategories
                                                        .filter(subcategory => subcategory.count > 0)
                                                        .map((subcategory) => (
                                                        <label key={subcategory.name} className="flex items-center space-x-3 cursor-pointer group">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedFilters.subcategories.includes(subcategory.name)}
                                                                onChange={() => toggleFilter('subcategories', subcategory.name)}
                                                                className="w-4 h-4 rounded border-gray-300 text-[#C4A484] focus:ring-[#C4A484]"
                                                            />
                                                            <span className="text-sm text-gray-600 group-hover:text-[#C4A484] transition-colors">
                                                                {subcategory.name}
                                                            </span>
                                                            <span className="text-gray-400 text-sm">
                                                                ({subcategory.count})
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">Price Range</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <label className="text-sm text-gray-600 mb-1 block">Min</label>
                                            <input
                                                type="number"
                                                value={selectedFilters.priceRange[0]}
                                                onChange={(e) => setSelectedFilters(prev => ({
                                                    ...prev,
                                                    priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]]
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none"
                                                min="0"
                                                max={selectedFilters.priceRange[1]}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-sm text-gray-600 mb-1 block">Max</label>
                                            <input
                                                type="number"
                                                value={selectedFilters.priceRange[1]}
                                                onChange={(e) => setSelectedFilters(prev => ({
                                                    ...prev,
                                                    priceRange: [prev.priceRange[0], parseInt(e.target.value) || prev.priceRange[1]]
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none"
                                                min={selectedFilters.priceRange[0]}
                                                max="10000000"
                                            />
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000000"
                                        step="10000"
                                        value={selectedFilters.priceRange[1]}
                                        onChange={(e) => setSelectedFilters(prev => ({
                                            ...prev,
                                            priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                                        }))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C4A484]"
                                    />
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Nrp {selectedFilters.priceRange[0].toLocaleString()}</span>
                                        <span>Nrp {selectedFilters.priceRange[1].toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Materials */}
                            <div>
                                <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">Materials</h3>
                                <div className="space-y-2">
                                    {filterOptions.materials.map(material => (
                                        <label key={material.name} className="flex items-center space-x-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedFilters.materials.includes(material.name)}
                                                onChange={() => toggleFilter('materials', material.name)}
                                                className="w-4 h-4 rounded border-gray-300 text-[#C4A484] focus:ring-[#C4A484]"
                                            />
                                            <span className="text-gray-600 group-hover:text-[#C4A484] transition-colors">
                                                {material.name}
                                            </span>
                                            <span className="text-gray-400 text-sm">({material.count})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Colors */}
                            <div>
                                <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">Colors</h3>
                                <div className="flex flex-wrap gap-3">
                                    {filterOptions.colors.map(color => (
                                        <div key={color.name} className="relative group">
                                            <button
                                                onClick={() => toggleFilter('colors', color.name)}
                                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                                                    selectedFilters.colors.includes(color.name)
                                                        ? 'border-[#C4A484] scale-110'
                                                        : 'border-white'
                                                } shadow-sm`}
                                                style={{ backgroundColor: color.code }}
                                            />
                                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {color.name} ({color.count})
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Clear Filters Button */}
                            <button
                                onClick={() => setSelectedFilters({
                                    categories: [],
                                    subcategories: [],
                                    priceRange: [0, 10000000],
                                    materials: [],
                                    colors: [],
                                    sortBy: 'newest',
                                    search: ''
                                })}
                                className="w-full px-4 py-2 text-sm text-[#C4A484] border border-[#C4A484] rounded-lg hover:bg-[#C4A484]/5 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Header and Toolbar */}
                        <div className="mb-8">
                            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setShowFilters(true)}
                                        className="lg:hidden flex items-center gap-2 text-gray-600 hover:text-[#C4A484] transition-colors"
                                    >
                                        <FiFilter className="w-5 h-5" />
                                        <span>Filters</span>
                                    </button>
                                    <select
                                        value={selectedFilters.sortBy}
                                        onChange={(e) => setSelectedFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                                        className="px-4 py-2 rounded-lg border border-gray-200 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none"
                                    >
                                        {filterOptions.sortOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setView('grid')}
                                        className={`p-2 rounded-lg transition-colors ${view === 'grid'
                                            ? 'text-[#C4A484] bg-[#C4A484]/10'
                                            : 'text-gray-400 hover:text-[#C4A484]'
                                            }`}
                                    >
                                        <FiGrid className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setView('list')}
                                        className={`p-2 rounded-lg transition-colors ${view === 'list'
                                            ? 'text-[#C4A484] bg-[#C4A484]/10'
                                            : 'text-gray-400 hover:text-[#C4A484]'
                                            }`}
                                    >
                                        <FiList className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="animate-pulse">
                                        <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-[#C4A484]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiShoppingBag className="w-8 h-8 text-[#C4A484]" />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">No Products Found</h3>
                                <p className="text-gray-600 mb-8">
                                    We couldn't find any products matching your current filters.
                                </p>
                                <button
                                    onClick={() => setSelectedFilters({
                                        categories: [],
                                        subcategories: [],
                                        priceRange: [0, 10000000],
                                        materials: [],
                                        colors: [],
                                        sortBy: 'newest',
                                        search: ''
                                    })}
                                    className="inline-flex items-center px-6 py-3 bg-[#C4A484] text-white rounded-lg hover:bg-[#B39374] transition-all duration-300"
                                >
                                    <span>Clear All Filters</span>
                                </button>
                            </div>
                        ) : (
                            <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
                                {products.map(product => (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ProductCard product={product} view={view} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Modal */}
            {showFilters && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)}></div>
                    <div className="absolute inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-serif font-bold text-gray-900">Filters</h2>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="p-2 text-gray-400 hover:text-gray-500"
                                >
                                    <FiX className="w-6 h-6" />
                                </button>
                            </div>
                            {/* Mobile filter options - same as desktop */}
                            {/* ... Copy the filter sections from desktop here ... */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shop; 