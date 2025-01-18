import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown, FiGrid, FiList } from 'react-icons/fi';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('grid'); // grid or list
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        categories: [],
        priceRange: [0, 10000000],
        materials: [],
        colors: [],
        sortBy: 'newest'
    });

    // Sample data (replace with API call)
    const filters = {
        categories: [
            { name: 'Living Room', count: 12 },
            { name: 'Bedroom', count: 8 },
            { name: 'Dining Room', count: 6 },
            { name: 'Office', count: 10 },
            { name: 'Outdoor', count: 5 },
            { name: 'Storage', count: 7 },
            { name: 'Kids', count: 4 }
        ],
        materials: [
            { name: 'Solid Wood', count: 15 },
            { name: 'Engineered Wood', count: 8 },
            { name: 'Metal', count: 6 },
            { name: 'Fabric', count: 12 },
            { name: 'Leather', count: 5 },
            { name: 'Glass', count: 4 },
            { name: 'Marble', count: 3 }
        ],
        colors: [
            { name: 'Natural', code: '#DEB887', count: 10 },
            { name: 'White', code: '#FFFFFF', count: 8 },
            { name: 'Black', code: '#000000', count: 6 },
            { name: 'Gray', code: '#808080', count: 7 },
            { name: 'Brown', code: '#8B4513', count: 12 },
            { name: 'Beige', code: '#F5F5DC', count: 5 }
        ],
        sortOptions: [
            { value: 'newest', label: 'Newest First' },
            { value: 'price-low', label: 'Price: Low to High' },
            { value: 'price-high', label: 'Price: High to Low' },
            { value: 'popular', label: 'Most Popular' }
        ]
    };

    // Sample products (replace with API call)
    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setProducts([
                {
                    _id: '1',
                    name: 'Syltherine Sofa',
                    category: 'Living Room',
                    price: 2500000,
                    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?ixlib=rb-4.0.3',
                    material: 'Premium Fabric',
                    colors: [{ name: 'Beige', code: '#E8DCC4' }]
                },
                // ... add more sample products
            ]);
            setLoading(false);
        }, 1000);
    }, []);

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
                                <div className="space-y-2">
                                    {filters.categories.map(category => (
                                        <label key={category.name} className="flex items-center space-x-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedFilters.categories.includes(category.name)}
                                                onChange={() => toggleFilter('categories', category.name)}
                                                className="w-4 h-4 rounded border-gray-300 text-[#C4A484] focus:ring-[#C4A484]"
                                            />
                                            <span className="text-gray-600 group-hover:text-[#C4A484] transition-colors">
                                                {category.name}
                                            </span>
                                            <span className="text-gray-400 text-sm">({category.count})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">Price Range</h3>
                                <div className="space-y-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="10000000"
                                        value={selectedFilters.priceRange[1]}
                                        onChange={(e) => setSelectedFilters(prev => ({
                                            ...prev,
                                            priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                                        }))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C4A484]"
                                    />
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Rp 0</span>
                                        <span>Rp {selectedFilters.priceRange[1].toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Materials */}
                            <div>
                                <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">Materials</h3>
                                <div className="space-y-2">
                                    {filters.materials.map(material => (
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
                                    {filters.colors.map(color => (
                                        <button
                                            key={color.name}
                                            onClick={() => toggleFilter('colors', color.name)}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${selectedFilters.colors.includes(color.name)
                                                ? 'border-[#C4A484] scale-110'
                                                : 'border-white'
                                                } shadow-sm`}
                                            style={{ backgroundColor: color.code }}
                                            title={`${color.name} (${color.count})`}
                                        />
                                    ))}
                                </div>
                            </div>
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
                                        {filters.sortOptions.map(option => (
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
                        ) : (
                            <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
                                {products.map(product => (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`group ${view === 'list' ? 'flex gap-6' : ''}`}
                                    >
                                        <Link to={`/product/${product._id}`} className={view === 'list' ? 'flex-shrink-0 w-48' : 'block'}>
                                            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 h-full flex flex-col">
                                                <div className={`relative ${view === 'list' ? 'aspect-square' : 'aspect-square'} overflow-hidden`}>
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-200"></div>
                                                </div>
                                                <div className="p-5 flex flex-col flex-grow">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-[#C4A484]">{product.category}</span>
                                                        <div
                                                            className="w-3 h-3 rounded-full border border-white shadow-sm"
                                                            style={{ backgroundColor: product.colors[0].code }}
                                                            title={product.colors[0].name}
                                                        ></div>
                                                    </div>
                                                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                                                    <div className="flex items-center justify-between mt-auto">
                                                        <p className="text-gray-600 text-sm line-clamp-1">{product.material}</p>
                                                        <p className="font-medium text-gray-900 whitespace-nowrap">
                                                            Rp {product.price.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
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
                            {/* Mobile filter options - same as desktop but in a modal */}
                            {/* ... Copy the filter sections from desktop here ... */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shop; 