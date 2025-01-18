import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

const ProductDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState('Black');

    // Sample product data (replace with actual API call)
    const product = {
        name: 'Modern Leather Sofa',
        description: 'Experience luxury and comfort with our Modern Leather Sofa. Crafted with premium leather and a solid wood frame, this sofa combines contemporary design with exceptional durability. Perfect for both modern and traditional living spaces, it offers unmatched comfort and timeless elegance.',
        price: 2499999,
        originalPrice: 2799999,
        inStock: true,
        rating: 4.8,
        reviews: 24,
        specs: {
            material: 'Premium Leather',
            frame: 'Solid Wood',
            colors: [
                { name: 'Black', code: '#000000' },
                { name: 'Brown', code: '#8B4513' },
                { name: 'Tan', code: '#D2B48C' }
            ],
            dimensions: {
                width: 220,
                height: 85,
                depth: 95
            },
            weight: '45 kg'
        },
        features: [
            'Premium leather upholstery',
            'High-density foam cushions',
            'Solid wood frame construction',
            'Ergonomic design for maximum comfort',
            'Stain-resistant coating'
        ],
        images: [
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3',
            'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3',
            'https://images.unsplash.com/photo-1550226891-ef816aed4a98?ixlib=rb-4.0.3',
            'https://images.unsplash.com/photo-1567016432779-094069958ea5?ixlib=rb-4.0.3'
        ]
    };

    // Hide category section when on product details page
    useEffect(() => {
        const body = document.body;
        body.classList.add('hide-categories');
        return () => body.classList.remove('hide-categories');
    }, []);

    return (
        <div className="max-w-[2000px] mx-auto px-6 py-8 bg-white">
            <div className="flex flex-col lg:flex-row gap-12">
                {/* Left Column - Images */}
                <div className="lg:w-1/2">
                    <div className="aspect-w-16 aspect-h-12 rounded-xl overflow-hidden mb-4">
                        <img
                            src={product.images[selectedImage]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {product.images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`aspect-w-1 aspect-h-1 rounded-xl overflow-hidden border-2 ${selectedImage === index ? 'border-[#C4A484]' : 'border-transparent'
                                    }`}
                            >
                                <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Column - Product Info */}
                <div className="lg:w-1/2">
                    {/* Status and Rating */}
                    <div className="flex items-center justify-between mb-6">
                        {product.inStock ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">In Stock</span>
                        ) : (
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Out of Stock</span>
                        )}
                        <div className="flex items-center gap-2">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-[#C4A484]' : 'text-gray-300'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-gray-600">({product.reviews} reviews)</span>
                        </div>
                    </div>

                    {/* Product Title and Description */}
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">{product.name}</h1>
                    <p className="text-gray-600 mb-8">{product.description}</p>

                    {/* Price */}
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-3xl font-bold text-[#8B5E34]">Rp {product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                            <span className="text-xl text-gray-400 line-through">Rp {product.originalPrice.toLocaleString()}</span>
                        )}
                    </div>

                    {/* Key Specifications */}
                    <div className="bg-[#F8F5F1] rounded-xl p-6 mb-8">
                        <h3 className="text-lg font-serif font-semibold text-gray-900 mb-4">Product Details</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Dimensions</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>Width: {product.specs.dimensions.width} cm</p>
                                    <p>Height: {product.specs.dimensions.height} cm</p>
                                    <p>Depth: {product.specs.dimensions.depth} cm</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Material & Weight</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>Material: {product.specs.material}</p>
                                    <p>Frame: {product.specs.frame}</p>
                                    <p>Weight: {product.specs.weight}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mb-8">
                        <h3 className="text-lg font-serif font-semibold text-gray-900 mb-4">Key Features</h3>
                        <ul className="space-y-2">
                            {product.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-gray-600">
                                    <svg className="w-5 h-5 text-[#C4A484]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Color Selection */}
                    <div className="mb-8">
                        <h3 className="text-lg font-serif font-semibold text-gray-900 mb-4">Color</h3>
                        <div className="flex gap-4">
                            {product.specs.colors.map(color => (
                                <button
                                    key={color.name}
                                    onClick={() => setSelectedColor(color.name)}
                                    className={`group relative w-12 h-12 rounded-full ${selectedColor === color.name ? 'ring-2 ring-[#C4A484] ring-offset-2' : ''
                                        }`}
                                >
                                    <div
                                        className="w-full h-full rounded-full"
                                        style={{ backgroundColor: color.code }}
                                    />
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {color.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Add to Cart and Wishlist */}
                    <div className="flex gap-4">
                        <button className="flex-1 bg-[#C4A484] text-white px-8 py-3 rounded-xl hover:bg-[#B39374] transition-colors">
                            Add to Cart
                        </button>
                        <button className="p-3 rounded-xl border border-[#C4A484]/20 hover:border-[#C4A484] transition-colors">
                            <FaHeart className="w-6 h-6 text-gray-400 hover:text-[#C4A484]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails; 