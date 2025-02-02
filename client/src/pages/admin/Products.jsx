import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { createProductApi, getAllProductsApi, updateProductApi, deleteProductApi } from '../../api/apis.js';
import { sanitizeFormData, sanitizePrice } from '../../utils/sanitize';
import axios from 'axios';
import DOMPurify from 'dompurify';

const ProductModal = ({ isOpen, onClose, product, mode }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        category: product?.category || '',
        subCategory: product?.subCategory || '',
        dimensions: product?.dimensions || {
            length: '',
            width: '',
            height: '',
            unit: 'inches'
        },
        colors: product?.colors || [],
        material: product?.material || '',
        features: product?.features || [],
        weight: product?.weight || {
            value: '',
            unit: 'kg'
        },
        countInStock: product?.countInStock || 0
    });
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Add subcategories map
    const categoryMap = {
        "Living Room": [
            "Sofas",
            "Coffee Tables",
            "TV Stands",
            "Armchairs",
            "Side Tables",
            "Bookcases",
        ],
        "Bedroom": [
            "Beds",
            "Wardrobes",
            "Dressers",
            "Nightstands",
            "Bedroom Sets",
            "Mattresses",
        ],
        "Dining Room": [
            "Dining Tables",
            "Dining Chairs",
            "Dining Sets",
            "Buffets & Sideboards",
            "Bar Furniture",
        ],
        "Kitchen": [
            "Kitchen Islands",
            "Bar Stools",
            "Kitchen Storage",
            "Kitchen Tables",
            "Kitchen Chairs",
        ],
        "Office": [
            "Desks",
            "Office Chairs",
            "Filing Cabinets",
            "Office Sets",
        ],
        "Outdoor": [
            "Outdoor Sets",
            "Outdoor Tables",
            "Outdoor Chairs",
            "Outdoor Sofas",
            "Garden Furniture",
        ],
        "Kids": [
            "Kids Beds",
            "Study Tables",
            "Storage Units",
            "Play Furniture",
            "Kids Chairs",
        ],
        "Storage": [
            "Cabinets",
            "Shelving Units",
            "Storage Boxes",
            "Wall Storage",
            "Shoe Storage",
            "Coat Racks",
        ],
        "Other": [
            "Mirrors",
            "Room Dividers",
            "Bean Bags",
            "Accent Furniture",
            "Decorative Items",
            "Miscellaneous",
        ],
    };

    useEffect(() => {
        if (product && mode === 'edit') {
            setFormData(product);
        }
    }, [product, mode]);

    // Add effect to reset subcategory when category changes
    useEffect(() => {
        if (formData.category && (!formData.subCategory || !categoryMap[formData.category].includes(formData.subCategory))) {
            setFormData(prev => ({
                ...prev,
                subCategory: ''
            }));
        }
    }, [formData.category]);

    const validateForm = () => {
        const newErrors = {};

        // Check required fields
        if (!formData.material.trim()) {
            newErrors.material = 'Material is required';
        }

        // Check colors
        if (!formData.colors.length) {
            newErrors.colors = 'At least one color is required';
        } else {
            formData.colors.forEach((color, index) => {
                if (!color.name.trim() || !color.code.trim()) {
                    newErrors[`color${index}`] = 'Both color name and code are required';
                }
            });
        }

        // Check if files are selected for new product
        if (mode === 'add' && !files.length) {
            newErrors.pictures = 'At least one product picture is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            
            // Format the data before sending
            const dataToSend = {
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                category: formData.category,
                subCategory: formData.subCategory,
                dimensions: {
                    length: Number(formData.dimensions.length),
                    width: Number(formData.dimensions.width),
                    height: Number(formData.dimensions.height),
                    unit: formData.dimensions.unit || 'inches'
                },
                colors: formData.colors.filter(color => color.name && color.code),
                material: formData.material,
                features: formData.features.filter(feature => feature.trim()),
                weight: {
                    value: Number(formData.weight.value),
                    unit: formData.weight.unit || 'kg'
                },
                countInStock: Number(formData.countInStock)
            };

            if (mode === 'add') {
                // For new products, send data as JSON string
                formDataToSend.append('data', JSON.stringify(dataToSend));

                // Append files for new products
                if (files.length > 0) {
                    files.forEach(file => {
                        formDataToSend.append('pictures', file);
                    });
                }

                await createProductApi(formDataToSend);
                toast.success('Product added successfully');
            } else {
                // For updates, send the data directly
                if (files.length > 0) {
                    // If there are new files, append them
                    files.forEach(file => {
                        formDataToSend.append('pictures', file);
                    });
                }
                // Keep existing pictures if no new ones are uploaded
                if (product.pictures) {
                    dataToSend.pictures = product.pictures;
                }
                
                await updateProductApi(product._id, dataToSend);
                toast.success('Product updated successfully');
            }

            onClose();
            window.location.reload(); // Refresh to show updated data
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
    };

    const addColor = () => {
        setFormData({
            ...formData,
            colors: [...formData.colors, { name: '', code: '#000000' }]
        });
    };

    const removeColor = (index) => {
        const newColors = formData.colors.filter((_, i) => i !== index);
        setFormData({ ...formData, colors: newColors });
    };

    const addFeature = () => {
        setFormData({
            ...formData,
            features: [...formData.features, '']
        });
    };

    const removeFeature = (index) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif font-bold">
                        {mode === 'add' ? 'Add New Product' : 'Edit Product'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            rows="3"
                            required
                        />
                    </div>

                    {/* Category and Subcategory */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Living Room">Living Room</option>
                                <option value="Bedroom">Bedroom</option>
                                <option value="Dining Room">Dining Room</option>
                                <option value="Kitchen">Kitchen</option>
                                <option value="Office">Office</option>
                                <option value="Outdoor">Outdoor</option>
                                <option value="Kids">Kids</option>
                                <option value="Storage">Storage</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subcategory</label>
                            <select
                                value={formData.subCategory}
                                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                required
                            >
                                <option value="">Select Subcategory</option>
                                {formData.category && categoryMap[formData.category]?.map((sub) => (
                                    <option key={sub} value={sub}>
                                        {sub}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <input
                                    type="number"
                                    placeholder="Length"
                                    value={formData.dimensions.length}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        dimensions: { ...formData.dimensions, length: e.target.value }
                                    })}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    placeholder="Width"
                                    value={formData.dimensions.width}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        dimensions: { ...formData.dimensions, width: e.target.value }
                                    })}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    placeholder="Height"
                                    value={formData.dimensions.height}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        dimensions: { ...formData.dimensions, height: e.target.value }
                                    })}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <select
                                    value={formData.dimensions.unit}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        dimensions: { ...formData.dimensions, unit: e.target.value }
                                    })}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2"
                                >
                                    <option value="inches">inches</option>
                                    <option value="cm">cm</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Weight */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Weight</label>
                            <input
                                type="number"
                                value={formData.weight.value}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    weight: { ...formData.weight, value: e.target.value }
                                })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Unit</label>
                            <select
                                value={formData.weight.unit}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    weight: { ...formData.weight, unit: e.target.value }
                                })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="kg">kg</option>
                                <option value="lbs">lbs</option>
                            </select>
                        </div>
                    </div>

                    {/* Material */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Material</label>
                        <input
                            type="text"
                            value={formData.material}
                            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                            className={`mt-1 block w-full rounded-md border ${errors.material ? 'border-red-500' : 'border-gray-300'
                                } px-3 py-2`}
                            required
                        />
                        {errors.material && (
                            <p className="text-red-500 text-xs mt-1">{errors.material}</p>
                        )}
                    </div>

                    {/* Colors */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Colors</label>
                            <button
                                type="button"
                                onClick={addColor}
                                className="text-sm text-[#C4A484] hover:text-[#B39374]"
                            >
                                + Add Color
                            </button>
                        </div>
                        {formData.colors.map((color, index) => (
                            <div key={index} className="flex gap-4 mb-2">
                                <input
                                    type="text"
                                    placeholder="Color Name"
                                    value={color.name}
                                    onChange={(e) => {
                                        const newColors = [...formData.colors];
                                        newColors[index].name = e.target.value;
                                        setFormData({ ...formData, colors: newColors });
                                    }}
                                    className={`flex-1 rounded-md border ${errors[`color${index}`] ? 'border-red-500' : 'border-gray-300'
                                        } px-3 py-2`}
                                    required
                                />
                                <input
                                    type="color"
                                    value={color.code}
                                    onChange={(e) => {
                                        const newColors = [...formData.colors];
                                        newColors[index].code = e.target.value;
                                        setFormData({ ...formData, colors: newColors });
                                    }}
                                    className="w-16 h-10 rounded-md border border-gray-300"
                                    required
                                />
                                {index > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removeColor(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <FiTrash2 />
                                    </button>
                                )}
                            </div>
                        ))}
                        {errors.colors && (
                            <p className="text-red-500 text-xs mt-1">{errors.colors}</p>
                        )}
                    </div>

                    {/* Features */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Features</label>
                            <button
                                type="button"
                                onClick={addFeature}
                                className="text-sm text-[#C4A484] hover:text-[#B39374]"
                            >
                                + Add Feature
                            </button>
                        </div>
                        {formData.features.map((feature, index) => (
                            <div key={index} className="flex gap-4 mb-2">
                                <input
                                    type="text"
                                    value={feature}
                                    onChange={(e) => {
                                        const newFeatures = [...formData.features];
                                        newFeatures[index] = e.target.value;
                                        setFormData({ ...formData, features: newFeatures });
                                    }}
                                    className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                                    placeholder="Enter feature"
                                    required
                                />
                                {index > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <FiTrash2 />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pictures */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pictures</label>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            accept="image/*"
                            className={`block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-[#C4A484] file:text-white
                                hover:file:bg-[#B39374] ${errors.pictures ? 'border-red-500' : ''
                                }`}
                        />
                        {errors.pictures && (
                            <p className="text-red-500 text-xs mt-1">{errors.pictures}</p>
                        )}
                    </div>

                    {/* Stock */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stock</label>
                        <input
                            type="number"
                            value={formData.countInStock}
                            onChange={(e) => setFormData({ ...formData, countInStock: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-[#C4A484] text-white px-6 py-2 rounded-lg hover:bg-[#B39374] transition-all duration-200"
                        >
                            {mode === 'add' ? 'Add Product' : 'Update Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, productName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-serif font-bold mb-4">Delete Product</h2>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete "{productName}"? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// Add this helper function at the top level
const getStockStatus = (countInStock) => {
    if (countInStock === 0) return { label: 'Out of Stock', className: 'bg-red-100 text-red-800' };
    if (countInStock <= 10) return { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', className: 'bg-green-100 text-green-800' };
};

// Add sanitization for product details
const sanitizeContent = (content) => {
    if (typeof content === 'string') {
        return DOMPurify.sanitize(content);
    }
    return content;
};

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    // Add effect for filtering products
    useEffect(() => {
        filterProducts();
    }, [products, searchQuery, categoryFilter, statusFilter]);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await getAllProductsApi();
            const fetchedProducts = response.data.products || [];
            setProducts(fetchedProducts);
            setFilteredProducts(fetchedProducts);
        } catch (error) {
            toast.error('Failed to fetch products');
            setProducts([]);
            setFilteredProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = [...products];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query)
            );
        }

        // Apply category filter
        if (categoryFilter) {
            filtered = filtered.filter(product => product.category === categoryFilter);
        }

        // Update status filter to handle all three states
        if (statusFilter) {
            switch (statusFilter) {
                case 'in_stock':
                    filtered = filtered.filter(product => product.countInStock > 10);
                    break;
                case 'low_stock':
                    filtered = filtered.filter(product => product.countInStock > 0 && product.countInStock <= 10);
                    break;
                case 'out_of_stock':
                    filtered = filtered.filter(product => product.countInStock === 0);
                    break;
            }
        }

        setFilteredProducts(filtered);
    };

    const handleDelete = async () => {
        try {
            await deleteProductApi(selectedProduct._id);
            toast.success('Product deleted successfully');
            setIsDeleteDialogOpen(false);
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (product) => {
        setSelectedProduct(product);
        setIsDeleteDialogOpen(true);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900">Products</h1>
                        <p className="text-gray-600 mt-1">Manage your product inventory</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center space-x-2 bg-[#C4A484] text-white px-6 py-3 rounded-lg hover:bg-[#B39374] transition-all duration-200"
                    >
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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none bg-white"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-4 py-3 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none bg-white"
                            >
                                <option value="">All Categories</option>
                                <option value="Living Room">Living Room</option>
                                <option value="Bedroom">Bedroom</option>
                                <option value="Dining Room">Dining Room</option>
                                <option value="Kitchen">Kitchen</option>
                                <option value="Office">Office</option>
                                <option value="Outdoor">Outdoor</option>
                                <option value="Kids">Kids</option>
                                <option value="Storage">Storage</option>
                                <option value="Other">Other</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 rounded-lg border border-[#C4A484]/20 focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 focus:outline-none bg-white"
                            >
                                <option value="">All Status</option>
                                <option value="in_stock">In Stock</option>
                                <option value="low_stock">Low Stock</option>
                                <option value="out_of_stock">Out of Stock</option>
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
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        Loading products...
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        No products found
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-[#F8F5F1]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-16 w-16 flex-shrink-0">
                                                    <img
                                                        className="h-16 w-16 rounded-lg object-cover border border-[#C4A484]/10"
                                                        src={`https://localhost:5000${product.pictures[0]}`}
                                                        alt={product.name}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{sanitizeContent(product.name)}</div>
                                                    <div className="text-sm text-gray-500 line-clamp-1">{sanitizeContent(product.description)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{sanitizeContent(product.category)}</div>
                                            <div className="text-sm text-gray-500">{sanitizeContent(product.subCategory)}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            Nrp {sanitizeContent(product.price.toLocaleString())}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex text-sm ${product.countInStock > 0 ? (product.countInStock <= 10 ? 'text-yellow-600' : 'text-green-600') : 'text-red-600'}`}>
                                                {sanitizeContent(product.countInStock.toString())} units
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex -space-x-1">
                                                {product.colors.map((color, index) => (
                                                    <div
                                                        key={index}
                                                        className="w-6 h-6 rounded-full border-2 border-white ring-2 ring-[#C4A484]/10"
                                                        style={{ backgroundColor: color.code }}
                                                        title={sanitizeContent(color.name)}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStockStatus(product.countInStock).className}`}>
                                                {sanitizeContent(getStockStatus(product.countInStock).label)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="text-[#C4A484] hover:text-[#8B5E34] transition-colors"
                                                >
                                                    <FiEdit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(product)}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    <FiTrash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="bg-[#F8F5F1]/50 px-6 py-4 border-t border-[#C4A484]/10">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                {!isLoading && `Showing 1 to ${filteredProducts.length} of ${filteredProducts.length} products`}
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

            {/* Modals */}
            <ProductModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    fetchProducts();
                }}
                mode="add"
            />
            <ProductModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedProduct(null);
                    fetchProducts();
                }}
                product={selectedProduct}
                mode="edit"
            />
            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedProduct(null);
                }}
                onConfirm={handleDelete}
                productName={sanitizeContent(selectedProduct?.name)}
            />
        </AdminLayout>
    );
};

export default Products; 