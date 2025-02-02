import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiChevronDown, FiArrowRight } from 'react-icons/fi';
import { PiArmchairDuotone } from 'react-icons/pi';
import Cookies from 'js-cookie';
import { getAllProductsApi } from '../api/apis';
import { sanitizeSearchQuery } from '../utils/sanitize';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';

const WISHLIST_COOKIE_KEY = 'furniture_wishlist';
const CART_COOKIE_KEY = 'furniture_cart';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [hideCategories, setHideCategories] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const location = useLocation();
    const [wishlistCount, setWishlistCount] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Check if current path is an admin page
    const isAdminPage = location.pathname.startsWith('/admin');
    const isProductDetail = location.pathname.startsWith('/product/');
    const isOrderPage = location.pathname.startsWith('/orders');
    const isCartPage = location.pathname.startsWith('/cart');
    const isProfilePage = location.pathname.startsWith('/profile');
    const isCheckoutPage = location.pathname.startsWith('/checkout');
    const isWishlistPage = location.pathname.startsWith('/wishlist');
    const isRegisterPage = location.pathname.startsWith('/register');
    const isLoginPage = location.pathname.startsWith('/login');

    const furnitureCategories = {
        'Living Room': [
            'Sofas',
            'Coffee Tables',
            'TV Stands',
            'Armchairs',
            'Side Tables',
            'Bookcases'
        ],
        'Bedroom': [
            'Beds',
            'Wardrobes',
            'Dressers',
            'Nightstands',
            'Bedroom Sets',
            'Mattresses'
        ],
        'Dining Room': [
            'Dining Tables',
            'Dining Chairs',
            'Dining Sets',
            'Buffets & Sideboards',
            'Bar Furniture'
        ],
        'Kitchen': [
            'Kitchen Islands',
            'Bar Stools',
            'Kitchen Storage',
            'Kitchen Tables',
            'Kitchen Chairs'
        ],
        'Office': [
            'Desks',
            'Office Chairs',
            'Filing Cabinets',
            'Office Sets'
        ],
        'Outdoor': [
            'Outdoor Sets',
            'Outdoor Tables',
            'Outdoor Chairs',
            'Outdoor Sofas',
            'Garden Furniture'
        ],
        'Kids': [
            'Kids Beds',
            'Study Tables',
            'Storage Units',
            'Play Furniture',
            'Kids Chairs'
        ],
        'Storage': [
            'Cabinets',
            'Shelving Units',
            'Storage Boxes',
            'Wall Storage',
            'Shoe Storage',
            'Coat Racks'
        ],
        'Other': [
            'Mirrors',
            'Room Dividers',
            'Bean Bags',
            'Accent Furniture',
            'Decorative Items',
            'Miscellaneous'
        ]
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Set isScrolled for background effect
            setIsScrolled(currentScrollY > 20);

            // Determine scroll direction and hide/show categories
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down & past 100px
                setHideCategories(true);
            } else {
                // Scrolling up or near top
                setHideCategories(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Add effect to update wishlist count
    useEffect(() => {
        const updateWishlistCount = () => {
            const wishlistIds = JSON.parse(Cookies.get(WISHLIST_COOKIE_KEY) || '[]');
            setWishlistCount(wishlistIds.length);
        };

        // Initial count
        updateWishlistCount();

        // Listen for storage changes (in case wishlist is updated in another tab)
        const handleStorageChange = (e) => {
            if (e.key === WISHLIST_COOKIE_KEY) {
                updateWishlistCount();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Custom event for wishlist updates within the same tab
        window.addEventListener('wishlistUpdated', updateWishlistCount);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('wishlistUpdated', updateWishlistCount);
        };
    }, []);

    // Add effect to update cart count
    useEffect(() => {
        const updateCartCount = () => {
            const cartData = JSON.parse(Cookies.get(CART_COOKIE_KEY) || '[]');
            setCartCount(cartData.length);
        };

        // Initial count
        updateCartCount();

        // Listen for storage changes
        const handleStorageChange = (e) => {
            if (e.key === CART_COOKIE_KEY) {
                updateCartCount();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('cartUpdated', updateCartCount);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, []);

    // Close search dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Remove the debounced search and replace with direct search
    const handleSearchInput = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchDropdown(false);
            return;
        }

        try {
            setIsSearching(true);
            setShowSearchDropdown(true);
            const response = await getAllProductsApi({ search: query });
            const products = response.data.products || [];
            setSearchResults(products.slice(0, 5)); // Limit to 5 results
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle search result click
    const handleSearchResultClick = (productId) => {
        setShowSearchDropdown(false);
        setSearchQuery('');
        navigate(`/product/${productId}`);
    };

    // Handle search form submit
    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const sanitizedQuery = sanitizeSearchQuery(searchQuery);
            if (!sanitizedQuery) {
                setSearchResults([]);
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/products/search?q=${encodeURIComponent(sanitizedQuery)}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data && Array.isArray(response.data)) {
                setSearchResults(response.data);
                if (response.data.length === 0) {
                    toast.error('No products found');
                } else {
                    // Navigate to shop page with search query
                    navigate(`/shop?search=${encodeURIComponent(sanitizedQuery)}`);
                }
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
            toast.error('No products found');
        } finally {
            setLoading(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const scrollToContact = () => {
        const contactSection = document.getElementById('contact-section');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        } else if (location.pathname !== '/') {
            // If not on home page, navigate to home and then scroll
            window.location.href = '/#contact-section';
        }
    };

    const handleNavigation = (e, path, action) => {
        e.preventDefault();
        if (location.pathname === path) {
            // If already on the page, just perform the scroll action
            action();
        } else {
            // Navigate to the page first, then perform the action
            window.location.href = path;
        }
    };

    // Handle category navigation
    const handleCategoryClick = (category, subcategory = null) => {
        const searchParams = new URLSearchParams();
        if (subcategory) {
            searchParams.set('subcategory', subcategory);
            searchParams.set('category', category); // Also set the parent category
        } else {
            searchParams.set('category', category);
        }
        window.location.href = `/shop?${searchParams.toString()}`;
    };

    // Add sanitization for any user-specific content (like username)
    const sanitizeContent = (content) => {
        if (typeof content === 'string') {
            return DOMPurify.sanitize(content);
        }
        return content;
    };

    return (
        <div>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
                }`}>
                <div className="w-full max-w-[2000px] mx-auto">
                    {/* Top Section */}
                    <div className="flex items-center h-20 px-6">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2 text-[#333333] hover:text-[#C4A484] transition-colors group">
                            <PiArmchairDuotone className="w-8 h-8 text-[#C4A484] group-hover:scale-110 transition-transform" />
                            <span className="text-2xl font-medium font-['Playfair_Display']">Furnishion</span>
                        </Link>

                        {/* Primary Navigation */}
                        <div className="hidden lg:flex items-center space-x-8 ml-12">
                            <a
                                href="/"
                                onClick={(e) => handleNavigation(e, '/', scrollToTop)}
                                className="text-[#333333] hover:text-[#C4A484] transition-colors cursor-pointer"
                            >
                                Home
                            </a>
                            <Link to="/shop" className="text-[#333333] hover:text-[#C4A484] transition-colors">Shop</Link>
                            <a
                                href="#contact-section"
                                onClick={(e) => handleNavigation(e, '/', scrollToContact)}
                                className="text-[#333333] hover:text-[#C4A484] transition-colors cursor-pointer"
                            >
                                Contact
                            </a>
                        </div>

                        {/* Search Bar */}
                        <div className="hidden xl:block flex-1 max-w-xl ml-24 px-8" ref={searchRef}>
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchInput}
                                    placeholder="Search for products..."
                                    className="w-full px-4 py-2 pl-10 bg-gray-100 border border-transparent rounded-lg focus:bg-white focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none transition-all"
                                />
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                
                                {/* Search Dropdown */}
                                {showSearchDropdown && (searchResults.length > 0 || isSearching || searchQuery.trim()) && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                                        {isSearching ? (
                                            <div className="p-4 text-center text-gray-500">
                                                <div className="animate-spin w-5 h-5 border-2 border-[#C4A484] border-t-transparent rounded-full mx-auto mb-2"></div>
                                                Searching...
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            <>
                                                {searchResults.map(product => (
                                                    <button
                                                        key={product._id}
                                                        onClick={() => handleSearchResultClick(product._id)}
                                                        className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                                                    >
                                                        <img
                                                            src={`https://localhost:5000${product.pictures[0]}`}
                                                            alt={product.name}
                                                            className="w-12 h-12 object-cover rounded-md"
                                                        />
                                                        <div className="flex-1 text-left">
                                                            <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                                                                {product.name}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">
                                                                {product.category} • {product.subCategory}
                                                            </p>
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            Nrp {product.price.toLocaleString()}
                                                        </div>
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={handleSearch}
                                                    className="w-full p-3 text-sm text-[#C4A484] hover:bg-[#C4A484]/5 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <span>View all results</span>
                                                    <FiArrowRight className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : searchQuery.trim() && (
                                            <div className="p-4 text-center text-gray-500">
                                                No products found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center space-x-6 ml-auto">
                            <Link to="/wishlist" className="relative">
                                <FiHeart className="w-6 h-6 text-[#333333] hover:text-[#C4A484] transition-colors" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-[#C4A484] text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>
                            <Link to="/cart" className="relative">
                                <FiShoppingCart className="w-6 h-6 text-[#333333] hover:text-[#C4A484] transition-colors" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-[#C4A484] text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            {user ? (
                                <div className="relative group">
                                    <button className="flex items-center space-x-2 text-[#333333] hover:text-[#C4A484] transition-colors">
                                        <FiUser className="w-6 h-6" />
                                        <span className="text-sm font-medium">{sanitizeContent(user.name)}</span>
                                    </button>
                                    <div className="absolute right-0 w-48 mt-2 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <div className="py-1">
                                            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-600 hover:text-[#C4A484] hover:bg-gray-50">
                                                Profile
                                            </Link>
                                            <Link to="/orders" className="block px-4 py-2 text-sm text-gray-600 hover:text-[#C4A484] hover:bg-gray-50">
                                                Orders
                                            </Link>
                                            <button onClick={logout} className="block w-full px-4 py-2 text-sm text-left text-gray-600 hover:text-[#C4A484] hover:bg-gray-50">
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login" className="text-[#333333] hover:text-[#C4A484] transition-colors">
                                    <FiUser className="w-6 h-6" />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Bottom Section - Categories */}
                    {!isAdminPage && !isProductDetail && !isOrderPage && !isCartPage && !isProfilePage && !isCheckoutPage && !isWishlistPage && !isRegisterPage && !isLoginPage && (
                        <div className={`hidden lg:block bg-[#DCC8AC] transition-all duration-300 border-t border-[#C4A484]/20 overflow-visible
                            ${isScrolled ? 'shadow-sm' : ''} 
                            ${hideCategories ? 'h-0 opacity-0' : 'h-14 opacity-100'}`}
                        >
                            <div className="max-w-[2000px] mx-auto px-6">
                                <div className="flex items-center justify-start space-x-12 h-14">
                                    {Object.keys(furnitureCategories).map((category, index) => (
                                        <div
                                            key={category}
                                            className="relative group h-full"
                                            onMouseEnter={() => setActiveDropdown(category)}
                                            onMouseLeave={() => setActiveDropdown(null)}
                                        >
                                            <button 
                                                onClick={() => handleCategoryClick(category)}
                                                className="flex items-center space-x-1 text-[#4A3F35] font-medium hover:text-[#8B5E34] transition-colors h-full border-b-2 border-transparent hover:border-[#8B5E34]"
                                            >
                                                <span>{category}</span>
                                                <FiChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === category ? 'rotate-180' : ''}`} />
                                            </button>
                                            <div className={`absolute top-full w-56 pt-2 z-50
                                                opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                                                transition-all duration-200 ease-out
                                                ${index === 0 ? 'left-0' :
                                                    index === Object.keys(furnitureCategories).length - 1 ? 'right-0' :
                                                        'left-1/2 -translate-x-1/2'}`}
                                            >
                                                <div className="bg-[#DCC8AC] rounded-lg shadow-lg py-2 border border-[#C4A484]/20">
                                                    {furnitureCategories[category].map((item) => (
                                                        <button
                                                            key={item}
                                                            onClick={() => handleCategoryClick(category, item)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-[#4A3F35] hover:text-[#8B5E34] hover:bg-[#C4A484]/10 transition-colors font-medium"
                                                        >
                                                            {item}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
