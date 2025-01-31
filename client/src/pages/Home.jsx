import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiShoppingBag, FiGrid, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { getAllProductsApi, getProductCategoriesApi } from '../api/apis.js';
import { toast } from 'react-hot-toast';

const Home = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef(0);
    const dragEndX = useRef(0);
    const containerRef = useRef(null);
    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: false,
            align: 'start',
            skipSnaps: false,
            dragFree: true,
            speed: 8
        },
        [Autoplay({ delay: 4000, stopOnInteraction: true })]
    );
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState([]);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    // Hero carousel data
    const heroSlides = [
        {
            image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?ixlib=rb-4.0.3',
            title: 'New Collection',
            description: 'Transform your space with our latest furniture designs'
        },
        {
            image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3',
            title: 'Modern Living',
            description: 'Curated selection of contemporary furniture'
        },
        {
            image: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?ixlib=rb-4.0.3',
            title: 'Bedroom Dreams',
            description: 'Create your perfect sanctuary'
        }
    ];

    // Fetch products and categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsResponse, categoriesResponse] = await Promise.all([
                    getAllProductsApi(),
                    getProductCategoriesApi()
                ]);
                
                setProducts(productsResponse.data.products || []);
                setCategories(categoriesResponse.data || []);
            } catch (error) {
                toast.error('Failed to fetch data');
                setProducts([]);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle category click
    const handleCategoryClick = (categoryName) => {
        navigate(`/shop?category=${categoryName}`);
    };

    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    useEffect(() => {
        if (!isPaused) {
            intervalRef.current = setInterval(() => {
                setDirection(1);
                setCurrentSlide((prevIndex) =>
                    prevIndex === heroSlides.length - 1 ? 0 : prevIndex + 1
                );
            }, 5000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPaused]);

    const paginate = (newDirection) => {
        setDirection(newDirection);
        setCurrentSlide((prevIndex) => {
            if (newDirection === 1) {
                return prevIndex === heroSlides.length - 1 ? 0 : prevIndex + 1;
            }
            return prevIndex === 0 ? heroSlides.length - 1 : prevIndex - 1;
        });
    };

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
        }),
    };

    // Sample data for development
    const featuredProducts = [
        {
            _id: '1',
            name: 'Syltherine Sofa',
            category: 'Living Room',
            price: 2500000,
            image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?ixlib=rb-4.0.3',
            material: 'Premium Fabric',
            colors: [{ name: 'Beige', code: '#E8DCC4' }]
        },
        {
            _id: '2',
            name: 'Leviosa Bed',
            category: 'Bedroom',
            price: 3500000,
            image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3',
            material: 'Solid Wood',
            colors: [{ name: 'Walnut', code: '#773F1A' }]
        },
        {
            _id: '3',
            name: 'Lolito Dining Set',
            category: 'Dining Room',
            price: 7000000,
            image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?ixlib=rb-4.0.3',
            material: 'Oak Wood',
            colors: [{ name: 'Natural', code: '#DEB887' }]
        },
        {
            _id: '4',
            name: 'Respira Office Chair',
            category: 'Office',
            price: 500000,
            image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?ixlib=rb-4.0.3',
            material: 'Mesh & Metal',
            colors: [{ name: 'Black', code: '#000000' }]
        },
        {
            _id: '5',
            name: 'Outdoor Lounge Set',
            category: 'Outdoor',
            price: 4500000,
            image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3',
            material: 'Weather-Resistant Wicker',
            colors: [{ name: 'Gray', code: '#808080' }]
        },
        {
            _id: '6',
            name: 'Modern Wardrobe',
            category: 'Storage',
            price: 3200000,
            image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?ixlib=rb-4.0.3',
            material: 'Engineered Wood',
            colors: [{ name: 'White', code: '#FFFFFF' }]
        },
        {
            _id: '7',
            name: 'Kids Study Desk',
            category: 'Kids',
            price: 890000,
            image: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?ixlib=rb-4.0.3',
            material: 'Birch Wood',
            colors: [{ name: 'Maple', code: '#FAE5D3' }]
        },
        {
            _id: '8',
            name: 'Accent Armchair',
            category: 'Living Room',
            price: 1200000,
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3',
            material: 'Velvet',
            colors: [{ name: 'Navy Blue', code: '#000080' }]
        }
    ];

    // Categories from backend
    const backendCategories = [
        {
            name: "Living Room",
            image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
            description: "Modern comfort for your living space"
        },
        {
            name: "Bedroom",
            image: "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2",
            description: "Create your perfect sanctuary"
        },
        {
            name: "Dining Room",
            image: "https://images.unsplash.com/photo-1617806118233-18e1de247200",
            description: "Elegant dining solutions"
        },
        {
            name: "Office",
            image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36",
            description: "Professional workspace furniture"
        },
        {
            name: "Outdoor",
            image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
            description: "Enhance your outdoor living"
        },
        {
            name: "Storage",
            image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2",
            description: "Stylish storage solutions"
        },
        {
            name: "Kids",
            image: "https://images.unsplash.com/photo-1632829882891-5047ccc421bc",
            description: "Fun and functional kids' furniture"
        }
    ];

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
        onSelect();

        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onSelect]);

    const animationConfig = {
        duration: 0.3,
        staggerChildren: 0.05
    };

    return (
        <div className="w-full bg-white">
            {/* Hero Section with Carousel */}
            <div
                className="relative h-[600px] overflow-hidden bg-gradient-to-r from-[#C4A484]/90 to-transparent"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/100 via-[#C4A484]/50 to-transparent z-10"></div>

                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                        key={currentSlide}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 400, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="absolute inset-0"
                    >
                        <img
                            src={heroSlides[currentSlide].image}
                            alt={heroSlides[currentSlide].title}
                            className="w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 z-20">
                            <div className="container mx-auto h-full px-6">
                                <motion.div
                                    className="flex flex-col justify-end h-full max-w-xl pb-24"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                >

                                    <motion.h1
                                        className="text-6xl font-bold text-white mb-3 font-serif tracking-tight leading-[1.1]"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.5 }}
                                    >
                                        {heroSlides[currentSlide].title}
                                    </motion.h1>
                                    <motion.p
                                        className="text-white/90 text-lg mb-6 leading-relaxed max-w-md font-light"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5, duration: 0.5 }}
                                    >
                                        {heroSlides[currentSlide].description}
                                    </motion.p>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6, duration: 0.5 }}
                                        className="flex items-center gap-8"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="relative group"
                                        >
                                            <div className="absolute inset-0 bg-white/20 rounded-lg blur-lg group-hover:bg-[#C4A484]/20 transition-all duration-300"></div>
                                            <Link
                                                to="/shop"
                                                className="relative inline-flex items-center px-8 py-3.5 bg-[#C4A484] text-white rounded-lg hover:bg-[#B39374] transition-all duration-300 group"
                                            >
                                                <span className="relative flex items-center font-medium text-sm">
                                                    <FiShoppingBag className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                                                    Shop Collection
                                                    <motion.div
                                                        className="ml-2"
                                                        initial={{ x: 0 }}
                                                        whileHover={{ x: 4 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <FiArrowRight className="w-4 h-4" />
                                                    </motion.div>
                                                </span>
                                            </Link>
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Carousel Indicators - moved up slightly for better visibility */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setDirection(index > currentSlide ? 1 : -1);
                                setCurrentSlide(index);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'w-8 bg-white'
                                : 'w-2 bg-white/50 hover:bg-white/75'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Browse The Range */}
            <div className="py-14 bg-gradient-to-b from-[#F8F5F1] to-white relative">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C4A484' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>

                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <motion.span
                            className="text-[#C4A484] font-medium mb-4 inline-block"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: animationConfig.duration }}
                        >
                            Featured Collection
                        </motion.span>
                        <motion.h2
                            className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: animationConfig.duration, delay: 0.1 }}
                        >
                            Browse The Range
                        </motion.h2>
                        <motion.p
                            className="text-gray-600 max-w-2xl mx-auto text-lg"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: animationConfig.duration, delay: 0.2 }}
                        >
                            Discover our carefully curated collection of furniture pieces designed to transform your space
                        </motion.p>
                    </div>

                    <div className="relative px-4">
                        <div className="embla overflow-hidden" ref={emblaRef}>
                            <div className="embla__container flex">
                                {(categories.length > 0 ? categories : backendCategories).map((category, index) => (
                                    <div 
                                        key={category._id || category.name} 
                                        className="embla__slide flex-[0_0_33.33%] min-w-0 pl-8 first:pl-0"
                                    >
                                        <motion.div
                                            className="relative group"
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: animationConfig.duration, delay: index * 0.1 }}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => handleCategoryClick(category._id || category.name)}
                                        >
                                            <div className="relative h-[400px] rounded-xl overflow-hidden shadow-lg cursor-pointer bg-gradient-to-br from-[#C4A484]/10 to-[#C4A484]/5 border border-[#C4A484]/20 backdrop-blur-sm">
                                                {/* Decorative Elements */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C4A484]/5 rounded-full -translate-y-16 translate-x-16"></div>
                                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#C4A484]/5 rounded-full translate-y-20 -translate-x-20"></div>
                                                
                                                {/* Content */}
                                                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                                    <div>
                                                        <div className="w-16 h-16 rounded-2xl bg-[#C4A484]/10 flex items-center justify-center mb-6">
                                                            <FiGrid className="w-8 h-8 text-[#C4A484]" />
                                                        </div>
                                                        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                                                            {category._id || category.name}
                                                        </h3>
                                                        <p className="text-gray-600 mb-4">
                                                            {category.subcategories ? 
                                                                `${category.subcategories.length} ${category.subcategories.length === 1 ? 'item' : 'items'}` :
                                                                category.description
                                                            }
                                                        </p>
                                                    </div>
                                                    
                                                    {/* Bottom Section */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center text-[#C4A484] font-medium group-hover:text-[#B39374] transition-colors duration-300">
                                                            <span>Explore Collection</span>
                                                            <FiArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
                                                        </div>
                                                        
                                                        {/* Decorative Pattern */}
                                                        <div className="flex gap-1">
                                                            {[...Array(3)].map((_, i) => (
                                                                <div 
                                                                    key={i} 
                                                                    className="w-1.5 h-1.5 rounded-full bg-[#C4A484]/30 group-hover:bg-[#C4A484] transition-colors duration-300"
                                                                    style={{ transitionDelay: `${i * 50}ms` }}
                                                                ></div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={scrollPrev}
                            disabled={!canScrollPrev}
                        >
                            <FiChevronLeft className="w-6 h-6" />
                        </button>

                        <button
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={scrollNext}
                            disabled={!canScrollNext}
                        >
                            <FiChevronRight className="w-6 h-6" />
                        </button>

                        <div className="flex justify-center mt-8 gap-2">
                            {scrollSnaps.map((_, index) => (
                                <button
                                    key={index}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${index === selectedIndex
                                        ? 'w-8 bg-[#C4A484]'
                                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                                        }`}
                                    onClick={() => scrollTo(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Our Products */}
            <div className="py-20 bg-gradient-to-b from-white to-[#F8F5F1]">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <motion.span
                            className="text-[#C4A484] font-medium mb-3 inline-block"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: animationConfig.duration }}
                        >
                            Featured Collection
                        </motion.span>
                        <motion.h2
                            className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: animationConfig.duration, delay: 0.1 }}
                        >
                            Our Products
                        </motion.h2>
                        <motion.p
                            className="text-gray-600 max-w-2xl mx-auto text-lg"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: animationConfig.duration, delay: 0.2 }}
                        >
                            Discover our handpicked selection of premium furniture pieces
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            // Loading skeletons
                            [...Array(8)].map((_, index) => (
                                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
                                    <div className="aspect-square bg-gray-200 animate-pulse"></div>
                                    <div className="p-5 space-y-3">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                                        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                        <div className="flex justify-between items-center">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            products.slice(0, 8).map((product) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: animationConfig.duration }}
                                    whileHover={{ y: -4 }}
                                    className="group h-full"
                                >
                                    <Link to={`/product/${product._id}`} className="block h-full">
                                        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 h-full flex flex-col">
                                            <div className="relative aspect-square overflow-hidden">
                                                <img
                                                    src={`https://localhost:5000${product.pictures[0]}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-200"></div>
                                            </div>
                                            <div className="p-5 flex flex-col flex-grow">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-[#C4A484]">{product.category}</span>
                                                    <div className="flex -space-x-1">
                                                        {product.colors.map((color, index) => (
                                                            <div
                                                                key={index}
                                                                className="w-3 h-3 rounded-full border border-white shadow-sm"
                                                                style={{ backgroundColor: color.code }}
                                                                title={color.name}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-serif font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                                                <div className="flex items-center justify-between mt-auto">
                                                    <p className="text-gray-600 text-sm line-clamp-1">{product.material}</p>
                                                    <p className="font-medium text-gray-900 whitespace-nowrap">
                                                        Nrp {product.price.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            to="/shop"
                            className="inline-flex items-center px-8 py-3 bg-[#C4A484] text-white rounded-lg hover:bg-[#B39374] transition-all duration-300 group"
                        >
                            <span className="font-medium">View All Products</span>
                            <FiArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div id="contact-section" className="py-20 bg-[#F8F5F1]">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <motion.span
                                className="text-[#C4A484] font-medium mb-3 inline-block"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: animationConfig.duration }}
                            >
                                Get In Touch
                            </motion.span>
                            <motion.h2
                                className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: animationConfig.duration, delay: 0.1 }}
                            >
                                Contact Us
                            </motion.h2>
                            <motion.p
                                className="text-gray-600 max-w-2xl mx-auto text-lg"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: animationConfig.duration, delay: 0.2 }}
                            >
                                Have questions about our products? We're here to help you create your dream space
                            </motion.p>
                        </div>

                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: animationConfig.duration, delay: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        >
                            <div className="flex items-start space-x-4 bg-white p-6 rounded-xl border border-[#C4A484]/10">
                                <div className="w-10 h-10 rounded-full bg-[#C4A484]/10 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-[#C4A484]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">Visit Our Store</h3>
                                    <p className="text-gray-600">123 Furniture Street, Design District<br />Kathmandu, Nepal</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4 bg-white p-6 rounded-xl border border-[#C4A484]/10">
                                <div className="w-10 h-10 rounded-full bg-[#C4A484]/10 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-[#C4A484]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">Email Us</h3>
                                    <p className="text-gray-600">info@furnishion.com<br />support@furnishion.com</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4 bg-white p-6 rounded-xl border border-[#C4A484]/10">
                                <div className="w-10 h-10 rounded-full bg-[#C4A484]/10 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-[#C4A484]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">Call Us</h3>
                                    <p className="text-gray-600">+977 1234567890<br />Mon - Sat: 9:00 AM - 6:00 PM</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home; 