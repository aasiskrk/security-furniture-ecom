import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        search: ''
    });

    const categories = ['Gaming', 'Business', 'Student', 'Workstation', 'Ultrabook'];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/products');
            setProducts(data);
        } catch (error) {
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredProducts = products.filter(product => {
        const matchesCategory = !filters.category || product.category === filters.category;
        const matchesBrand = !filters.brand || product.brand.toLowerCase().includes(filters.brand.toLowerCase());
        const matchesPrice = (!filters.minPrice || product.price >= Number(filters.minPrice)) &&
            (!filters.maxPrice || product.price <= Number(filters.maxPrice));
        const matchesSearch = !filters.search ||
            product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            product.description.toLowerCase().includes(filters.search.toLowerCase());

        return matchesCategory && matchesBrand && matchesPrice && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="w-screen">
            {/* Filters */}
            <div className="w-full bg-gray-50 p-6">
                <div className="w-full max-w-[2000px] mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                            <input
                                type="text"
                                name="brand"
                                value={filters.brand}
                                onChange={handleFilterChange}
                                placeholder="Search brands..."
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                            <input
                                type="number"
                                name="minPrice"
                                value={filters.minPrice}
                                onChange={handleFilterChange}
                                placeholder="Min price..."
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                            <input
                                type="number"
                                name="maxPrice"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                                placeholder="Max price..."
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Search products..."
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="w-full max-w-[2000px] mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {filteredProducts.map(product => (
                        <Link
                            key={product._id}
                            to={`/product/${product._id}`}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                                <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-600 font-bold">${product.price}</span>
                                    <span className="text-sm text-gray-500">{product.category}</span>
                                </div>
                                {product.countInStock === 0 && (
                                    <span className="text-red-500 text-sm mt-2 block">Out of Stock</span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
                {filteredProducts.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No products found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home; 