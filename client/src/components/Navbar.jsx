import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiChevronDown } from 'react-icons/fi';
import { PiArmchairDuotone } from 'react-icons/pi';
import Cookies from 'js-cookie';

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

    // Check if current path is an admin page
    const isAdminPage = location.pathname.startsWith('/admin');
    const isProductDetail = location.pathname.startsWith('/product/');
    const isOrderPage = location.pathname.startsWith('/orders');
    const isCartPage = location.pathname.startsWith('/cart');
    const isProfilePage = location.pathname.startsWith('/profile');
    const isCheckoutPage = location.pathname.startsWith('/checkout');
    const isWishlistPage = location.pathname.startsWith('/wishlist');

    const furnitureCategories = {
        'Living Room': ['Sofas', 'Coffee Tables', 'TV Stands', 'Armchairs', 'Side Tables', 'Bookcases'],
        'Bedroom': ['Beds', 'Wardrobes', 'Nightstands', 'Dressers', 'Mattresses', 'Bedroom Sets'],
        'Dining Room': ['Dining Tables', 'Dining Chairs', 'Buffets', 'Bar Stools', 'China Cabinets'],
        'Kitchen': ['Kitchen Islands', 'Bar Carts', 'Storage Cabinets', 'Pantry Units'],
        'Office': ['Desks', 'Office Chairs', 'Filing Cabinets', 'Bookcases', 'Computer Tables'],
        'Outdoor': ['Patio Sets', 'Garden Furniture', 'Outdoor Sofas', 'Dining Sets', 'Hammocks'],
        'Kids': ['Beds', 'Wardrobes', 'Nightstands', 'Dressers', 'Mattresses', 'Bedroom Sets']

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

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
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
                        <div className="hidden xl:block flex-1 max-w-xl ml-24">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for furniture..."
                                    className="w-full px-4 py-2 pl-10 pr-12 text-gray-600 bg-[#F5F5DC]/30 rounded-lg border border-gray-200 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none transition-all"
                                />
                                <FiSearch className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                    {!isAdminPage && !isProductDetail && !isOrderPage && !isCartPage && !isProfilePage && !isCheckoutPage && !isWishlistPage && (
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
                                            <button className="flex items-center space-x-1 text-[#4A3F35] font-medium hover:text-[#8B5E34] transition-colors h-full border-b-2 border-transparent hover:border-[#8B5E34]">
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
                                                        <Link
                                                            key={item}
                                                            to={`/category/${category.toLowerCase()}/${item.toLowerCase()}`}
                                                            className="block px-4 py-2 text-sm text-[#4A3F35] hover:text-[#8B5E34] hover:bg-[#C4A484]/10 transition-colors font-medium"
                                                        >
                                                            {item}
                                                        </Link>
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
