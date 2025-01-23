{/* Category */}
<div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
    <Link 
        to={`/shop?category=${product.category}`}
        className="hover:text-[#C4A484] transition-colors"
    >
        {product.category}
    </Link>
    {product.subCategory && (
        <>
            <span>•</span>
            <Link 
                to={`/shop?category=${product.category}&subcategory=${product.subCategory}`}
                className="hover:text-[#C4A484] transition-colors"
            >
                {product.subCategory}
            </Link>
        </>
    )}
</div>

{/* Product Title */}
<h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
    {product.name}
</h1> 