import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
            setProduct(data);
        } catch (error) {
            toast.error('Failed to fetch product details');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/cart', {
                productId: id,
                quantity
            });
            toast.success('Added to cart successfully');
            navigate('/cart');
        } catch (error) {
            toast.error('Failed to add to cart');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-auto object-cover rounded-lg"
                    />
                </div>

                {/* Product Info */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
                    <p className="text-gray-600 mb-4">{product.description}</p>

                    <div className="mb-6">
                        <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                        <span className="ml-2 text-sm text-gray-500">
                            {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Specifications:</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600"><span className="font-medium">Brand:</span> {product.brand}</p>
                                <p className="text-gray-600"><span className="font-medium">Category:</span> {product.category}</p>
                                <p className="text-gray-600"><span className="font-medium">Processor:</span> {product.specifications.processor}</p>
                                <p className="text-gray-600"><span className="font-medium">RAM:</span> {product.specifications.ram}</p>
                            </div>
                            <div>
                                <p className="text-gray-600"><span className="font-medium">Storage:</span> {product.specifications.storage}</p>
                                <p className="text-gray-600"><span className="font-medium">Display:</span> {product.specifications.display}</p>
                                <p className="text-gray-600"><span className="font-medium">Graphics:</span> {product.specifications.graphics}</p>
                                <p className="text-gray-600"><span className="font-medium">Battery:</span> {product.specifications.battery}</p>
                            </div>
                        </div>
                    </div>

                    {product.countInStock > 0 && (
                        <div className="flex items-center space-x-4 mb-6">
                            <label className="text-gray-700">Quantity:</label>
                            <select
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="border rounded-md p-2"
                            >
                                {[...Array(Math.min(product.countInStock, 10))].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        onClick={handleAddToCart}
                        disabled={product.countInStock === 0}
                        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails; 