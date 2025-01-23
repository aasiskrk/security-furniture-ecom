import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { PiArmchairDuotone } from 'react-icons/pi';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <footer className="bg-[#F8F5F1] border-t border-[#C4A484]/10">
            <div className="max-w-[2000px] mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link to="/" onClick={scrollToTop} className="flex items-center space-x-2 text-[#333333] hover:text-[#C4A484] transition-colors group mb-3">
                            <PiArmchairDuotone className="w-8 h-8 text-[#C4A484] group-hover:scale-110 transition-transform" />
                            <span className="text-2xl font-medium font-['Playfair_Display']">Furnishion</span>
                        </Link>
                        <p className="text-gray-600 text-sm max-w-md">
                            Crafting comfort and style for your living spaces with our premium furniture collection.
                        </p>
                        <div className="flex space-x-4 mt-4">
                            <a href="/" onClick={(e) => { e.preventDefault(); scrollToTop(); }} className="w-8 h-8 rounded-full bg-[#C4A484]/10 flex items-center justify-center text-[#C4A484] hover:bg-[#C4A484] hover:text-white transition-all">
                                <FaFacebook size={16} />
                            </a>
                            <a href="/" onClick={(e) => { e.preventDefault(); scrollToTop(); }} className="w-8 h-8 rounded-full bg-[#C4A484]/10 flex items-center justify-center text-[#C4A484] hover:bg-[#C4A484] hover:text-white transition-all">
                                <FaTwitter size={16} />
                            </a>
                            <a href="/" onClick={(e) => { e.preventDefault(); scrollToTop(); }} className="w-8 h-8 rounded-full bg-[#C4A484]/10 flex items-center justify-center text-[#C4A484] hover:bg-[#C4A484] hover:text-white transition-all">
                                <FaInstagram size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wider">Shop</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/shop" className="text-gray-600 hover:text-[#C4A484] transition-colors text-sm">
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link to="/shop?sortBy=newest" className="text-gray-600 hover:text-[#C4A484] transition-colors text-sm">
                                    New Arrivals
                                </Link>
                            </li>
                            <li>
                                <Link to="/shop" className="text-gray-600 hover:text-[#C4A484] transition-colors text-sm">
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link to="/wishlist" className="text-gray-600 hover:text-[#C4A484] transition-colors text-sm">
                                    Wishlist
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wider">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/#contact-section" onClick={(e) => {
                                    e.preventDefault();
                                    const contactSection = document.getElementById('contact-section');
                                    if (contactSection) {
                                        contactSection.scrollIntoView({ behavior: 'smooth' });
                                    } else {
                                        window.location.href = '/#contact-section';
                                    }
                                }} className="text-gray-600 hover:text-[#C4A484] transition-colors text-sm">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/orders" className="text-gray-600 hover:text-[#C4A484] transition-colors text-sm">
                                    Track Order
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className="text-gray-600 hover:text-[#C4A484] transition-colors text-sm">
                                    My Account
                                </Link>
                            </li>
                            <li>
                                <Link to="/cart" className="text-gray-600 hover:text-[#C4A484] transition-colors text-sm">
                                    Shopping Cart
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[#C4A484]/10 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-xs">
                            © {new Date().getFullYear()} Furnishion. All rights reserved.
                        </p>
                        <div className="flex space-x-6">
                            <Link to="/" onClick={scrollToTop} className="text-gray-500 hover:text-[#C4A484] transition-colors text-xs">
                                Privacy
                            </Link>
                            <Link to="/" onClick={scrollToTop} className="text-gray-500 hover:text-[#C4A484] transition-colors text-xs">
                                Terms
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 