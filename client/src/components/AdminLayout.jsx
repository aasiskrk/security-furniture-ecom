import { Link, useLocation } from 'react-router-dom';
import { FiBox, FiUsers, FiShoppingBag, FiGrid } from 'react-icons/fi';
import DOMPurify from 'dompurify';

const AdminLayout = ({ children }) => {
    const location = useLocation();

    const menuItems = [
        {
            path: '/admin',
            name: 'Product Management',
            icon: <FiBox className="w-5 h-5" />
        },
        {
            path: '/admin/users',
            name: 'User Management',
            icon: <FiUsers className="w-5 h-5" />
        },
        {
            path: '/admin/orders',
            name: 'Order Management',
            icon: <FiShoppingBag className="w-5 h-5" />
        },
            ];

    // Add sanitization for any user-generated content being rendered
    const sanitizeContent = (content) => {
        if (typeof content === 'string') {
            return DOMPurify.sanitize(content);
        }
        return content;
    };

    return (
        <div className="flex h-[calc(100vh-3.5rem)]">
            {/* Sidebar */}
            <div className="w-64 bg-[#F8F5F1] border-r border-[#C4A484]/20" style={{ borderRight: '1px solid #C4A484' }}>
                <div className="p-6">
                    <h2 className="text-2xl mt-4 font-serif font-bold text-gray-900">Admin Panel</h2>
                    <p className="text-sm text-gray-600 mt-1">Manage your store</p>
                </div>
                <nav className="mt-6">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-6 py-4 text-gray-600 hover:bg-[#C4A484]/10 transition-all duration-200
                                ${location.pathname === item.path
                                    ? 'bg-[#C4A484]/10 text-[#8B5E34] border-r-4 border-[#C4A484]'
                                    : 'border-r-4 border-transparent'}`}
                        >
                            <span className={`${location.pathname === item.path ? 'text-[#8B5E34]' : 'text-gray-400'}`}>
                                {item.icon}
                            </span>
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-white">
                <div className="max-w-[2000px] mx-auto p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;

