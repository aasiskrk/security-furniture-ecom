import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white shadow-lg w-screen">
            <div className="w-full max-w-[2000px] mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-bold text-blue-600">
                        LaptopStore
                    </Link>

                    <div className="flex items-center space-x-4">
                        <Link to="/" className="text-gray-700 hover:text-blue-600">
                            Home
                        </Link>

                        {user ? (
                            <>
                                <Link to="/cart" className="text-gray-700 hover:text-blue-600">
                                    Cart
                                </Link>
                                <Link to="/orders" className="text-gray-700 hover:text-blue-600">
                                    Orders
                                </Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="text-gray-700 hover:text-blue-600">
                                        Admin
                                    </Link>
                                )}
                                <div className="relative group">
                                    <button className="text-gray-700 hover:text-blue-600">
                                        {user.name}
                                    </button>
                                    <div className="absolute right-0 w-48 py-2 mt-2 bg-white rounded-md shadow-xl hidden group-hover:block">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-blue-600"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 