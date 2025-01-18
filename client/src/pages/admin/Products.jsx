import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';

const Products = () => {
    // Sample data - replace with actual API call
    const [products] = useState([
        {
            _id: '1',
            name: 'Modern Leather Sofa',
            description: 'Luxurious leather sofa with modern design',
            price: 2499999,
            category: 'Living Room',
            subcategory: 'Sofas',
            material: 'Premium Leather',
            colors: [
                { name: 'Black', code: '#000000' },
                { name: 'Brown', code: '#8B4513' }
            ],
            dimensions: {
                width: 220,
                height: 85,
                depth: 95
            },
            weight: 45,
            inStock: 5,
            images: [
                'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3'
            ],
            features: [
                'Premium leather upholstery',
                'High-density foam cushions',
                'Solid wood frame'
            ],
            status: 'Active',
            createdAt: '2024-02-20'
        }
    ]);

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900">Products</h1>
                        <p className="text-gray-600 mt-1">Manage your product inventory</p>
                    </div>
                    <button className="flex items-center space-x-2 bg-[#C4A484] text-white px-6 py-3 rounded-lg hover:bg-[#B39374] transition-all duration-200">
                        <FiPlus className="w-5 h-5" />
                        <span>Add Product</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="border-t border-[#C4A484]/50 p-6 space-y-4 bg-white">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-md relative">
                            <FiSearch className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none bg-white"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <select className="px-4 py-3 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none bg-white">
                                <option value="">All Categories</option>
                                <option value="living-room">Living Room</option>
                                <option value="bedroom">Bedroom</option>
                                <option value="dining-room">Dining Room</option>
                            </select>
                            <select className="px-4 py-3 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none bg-white">
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl border border-[#C4A484]/10 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#F8F5F1]">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Product</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Category</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Price</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Stock</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Colors</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#C4A484]/10">
                            {products.map((product) => (
                                <tr key={product._id} className="hover:bg-[#F8F5F1]/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-16 w-16 flex-shrink-0">
                                                <img
                                                    className="h-16 w-16 rounded-lg object-cover border border-[#C4A484]/10"
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{product.category}</div>
                                        <div className="text-sm text-gray-500">{product.subcategory}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        Rp {product.price.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex text-sm ${product.inStock > 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {product.inStock} units
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-1">
                                            {product.colors.map((color, index) => (
                                                <div
                                                    key={index}
                                                    className="w-6 h-6 rounded-full border-2 border-white ring-2 ring-[#C4A484]/10"
                                                    style={{ backgroundColor: color.code }}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${product.status === 'Active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <button className="text-[#C4A484] hover:text-[#8B5E34] transition-colors">
                                                <FiEdit2 className="w-5 h-5" />
                                            </button>
                                            <button className="text-red-400 hover:text-red-600 transition-colors">
                                                <FiTrash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="bg-[#F8F5F1]/50 px-6 py-4 border-t border-[#C4A484]/10">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing 1 to {products.length} of {products.length} products
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="px-4 py-2 border border-[#C4A484]/20 rounded-lg text-sm text-gray-600 hover:bg-[#C4A484]/10 transition-colors">
                                    Previous
                                </button>
                                <button className="px-4 py-2 bg-[#C4A484] text-white rounded-lg text-sm hover:bg-[#B39374] transition-colors">
                                    1
                                </button>
                                <button className="px-4 py-2 border border-[#C4A484]/20 rounded-lg text-sm text-gray-600 hover:bg-[#C4A484]/10 transition-colors">
                                    2
                                </button>
                                <button className="px-4 py-2 border border-[#C4A484]/20 rounded-lg text-sm text-gray-600 hover:bg-[#C4A484]/10 transition-colors">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Products; 